import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { nextDocNumber } from '../utils/sequence';
import { filesToImages } from '../middleware/upload';
import { uploadDataUrl } from '../config/cloudinary';
import { Job, JobDoc, JobStatus } from '../models/Job';
import { ServiceRequest } from '../models/ServiceRequest';
import { Quotation } from '../models/Quotation';
import { User } from '../models/User';
import { notify, notifyRole } from '../services/notify';

const DEFAULT_CHECKLIST: Record<string, string[]> = {
  installation: [
    'Confirm equipment model against the quotation',
    'Isolate power and verify lockout',
    'Set and level new unit',
    'Braze and pressure-test line set',
    'Evacuate to 500 microns',
    'Commission and record operating pressures',
    'Walk the customer through the controls',
  ],
  repair: [
    'Confirm reported fault with the customer',
    'Measure supply and return temperatures',
    'Inspect electrical connections and capacitor',
    'Check refrigerant charge',
    'Replace failed component',
    'Verify operation across a full cycle',
  ],
  maintenance: [
    'Replace or clean air filter',
    'Clean condenser coil',
    'Flush condensate drain',
    'Inspect blower assembly',
    'Test thermostat calibration',
    'Record system performance readings',
  ],
  inspection: [
    'Visual inspection of indoor and outdoor units',
    'Measure static pressure',
    'Check ductwork for leakage',
    'Inspect electrical safeties',
    'Photograph findings',
    'Compile recommendations',
  ],
};

function checklistFor(serviceType: string): { label: string; done: boolean }[] {
  const items = DEFAULT_CHECKLIST[serviceType] ?? DEFAULT_CHECKLIST.maintenance;
  return items.map((label) => ({ label, done: false }));
}

/** Warns the dispatcher when a technician already has overlapping work. */
async function findScheduleConflict(
  technicianId: string,
  start: Date,
  end: Date,
  ignoreJobId?: string,
) {
  const filter: FilterQuery<JobDoc> = {
    technician: technicianId,
    status: { $nin: ['completed', 'cancelled'] },
    scheduledStart: { $lt: end },
    scheduledEnd: { $gt: start },
  };
  if (ignoreJobId) filter._id = { $ne: ignoreJobId };
  return Job.findOne(filter).select('jobNumber scheduledStart scheduledEnd');
}

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const { serviceRequest: requestId, technician, scheduledStart, durationMinutes = 120, priority } = req.body;

  const request = await ServiceRequest.findById(requestId);
  if (!request) throw ApiError.notFound('Service request not found');
  if (!request.customer) throw ApiError.badRequest('Link this request to a customer account first');
  if (request.job) throw ApiError.conflict('A job already exists for this request');
  if (!scheduledStart) throw ApiError.badRequest('A scheduled start time is required');

  const start = new Date(scheduledStart);
  const end = new Date(start.getTime() + Number(durationMinutes) * 60000);

  if (technician) {
    const conflict = await findScheduleConflict(technician, start, end);
    if (conflict) {
      throw ApiError.conflict(
        `That technician is already booked on ${conflict.jobNumber} during this window`,
      );
    }
  }

  const quotation = await Quotation.findOne({ serviceRequest: request._id, status: 'accepted' });

  const job = await Job.create({
    jobNumber: await nextDocNumber(Job, 'jobNumber', 'JOB'),
    serviceRequest: request._id,
    quotation: quotation?._id,
    customer: request.customer,
    technician: technician || undefined,
    title: request.title,
    serviceType: request.serviceType,
    priority: priority || request.priority,
    status: technician ? 'assigned' : 'unassigned',
    address: request.address,
    scheduledStart: start,
    scheduledEnd: end,
    checklist: checklistFor(request.serviceType),
    timeline: [{ status: technician ? 'assigned' : 'unassigned', note: 'Job created', at: new Date() }],
  });

  request.job = job._id;
  request.status = 'scheduled';
  request.timeline.push({ status: 'scheduled', note: `Job ${job.jobNumber} scheduled`, at: new Date() });
  await request.save();

  await notify({
    user: request.customer,
    type: 'technician_assigned',
    title: 'Your visit is scheduled',
    message: `${job.jobNumber} is booked for ${start.toLocaleString('en-US')}.`,
    link: '/dashboard/customer/requests',
  });

  if (technician) {
    await notify({
      user: technician,
      type: 'technician_assigned',
      title: 'New job assigned',
      message: `${job.title} — ${start.toLocaleString('en-US')} at ${job.address.city}.`,
      link: `/dashboard/technician/jobs/${job.id}`,
    });
    await User.findByIdAndUpdate(technician, { 'technician.status': 'on_job' });
  }

  res.status(201).json({ success: true, data: job });
});

export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter: FilterQuery<JobDoc> = {};

  if (user.role === 'technician') filter.technician = user._id;
  if (user.role === 'customer') filter.customer = user._id;
  if (req.query.technician) filter.technician = req.query.technician;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;

  if (req.query.date) {
    const day = new Date(String(req.query.date));
    const dayStart = new Date(day.setHours(0, 0, 0, 0));
    const dayEnd = new Date(day.setHours(23, 59, 59, 999));
    filter.scheduledStart = { $gte: dayStart, $lte: dayEnd };
  } else if (req.query.from || req.query.to) {
    filter.scheduledStart = {};
    if (req.query.from) Object.assign(filter.scheduledStart, { $gte: new Date(String(req.query.from)) });
    if (req.query.to) Object.assign(filter.scheduledStart, { $lte: new Date(String(req.query.to)) });
  }

  const jobs = await Job.find(filter)
    .populate('customer', 'name email phone avatarUrl')
    .populate('technician', 'name phone avatarUrl technician')
    .populate('serviceRequest', 'trackingCode description photos')
    .sort({ scheduledStart: 1 })
    .limit(Number(req.query.limit) || 300);

  res.json({ success: true, count: jobs.length, data: jobs });
});

export const getJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id)
    .populate('customer', 'name email phone avatarUrl customer')
    .populate('technician', 'name phone email avatarUrl technician')
    .populate('serviceRequest', 'trackingCode description photos serviceType priority systemBrand systemAge')
    .populate('quotation', 'quoteNumber total lineItems')
    .populate('invoice', 'invoiceNumber total status');

  if (!job) throw ApiError.notFound('Job not found');

  const user = req.user!;
  const ownerId = String(job.customer?._id ?? job.customer);
  const techId = job.technician ? String(job.technician._id ?? job.technician) : null;
  if (user.role === 'customer' && ownerId !== user.id) throw ApiError.forbidden();
  if (user.role === 'technician' && techId !== user.id) throw ApiError.forbidden();

  res.json({ success: true, data: job });
});

/** Dispatcher assigns or reassigns a technician. */
export const assignTechnician = asyncHandler(async (req: Request, res: Response) => {
  const { technician, scheduledStart, durationMinutes } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');

  const tech = await User.findOne({ _id: technician, role: 'technician' });
  if (!tech) throw ApiError.badRequest('That technician does not exist');

  const start = scheduledStart ? new Date(scheduledStart) : job.scheduledStart;
  const end = durationMinutes
    ? new Date(start.getTime() + Number(durationMinutes) * 60000)
    : new Date(start.getTime() + (job.scheduledEnd.getTime() - job.scheduledStart.getTime()));

  const conflict = await findScheduleConflict(technician, start, end, job.id);
  if (conflict) {
    throw ApiError.conflict(`${tech.name} is already booked on ${conflict.jobNumber} in that window`);
  }

  job.technician = tech._id;
  job.scheduledStart = start;
  job.scheduledEnd = end;
  if (job.status === 'unassigned') job.status = 'assigned';
  job.timeline.push({
    status: 'assigned',
    note: `Assigned to ${tech.name}`,
    at: new Date(),
    by: req.user!._id,
  });
  await job.save();

  await notify({
    user: tech._id,
    type: 'technician_assigned',
    title: 'New job assigned',
    message: `${job.title} — ${start.toLocaleString('en-US')}.`,
    link: `/dashboard/technician/jobs/${job.id}`,
  });
  await notify({
    user: job.customer,
    type: 'technician_assigned',
    title: 'Technician assigned',
    message: `${tech.name} will handle ${job.jobNumber} on ${start.toLocaleDateString('en-US')}.`,
    link: '/dashboard/customer/requests',
  });

  res.json({ success: true, data: job });
});

export const rescheduleJob = asyncHandler(async (req: Request, res: Response) => {
  const { scheduledStart, durationMinutes = 120, reason } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');

  const start = new Date(scheduledStart);
  const end = new Date(start.getTime() + Number(durationMinutes) * 60000);

  if (job.technician) {
    const conflict = await findScheduleConflict(String(job.technician), start, end, job.id);
    if (conflict) throw ApiError.conflict(`Conflicts with ${conflict.jobNumber}`);
  }

  job.scheduledStart = start;
  job.scheduledEnd = end;
  job.timeline.push({ status: 'rescheduled', note: reason, at: new Date(), by: req.user!._id });
  await job.save();

  await notify({
    user: job.customer,
    type: 'appointment_reminder',
    title: 'Visit rescheduled',
    message: `${job.jobNumber} now takes place on ${start.toLocaleString('en-US')}.`,
    link: '/dashboard/customer/requests',
  });

  res.json({ success: true, data: job });
});

/** Technician status transitions: en_route → in_progress → completed. */
export const updateJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body as { status: JobStatus; note?: string };
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');

  const user = req.user!;
  if (user.role === 'technician' && String(job.technician) !== user.id) throw ApiError.forbidden();

  if (status === 'completed' && !job.report) {
    throw ApiError.badRequest('Submit the service report before closing the job');
  }

  job.status = status;
  if (status === 'in_progress' && !job.startedAt) job.startedAt = new Date();
  if (status === 'completed') {
    job.completedAt = new Date();
    await ServiceRequest.findByIdAndUpdate(job.serviceRequest, {
      status: 'completed',
      $push: { timeline: { status: 'completed', note: 'Work completed', at: new Date() } },
    });
    if (job.technician) {
      await User.findByIdAndUpdate(job.technician, {
        $inc: { 'technician.jobsCompleted': 1 },
        'technician.status': 'available',
      });
    }
    await notify({
      user: job.customer,
      type: 'job_completed',
      title: 'Work completed',
      message: `${job.jobNumber} is complete. Your service report is available now.`,
      link: '/dashboard/customer/requests',
    });
    await notifyRole(['admin'], {
      type: 'job_completed',
      title: 'Job completed — ready to invoice',
      message: `${job.jobNumber} (${job.title}) was closed out.`,
      link: '/dashboard/admin/invoices',
    });
  } else if (status === 'in_progress') {
    await ServiceRequest.findByIdAndUpdate(job.serviceRequest, { status: 'in_progress' });
  }

  job.timeline.push({ status, note, at: new Date(), by: user._id });
  await job.save();

  res.json({ success: true, data: job });
});

export const toggleChecklistItem = asyncHandler(async (req: Request, res: Response) => {
  const { index, done } = req.body;
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');
  if (!job.checklist[index]) throw ApiError.badRequest('No checklist item at that position');

  job.checklist[index].done = Boolean(done);
  await job.save();
  res.json({ success: true, data: job.checklist });
});

export const addJobNote = asyncHandler(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');
  if (!req.body.text) throw ApiError.badRequest('Note text is required');

  job.notes.push({ text: req.body.text, by: req.user!._id, at: new Date() });
  await job.save();
  res.json({ success: true, data: job.notes });
});

export const uploadJobPhotos = asyncHandler(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');

  const phase = req.body.phase === 'after' ? 'after' : 'before';
  const images = filesToImages(req.files as Express.Multer.File[]);
  if (!images.length) throw ApiError.badRequest('No images were received');

  images.forEach((img) =>
    job.photos.push({ ...img, phase, caption: req.body.caption, uploadedAt: new Date() }),
  );
  await job.save();

  res.status(201).json({ success: true, data: job.photos });
});

/** Stores the customer's on-site signature (base64 canvas export → Cloudinary). */
export const captureSignature = asyncHandler(async (req: Request, res: Response) => {
  const { dataUrl, signedBy } = req.body;
  if (!dataUrl || !signedBy) throw ApiError.badRequest('Signature image and signer name are required');

  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');

  const url = await uploadDataUrl(dataUrl, `signatures/${job.jobNumber}`);
  job.signature = { url, signedBy, signedAt: new Date() };
  await job.save();

  res.json({ success: true, data: job.signature });
});

export const submitReport = asyncHandler(async (req: Request, res: Response) => {
  const { summary, workPerformed, partsUsed, recommendations, laborHours } = req.body;
  if (!summary || !workPerformed) {
    throw ApiError.badRequest('A summary and a description of the work performed are required');
  }

  const job = await Job.findById(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');

  const user = req.user!;
  if (user.role === 'technician' && String(job.technician) !== user.id) throw ApiError.forbidden();

  job.report = {
    summary,
    workPerformed,
    partsUsed: Array.isArray(partsUsed) ? partsUsed : [],
    recommendations,
    laborHours: Number(laborHours) || 1,
    submittedAt: new Date(),
  };
  job.timeline.push({ status: 'report_submitted', at: new Date(), by: user._id });
  await job.save();

  res.json({ success: true, data: job.report });
});

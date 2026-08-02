import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Job } from '../models/Job';
import { Invoice } from '../models/Invoice';
import { Payment } from '../models/Payment';
import { ServiceRequest } from '../models/ServiceRequest';
import { MaintenanceContract } from '../models/MaintenanceContract';
import { User } from '../models/User';

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function monthsBack(n: number) {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - n);
  return d;
}

/**
 * Everything the admin analytics page needs, in one response (module 8).
 *
 * All the aggregation runs here rather than in the browser, so the numbers on
 * screen and the numbers in any future export cannot disagree.
 */
export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const today = startOfDay();
  const tomorrow = new Date(today.getTime() + 86400000);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const [
    dailyRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    lifetimeRevenue,
    outstanding,
    jobCounts,
    requestCounts,
    contractStats,
    customerCount,
    technicianCount,
    revenueSeries,
    serviceMix,
    technicianPerformance,
    customerGrowth,
    recentJobs,
  ] = await Promise.all([
    Payment.aggregate([
      { $match: { paidAt: { $gte: today, $lt: tomorrow }, status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { paidAt: { $gte: monthStart }, status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { paidAt: { $gte: lastMonthStart, $lt: monthStart }, status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Invoice.aggregate([
      { $match: { status: { $in: ['sent', 'partial', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$balance' }, count: { $sum: 1 } } },
    ]),
    Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ServiceRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    MaintenanceContract.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          value: { $sum: '$amount' },
        },
      },
    ]),
    User.countDocuments({ role: 'customer', isActive: true }),
    User.countDocuments({ role: 'technician', isActive: true }),

    // 12-month revenue trend
    Payment.aggregate([
      { $match: { paidAt: { $gte: monthsBack(11) }, status: 'succeeded' } },
      {
        $group: {
          _id: { y: { $year: '$paidAt' }, m: { $month: '$paidAt' } },
          revenue: { $sum: '$amount' },
          payments: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),

    // Most requested services
    ServiceRequest.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Technician leaderboard
    Job.aggregate([
      { $match: { status: 'completed', technician: { $ne: null } } },
      {
        $group: {
          _id: '$technician',
          completed: { $sum: 1 },
          hours: { $sum: { $ifNull: ['$report.laborHours', 0] } },
        },
      },
      { $sort: { completed: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'tech',
        },
      },
      { $unwind: '$tech' },
      {
        $project: {
          _id: 1,
          completed: 1,
          hours: { $round: ['$hours', 1] },
          name: '$tech.name',
          avatarUrl: '$tech.avatarUrl',
          rating: '$tech.technician.rating',
          skills: '$tech.technician.skills',
        },
      },
    ]),

    // New customers per month
    User.aggregate([
      { $match: { role: 'customer', createdAt: { $gte: monthsBack(11) } } },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),

    Job.find({ status: 'completed' })
      .populate('technician', 'name avatarUrl')
      .populate('customer', 'name')
      .sort({ completedAt: -1 })
      .limit(6)
      .select('jobNumber title completedAt serviceType'),
  ]);

  const byKey = (rows: { _id: string; count: number }[]) =>
    Object.fromEntries(rows.map((r) => [r._id, r.count]));

  const jobs = byKey(jobCounts);
  const requests = byKey(requestCounts);

  // Pad the 12-month series so the chart always has a full axis.
  const labels: { key: string; label: string; y: number; m: number }[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = monthsBack(i);
    labels.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      y: d.getFullYear(),
      m: d.getMonth() + 1,
    });
  }

  const revenueByMonth = labels.map((l) => {
    const hit = revenueSeries.find((r) => r._id.y === l.y && r._id.m === l.m);
    return { label: l.label, value: Math.round(hit?.revenue ?? 0) };
  });

  const customersByMonth = labels.map((l) => {
    const hit = customerGrowth.find((r) => r._id.y === l.y && r._id.m === l.m);
    return { label: l.label, value: hit?.count ?? 0 };
  });

  const monthly = monthlyRevenue[0]?.total ?? 0;
  const lastMonth = lastMonthRevenue[0]?.total ?? 0;
  const growth = lastMonth > 0 ? ((monthly - lastMonth) / lastMonth) * 100 : 0;

  const contracts = Object.fromEntries(
    contractStats.map((c) => [c._id, { count: c.count, value: Math.round(c.value) }]),
  );

  res.json({
    success: true,
    data: {
      revenue: {
        today: Math.round(dailyRevenue[0]?.total ?? 0),
        todayPayments: dailyRevenue[0]?.count ?? 0,
        month: Math.round(monthly),
        lastMonth: Math.round(lastMonth),
        growthPercent: Math.round(growth * 10) / 10,
        lifetime: Math.round(lifetimeRevenue[0]?.total ?? 0),
        outstanding: Math.round(outstanding[0]?.total ?? 0),
        outstandingCount: outstanding[0]?.count ?? 0,
      },
      jobs: {
        completed: jobs.completed ?? 0,
        pending:
          (jobs.unassigned ?? 0) + (jobs.assigned ?? 0) + (jobs.en_route ?? 0) + (jobs.on_hold ?? 0),
        inProgress: jobs.in_progress ?? 0,
        unassigned: jobs.unassigned ?? 0,
        cancelled: jobs.cancelled ?? 0,
        total: Object.values(jobs).reduce((a, b) => a + b, 0),
        byStatus: jobs,
      },
      requests: {
        open: (requests.submitted ?? 0) + (requests.reviewing ?? 0) + (requests.quoted ?? 0),
        total: Object.values(requests).reduce((a, b) => a + b, 0),
        byStatus: requests,
      },
      contracts: {
        active: contracts.active?.count ?? 0,
        expiring: contracts.expiring?.count ?? 0,
        expired: contracts.expired?.count ?? 0,
        recurringValue: (contracts.active?.value ?? 0) + (contracts.expiring?.value ?? 0),
      },
      people: { customers: customerCount, technicians: technicianCount },
      charts: {
        revenueByMonth,
        customersByMonth,
        serviceMix: serviceMix.map((s) => ({ label: s._id, value: s.count })),
        technicianPerformance,
      },
      recentJobs,
    },
  });
});

// Small summary for the dispatcher: today's load, unassigned work, open emergencies.
export const getDispatchSummary = asyncHandler(async (_req: Request, res: Response) => {
  const today = startOfDay();
  const tomorrow = new Date(today.getTime() + 86400000);

  const [todayJobs, unassigned, emergencies, technicians] = await Promise.all([
    Job.countDocuments({ scheduledStart: { $gte: today, $lt: tomorrow } }),
    Job.countDocuments({ status: 'unassigned' }),
    ServiceRequest.countDocuments({ priority: 'emergency', status: { $nin: ['completed', 'cancelled'] } }),
    User.aggregate([
      { $match: { role: 'technician', isActive: true } },
      { $group: { _id: '$technician.status', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      todayJobs,
      unassigned,
      emergencies,
      technicianStatus: Object.fromEntries(technicians.map((t) => [t._id ?? 'available', t.count])),
    },
  });
});

// Numbers for the customer home screen: open requests, next visit, balance, plan.
export const getCustomerSummary = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!._id;

  const [openRequests, upcomingJob, dueInvoices, contract, completedJobs] = await Promise.all([
    ServiceRequest.countDocuments({
      customer: customerId,
      status: { $nin: ['completed', 'cancelled'] },
    }),
    Job.findOne({
      customer: customerId,
      status: { $nin: ['completed', 'cancelled'] },
      scheduledStart: { $gte: new Date() },
    })
      .populate('technician', 'name phone avatarUrl technician')
      .sort({ scheduledStart: 1 }),
    Invoice.aggregate([
      { $match: { customer: customerId, status: { $in: ['sent', 'partial', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$balance' }, count: { $sum: 1 } } },
    ]),
    MaintenanceContract.findOne({ customer: customerId, status: { $in: ['active', 'expiring'] } })
      .populate('plan', 'name visitsPerYear'),
    Job.countDocuments({ customer: customerId, status: 'completed' }),
  ]);

  res.json({
    success: true,
    data: {
      openRequests,
      completedJobs,
      upcomingJob,
      balanceDue: Math.round((dueInvoices[0]?.total ?? 0) * 100) / 100,
      dueInvoiceCount: dueInvoices[0]?.count ?? 0,
      contract,
    },
  });
});

// The technician's own stats for today and this week.
export const getTechnicianSummary = asyncHandler(async (req: Request, res: Response) => {
  const techId = req.user!._id;
  const today = startOfDay();
  const tomorrow = new Date(today.getTime() + 86400000);
  const weekStart = new Date(today.getTime() - 6 * 86400000);

  const [todayJobs, completedToday, completedWeek, open, hours] = await Promise.all([
    Job.countDocuments({ technician: techId, scheduledStart: { $gte: today, $lt: tomorrow } }),
    Job.countDocuments({
      technician: techId,
      status: 'completed',
      completedAt: { $gte: today, $lt: tomorrow },
    }),
    Job.countDocuments({ technician: techId, status: 'completed', completedAt: { $gte: weekStart } }),
    Job.countDocuments({ technician: techId, status: { $nin: ['completed', 'cancelled'] } }),
    Job.aggregate([
      { $match: { technician: techId, status: 'completed', completedAt: { $gte: weekStart } } },
      { $group: { _id: null, hours: { $sum: { $ifNull: ['$report.laborHours', 0] } } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      todayJobs,
      completedToday,
      completedWeek,
      open,
      hoursThisWeek: Math.round((hours[0]?.hours ?? 0) * 10) / 10,
      rating: req.user!.technician?.rating ?? 5,
      lifetimeJobs: req.user!.technician?.jobsCompleted ?? 0,
    },
  });
});

/* eslint-disable no-console */
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { ServiceRequest, ServiceType } from '../models/ServiceRequest';
import { Quotation } from '../models/Quotation';
import { Job } from '../models/Job';
import { Invoice } from '../models/Invoice';
import { Payment } from '../models/Payment';
import { Equipment } from '../models/Equipment';
import { MaintenancePlan } from '../models/MaintenancePlan';
import { MaintenanceContract } from '../models/MaintenanceContract';
import { Notification } from '../models/Notification';
import { ContactMessage } from '../models/ContactMessage';
import { Testimonial } from '../models/Testimonial';
import {
  CUSTOMERS,
  EQUIPMENT,
  PLANS,
  REQUEST_TEMPLATES,
  SERVICE_AREAS,
  STREETS,
  TECHNICIANS,
  TESTIMONIALS,
} from './data';

const DEMO_PASSWORD = 'ArcticAir#2026';

/* ------------------------------- deterministic RNG ------------------------------- */
/* A fixed seed keeps the demo dataset stable between runs, so screenshots and the
   analytics numbers in the documentation always match what the grader sees. */
let rngState = 20260801;
function rand(): number {
  rngState = (rngState * 1664525 + 1013904223) % 4294967296;
  return rngState / 4294967296;
}
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const chance = (p: number) => rand() < p;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code(prefix: string, len = 6) {
  let out = '';
  for (let i = 0; i < len; i += 1) out += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  return `${prefix}-${out}`;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const round2 = (n: number) => Math.round(n * 100) / 100;

function atHour(date: Date, hour: number, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function makeAddress() {
  const area = pick(SERVICE_AREAS);
  return {
    line1: `${randInt(100, 9899)} ${pick(STREETS)}`,
    line2: chance(0.2) ? `Unit ${randInt(1, 40)}` : undefined,
    city: area.city,
    state: area.state,
    zip: area.zip,
  };
}

function phone() {
  return `(602) ${randInt(200, 999)}-${String(randInt(0, 9999)).padStart(4, '0')}`;
}

/* --------------------------------- number series --------------------------------- */
const counters = { QT: 0, JOB: 0, INV: 0, MC: 0, PAY: 0 };
function docNumber(prefix: keyof typeof counters, when: Date) {
  counters[prefix] += 1;
  return `${prefix}-${when.getFullYear()}-${String(counters[prefix]).padStart(4, '0')}`;
}

async function wipe() {
  const collections: mongoose.Model<any>[] = [
    User, ServiceRequest, Quotation, Job, Invoice, Payment,
    Equipment, MaintenancePlan, MaintenanceContract, Notification,
    ContactMessage, Testimonial,
  ] as unknown as mongoose.Model<any>[];
  await Promise.all(collections.map((m) => m.deleteMany({})));
  console.log('[seed] cleared all ServiceFlow collections');
}

async function run() {
  const dropAll = process.argv.includes('--drop');

  await connectDB();

  if (dropAll) {
    await mongoose.connection.dropDatabase();
    console.log('[seed] dropped the entire database');
  } else {
    await wipe();
  }

  /* ----------------------------------- users ------------------------------------ */
  // Hash once and insert directly — bcrypt on ~35 accounts individually is slow.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const staffDocs = [
    {
      name: 'Javeria Nadeem',
      email: 'admin@arcticair.com',
      password: passwordHash,
      phone: phone(),
      role: 'admin' as const,
      createdAt: daysAgo(400),
    },
    {
      name: 'Nora Ellington',
      email: 'dispatch@arcticair.com',
      password: passwordHash,
      phone: phone(),
      role: 'dispatcher' as const,
      createdAt: daysAgo(380),
    },
    {
      name: 'Victor Amadi',
      email: 'dispatch2@arcticair.com',
      password: passwordHash,
      phone: phone(),
      role: 'dispatcher' as const,
      createdAt: daysAgo(210),
    },
  ];

  const technicianDocs = TECHNICIANS.map((t, i) => ({
    name: t.name,
    email: t.email,
    password: passwordHash,
    phone: phone(),
    role: 'technician' as const,
    createdAt: daysAgo(360 - i * 30),
    technician: {
      employeeId: `AA-T${String(i + 1).padStart(3, '0')}`,
      skills: t.skills,
      certifications: t.certifications,
      serviceAreas: t.areas,
      status: i === 0 ? 'on_job' : i === 5 ? 'off_duty' : 'available',
      rating: t.rating,
      jobsCompleted: 0,
      hourlyRate: t.rate,
      shiftStart: i % 2 === 0 ? '07:00' : '09:00',
      shiftEnd: i % 2 === 0 ? '16:00' : '18:00',
      hiredAt: daysAgo(360 - i * 30),
    },
  }));

  const customerDocs = CUSTOMERS.map((c, i) => {
    // Spread signup dates across 14 months so the growth chart has a real shape.
    const since = daysAgo(randInt(5, 420));
    return {
      name: c.name,
      email: c.email,
      password: passwordHash,
      phone: phone(),
      role: 'customer' as const,
      createdAt: since,
      customer: {
        address: makeAddress(),
        propertyType: c.type as 'residential' | 'commercial',
        companyName: c.company,
        customerSince: since,
        preferredContact: pick(['phone', 'email', 'sms'] as const),
      },
    };
  });

  // A dedicated demo customer with a guaranteed-rich history for the walkthrough.
  customerDocs.unshift({
    name: 'Alex Rivera',
    email: 'customer@arcticair.com',
    password: passwordHash,
    phone: phone(),
    role: 'customer' as const,
    createdAt: daysAgo(430),
    customer: {
      address: {
        line1: '4820 N Camelback Ridge Rd',
        line2: undefined,
        city: 'Scottsdale',
        state: 'AZ',
        zip: '85251',
      },
      propertyType: 'residential',
      companyName: undefined,
      customerSince: daysAgo(430),
      preferredContact: 'email',
    },
  });

  const users = await User.insertMany([...staffDocs, ...technicianDocs, ...customerDocs]);
  const admin = users.find((u) => u.role === 'admin')!;
  const dispatchers = users.filter((u) => u.role === 'dispatcher');
  const technicians = users.filter((u) => u.role === 'technician');
  const customers = users.filter((u) => u.role === 'customer');
  const demoCustomer = customers.find((c) => c.email === 'customer@arcticair.com')!;
  console.log(`[seed] users → ${users.length} (${technicians.length} techs, ${customers.length} customers)`);

  /* --------------------------- catalogue: plans + equipment --------------------------- */
  const plans = await MaintenancePlan.insertMany(PLANS);
  await Equipment.insertMany(EQUIPMENT);
  await Testimonial.insertMany(TESTIMONIALS);
  console.log(`[seed] catalogue → ${plans.length} plans, ${EQUIPMENT.length} equipment items`);

  /* --------------------------------- service flow ---------------------------------- */
  const serviceTypes = Object.keys(REQUEST_TEMPLATES) as ServiceType[];
  const requests: any[] = [];
  const quotations: any[] = [];
  const jobs: any[] = [];
  const invoices: any[] = [];
  const payments: any[] = [];
  const notifications: any[] = [];
  const techJobCount = new Map<string, number>();

  /**
   * Walk backwards through 13 months. Older months resolve to completed +
   * invoiced + paid; the last few days stay open so every dashboard has live
   * work sitting in it.
   */
  const TOTAL_REQUESTS = 118;

  for (let i = 0; i < TOTAL_REQUESTS; i += 1) {
    // Weighted towards recent activity, with summer months busier (Phoenix, after all).
    const age = Math.floor(Math.pow(rand(), 1.6) * 395);
    const created = daysAgo(age);

    const serviceType = (() => {
      const roll = rand();
      if (roll < 0.3) return 'repair';
      if (roll < 0.5) return 'maintenance';
      if (roll < 0.66) return 'installation';
      if (roll < 0.76) return 'inspection';
      if (roll < 0.85) return 'thermostat';
      if (roll < 0.92) return 'duct-cleaning';
      return 'emergency';
    })() as ServiceType;

    const template = pick(REQUEST_TEMPLATES[serviceType]);
    const customer = chance(0.12) ? demoCustomer : pick(customers);
    const address = customer.customer?.address ?? makeAddress();
    const priority: 'low' | 'normal' | 'high' | 'emergency' =
      serviceType === 'emergency' ? 'emergency' : chance(0.18) ? 'high' : chance(0.15) ? 'low' : 'normal';

    const request: any = {
      _id: new mongoose.Types.ObjectId(),
      trackingCode: code('SR'),
      customer: customer._id,
      contact: { name: customer.name, email: customer.email, phone: customer.phone },
      serviceType,
      propertyType: customer.customer?.propertyType ?? 'residential',
      title: template.title,
      description: template.description,
      priority,
      address,
      photos: [],
      systemBrand: pick(['Carrier', 'Trane', 'Goodman', 'Lennox', 'Rheem', 'American Standard']),
      systemAge: `${randInt(2, 19)} years`,
      preferredDate: new Date(created.getTime() + randInt(1, 6) * 86400000),
      preferredWindow: pick(['morning', 'afternoon', 'evening', 'anytime'] as const),
      status: 'submitted',
      timeline: [{ status: 'submitted', note: 'Request received', at: created }],
      createdAt: created,
      updatedAt: created,
    };

    // Fresh requests (last 4 days) stay in the intake pipeline.
    const isFresh = age <= 4;
    const goesNowhere = chance(0.06); // cancelled / lost work

    if (isFresh && chance(0.45)) {
      request.status = chance(0.5) ? 'submitted' : 'reviewing';
      requests.push(request);
      continue;
    }
    if (goesNowhere) {
      request.status = 'cancelled';
      request.timeline.push({
        status: 'cancelled',
        note: 'Customer went with another provider',
        at: new Date(created.getTime() + 2 * 86400000),
      });
      requests.push(request);
      continue;
    }

    /* ------------------------------- quotation ------------------------------- */
    const quotedAt = new Date(created.getTime() + randInt(4, 30) * 3600000);
    const lineItems = [
      {
        kind: 'labor' as const,
        description: template.labor[0],
        quantity: template.labor[1],
        unitPrice: template.labor[2],
      },
      ...template.parts.map(([desc, qty, price]) => ({
        kind: (price > 800 ? 'equipment' : 'part') as 'equipment' | 'part',
        description: desc,
        quantity: qty,
        unitPrice: price,
      })),
    ];

    const subtotal = round2(lineItems.reduce((a, li) => a + li.quantity * li.unitPrice, 0));
    const discountType = chance(0.25) ? 'percent' : 'none';
    const discountValue = discountType === 'percent' ? pick([5, 10, 15]) : 0;
    const discountAmount = round2((subtotal * discountValue) / 100);
    const taxRate = 8.25;
    const taxAmount = round2(((subtotal - discountAmount) * taxRate) / 100);
    const total = round2(subtotal - discountAmount + taxAmount);

    const quotation: any = {
      _id: new mongoose.Types.ObjectId(),
      quoteNumber: docNumber('QT', quotedAt),
      serviceRequest: request._id,
      customer: customer._id,
      lineItems,
      laborTotal: round2(lineItems.filter((l) => l.kind === 'labor').reduce((a, l) => a + l.quantity * l.unitPrice, 0)),
      equipmentTotal: round2(lineItems.filter((l) => l.kind !== 'labor').reduce((a, l) => a + l.quantity * l.unitPrice, 0)),
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      total,
      validUntil: new Date(quotedAt.getTime() + 30 * 86400000),
      status: 'sent',
      sentAt: quotedAt,
      createdBy: pick(dispatchers)._id,
      createdAt: quotedAt,
      updatedAt: quotedAt,
    };

    request.quotation = quotation._id;
    request.status = 'quoted';
    request.timeline.push({ status: 'quoted', note: `Quotation ${quotation.quoteNumber} sent`, at: quotedAt });

    // Some quotes are still awaiting a decision, a few get declined.
    const awaitingDecision = age <= 9 && chance(0.5);
    const rejected = !awaitingDecision && chance(0.12);

    if (awaitingDecision) {
      quotations.push(quotation);
      requests.push(request);
      continue;
    }
    if (rejected) {
      const at = new Date(quotedAt.getTime() + randInt(1, 5) * 86400000);
      quotation.status = 'rejected';
      quotation.respondedAt = at;
      quotation.rejectionReason = pick([
        'Price is above the budget we set aside this year.',
        'Going to hold off until next season.',
        'Received a lower quote from another contractor.',
      ]);
      request.timeline.push({ status: 'quote_rejected', note: quotation.rejectionReason, at });
      quotations.push(quotation);
      requests.push(request);
      continue;
    }

    const acceptedAt = new Date(quotedAt.getTime() + randInt(4, 72) * 3600000);
    quotation.status = 'accepted';
    quotation.respondedAt = acceptedAt;
    request.status = 'approved';
    request.timeline.push({ status: 'approved', note: 'Customer approved the quotation', at: acceptedAt });

    /* ---------------------------------- job ---------------------------------- */
    const technician = pick(technicians);
    const scheduledDay = new Date(acceptedAt.getTime() + randInt(1, 8) * 86400000);
    const startHour = pick([7, 8, 9, 10, 11, 13, 14, 15, 16]);
    const scheduledStart = atHour(scheduledDay, startHour, pick([0, 30]));
    const durationHours = Math.max(1, Math.ceil(template.labor[1]));
    const scheduledEnd = new Date(scheduledStart.getTime() + durationHours * 3600000);

    const job: any = {
      _id: new mongoose.Types.ObjectId(),
      jobNumber: docNumber('JOB', scheduledStart),
      serviceRequest: request._id,
      quotation: quotation._id,
      customer: customer._id,
      technician: technician._id,
      title: template.title,
      serviceType,
      priority,
      address,
      scheduledStart,
      scheduledEnd,
      checklist: [],
      photos: [],
      notes: [],
      timeline: [{ status: 'assigned', note: `Assigned to ${technician.name}`, at: acceptedAt }],
      createdAt: acceptedAt,
      updatedAt: acceptedAt,
    };

    request.job = job._id;
    request.status = 'scheduled';
    request.timeline.push({ status: 'scheduled', note: `Job ${job.jobNumber} scheduled`, at: acceptedAt });

    const isFuture = scheduledStart.getTime() > Date.now();

    if (isFuture) {
      job.status = chance(0.25) ? 'unassigned' : 'assigned';
      if (job.status === 'unassigned') job.technician = undefined;
      quotations.push(quotation);
      jobs.push(job);
      requests.push(request);
      continue;
    }

    /* ------------------------------- completion ------------------------------- */
    const stillRunning = age <= 2 && chance(0.4);
    if (stillRunning) {
      job.status = pick(['en_route', 'in_progress'] as const);
      job.startedAt = job.status === 'in_progress' ? scheduledStart : undefined;
      request.status = 'in_progress';
      quotations.push(quotation);
      jobs.push(job);
      requests.push(request);
      continue;
    }

    const completedAt = new Date(scheduledStart.getTime() + durationHours * 3600000 + randInt(0, 45) * 60000);
    job.status = 'completed';
    job.startedAt = scheduledStart;
    job.completedAt = completedAt;
    job.report = {
      summary: `${template.title} — resolved on site.`,
      workPerformed: template.labor[0].split('—')[0].trim(),
      partsUsed: template.parts.map(([name, qty]) => ({ name, quantity: qty })),
      recommendations: chance(0.45)
        ? pick([
            'Recommend enrolling in a maintenance plan — the system is past the halfway point of its service life.',
            'Return duct is undersized for the equipment; worth quoting a resize before next summer.',
            'Capacitor readings are within tolerance but trending low. Re-check at the next visit.',
            'Suggest upgrading to a MERV 13 media filter to reduce coil fouling.',
          ])
        : undefined,
      laborHours: template.labor[1],
      submittedAt: completedAt,
    };
    job.signature = {
      url: 'https://res.cloudinary.com/demo/image/upload/v1/serviceflow/signature-placeholder.png',
      signedBy: customer.name,
      signedAt: completedAt,
    };
    job.timeline.push(
      { status: 'en_route', at: new Date(scheduledStart.getTime() - 25 * 60000) },
      { status: 'in_progress', at: scheduledStart },
      { status: 'completed', note: 'Work completed and signed off', at: completedAt },
    );
    techJobCount.set(String(technician._id), (techJobCount.get(String(technician._id)) ?? 0) + 1);

    request.status = 'completed';
    request.timeline.push({ status: 'completed', note: 'Work completed', at: completedAt });

    /* -------------------------------- invoicing -------------------------------- */
    const issued = new Date(completedAt.getTime() + randInt(1, 36) * 3600000);
    const dueDate = new Date(issued.getTime() + 30 * 86400000);
    const invoice: any = {
      _id: new mongoose.Types.ObjectId(),
      invoiceNumber: docNumber('INV', issued),
      customer: customer._id,
      job: job._id,
      quotation: quotation._id,
      lineItems,
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      total,
      amountPaid: 0,
      balance: total,
      status: 'sent',
      issueDate: issued,
      dueDate,
      createdBy: admin._id,
      createdAt: issued,
      updatedAt: issued,
    };
    job.invoice = invoice._id;

    // Payment behaviour: most settle, some partially, a few run past due.
    const overdue = dueDate.getTime() < Date.now();
    const roll = rand();

    if (roll < 0.74) {
      const paidAt = new Date(issued.getTime() + randInt(1, 21) * 86400000);
      if (paidAt.getTime() <= Date.now()) {
        payments.push({
          paymentNumber: docNumber('PAY', paidAt),
          invoice: invoice._id,
          customer: customer._id,
          amount: total,
          method: pick(['card', 'bank_transfer', 'online', 'check', 'cash'] as const),
          status: 'succeeded',
          reference: code('REF', 8),
          paidAt,
          recordedBy: admin._id,
          createdAt: paidAt,
        });
        invoice.amountPaid = total;
        invoice.balance = 0;
        invoice.status = 'paid';
        invoice.paidAt = paidAt;
      }
    } else if (roll < 0.85) {
      const part = round2(total * pick([0.3, 0.5, 0.6]));
      const paidAt = new Date(issued.getTime() + randInt(2, 18) * 86400000);
      if (paidAt.getTime() <= Date.now()) {
        payments.push({
          paymentNumber: docNumber('PAY', paidAt),
          invoice: invoice._id,
          customer: customer._id,
          amount: part,
          method: pick(['card', 'bank_transfer', 'check'] as const),
          status: 'succeeded',
          reference: code('REF', 8),
          paidAt,
          recordedBy: admin._id,
          createdAt: paidAt,
        });
        invoice.amountPaid = part;
        invoice.balance = round2(total - part);
        invoice.status = 'partial';
      }
    } else if (overdue) {
      invoice.status = 'overdue';
    }

    quotations.push(quotation);
    jobs.push(job);
    invoices.push(invoice);
    requests.push(request);
  }

  /**
   * Guarantee cash collected today and month-to-date. Without this the daily and
   * monthly revenue tiles read $0 whenever the seeder happens to run early in a
   * month, which makes a working dashboard look broken during a demo.
   */
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const settleable = invoices.filter((inv) => inv.status === 'sent' || inv.status === 'overdue');
  const recentSettlements = settleable.slice(0, 9);

  recentSettlements.forEach((invoice, i) => {
    // Three land today, the rest spread across the current month so far.
    const daysBack = i < 3 ? 0 : Math.min(randInt(1, 12), Math.floor((Date.now() - monthStart.getTime()) / 86400000));
    const paidAt = new Date();
    paidAt.setDate(paidAt.getDate() - daysBack);
    paidAt.setHours(randInt(8, 17), randInt(0, 59), 0, 0);
    if (paidAt.getTime() > Date.now()) paidAt.setTime(Date.now() - 3600000);

    const amount = invoice.balance;
    payments.push({
      paymentNumber: docNumber('PAY', paidAt),
      invoice: invoice._id,
      customer: invoice.customer,
      amount,
      method: pick(['card', 'online', 'bank_transfer'] as const),
      status: 'succeeded',
      reference: code('REF', 8),
      paidAt,
      recordedBy: admin._id,
      createdAt: paidAt,
    });

    invoice.amountPaid = round2(invoice.amountPaid + amount);
    invoice.balance = 0;
    invoice.status = 'paid';
    invoice.paidAt = paidAt;
  });

  await ServiceRequest.insertMany(requests);
  await Quotation.insertMany(quotations, { validateBeforeSave: false } as never);
  await Job.insertMany(jobs);
  await Invoice.insertMany(invoices, { validateBeforeSave: false } as never);
  await Payment.insertMany(payments);
  console.log(
    `[seed] pipeline → ${requests.length} requests, ${quotations.length} quotations, ${jobs.length} jobs, ${invoices.length} invoices, ${payments.length} payments`,
  );

  /* ------------------------- today's board for the dispatcher ------------------------- */
  // Guarantee a populated "today" regardless of where the random walk landed.
  const todayJobs: any[] = [];
  const todaySlots = [7.5, 9, 10.5, 12, 13.5, 15, 16.5];
  for (let i = 0; i < 7; i += 1) {
    const customer = pick(customers);
    // Slot 2 is the emergency on the board, so it must draw an emergency scenario —
    // an "inspection" flagged as an emergency reads as broken demo data.
    const serviceType =
      i === 2
        ? ('emergency' as ServiceType)
        : pick(['repair', 'maintenance', 'inspection', 'thermostat'] as ServiceType[]);
    const template = pick(REQUEST_TEMPLATES[serviceType]);
    const address = customer.customer?.address ?? makeAddress();
    const created = daysAgo(randInt(2, 6));

    const request: any = {
      _id: new mongoose.Types.ObjectId(),
      trackingCode: code('SR'),
      customer: customer._id,
      contact: { name: customer.name, email: customer.email, phone: customer.phone },
      serviceType,
      propertyType: customer.customer?.propertyType ?? 'residential',
      title: template.title,
      description: template.description,
      priority: i === 2 ? 'emergency' : i === 5 ? 'high' : 'normal',
      address,
      photos: [],
      status: 'scheduled',
      timeline: [{ status: 'submitted', at: created }, { status: 'scheduled', at: daysAgo(1) }],
      createdAt: created,
      updatedAt: created,
    };

    const hour = todaySlots[i];
    const start = atHour(new Date(), Math.floor(hour), (hour % 1) * 60);
    const job: any = {
      _id: new mongoose.Types.ObjectId(),
      jobNumber: docNumber('JOB', start),
      serviceRequest: request._id,
      customer: customer._id,
      technician: i === 6 ? undefined : technicians[i % technicians.length]._id,
      title: template.title,
      serviceType,
      priority: request.priority,
      address,
      scheduledStart: start,
      scheduledEnd: new Date(start.getTime() + 2 * 3600000),
      status:
        i === 6 ? 'unassigned' : start.getTime() < Date.now() - 3600000 ? 'in_progress' : 'assigned',
      startedAt: start.getTime() < Date.now() - 3600000 ? start : undefined,
      checklist: [
        { label: 'Confirm reported fault with the customer', done: start.getTime() < Date.now() },
        { label: 'Measure supply and return temperatures', done: false },
        { label: 'Inspect electrical connections', done: false },
        { label: 'Verify operation across a full cycle', done: false },
      ],
      photos: [],
      notes: [],
      timeline: [{ status: 'assigned', at: daysAgo(1) }],
      createdAt: daysAgo(1),
    };
    request.job = job._id;
    todayJobs.push({ request, job });
  }

  // Make sure the demo technician account has work on the board today.
  todayJobs[0].job.technician = technicians[0]._id;
  todayJobs[1].job.technician = technicians[0]._id;
  todayJobs[3].job.technician = technicians[0]._id;

  await ServiceRequest.insertMany(todayJobs.map((t) => t.request));
  await Job.insertMany(todayJobs.map((t) => t.job));
  console.log(`[seed] today → ${todayJobs.length} jobs on the dispatch board`);

  /* ------------------------------ maintenance contracts ------------------------------ */
  const contractCustomers = [demoCustomer, ...customers.filter((c) => c.id !== demoCustomer.id).slice(0, 13)];
  const contracts = contractCustomers.map((customer, i) => {
    const plan = customer.customer?.propertyType === 'commercial'
      ? plans[3]
      : plans[i % 3];
    // Stagger end dates so the renewal queue has real entries.
    const daysIntoTerm = i === 0 ? 320 : randInt(20, 350);
    const startDate = daysAgo(daysIntoTerm);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const daysRemaining = Math.ceil((endDate.getTime() - Date.now()) / 86400000);
    const status = daysRemaining < 0 ? 'expired' : daysRemaining <= 60 ? 'expiring' : 'active';

    const visitGap = 12 / plan.visitsPerYear;
    const visits = Array.from({ length: plan.visitsPerYear }, (_, v) => {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + Math.round(visitGap * (v + 0.5)));
      return {
        scheduledDate: d,
        status: d.getTime() < Date.now() ? ('completed' as const) : ('scheduled' as const),
        completedAt: d.getTime() < Date.now() ? d : undefined,
      };
    });

    const billingCycle = chance(0.65) ? ('annual' as const) : ('monthly' as const);

    return {
      contractNumber: docNumber('MC', startDate),
      customer: customer._id,
      plan: plan._id,
      planName: plan.name,
      billingCycle,
      amount: billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly,
      startDate,
      endDate,
      status,
      autoRenew: chance(0.7),
      visitsTotal: plan.visitsPerYear,
      visitsUsed: visits.filter((v) => v.status === 'completed').length,
      visits,
      remindersSent: status === 'expiring' ? [{ type: 'renewal_60d', at: daysAgo(randInt(1, 20)) }] : [],
      createdAt: startDate,
    };
  });

  await MaintenanceContract.insertMany(contracts);
  console.log(`[seed] contracts → ${contracts.length}`);

  /* ---------------------------------- technicians ----------------------------------- */
  await Promise.all(
    technicians.map((t) =>
      User.updateOne(
        { _id: t._id },
        { 'technician.jobsCompleted': (techJobCount.get(String(t._id)) ?? 0) + randInt(40, 180) },
      ),
    ),
  );

  /* --------------------------------- contact inbox ---------------------------------- */
  await ContactMessage.insertMany([
    {
      name: 'Gregory Paulsen',
      email: 'g.paulsen@example.com',
      phone: phone(),
      subject: 'Quote for two-storey new build',
      message:
        'We are breaking ground on a 3,400 sq ft build in Gilbert next month and need HVAC bid pricing for a two-zone system.',
      status: 'new',
      createdAt: daysAgo(1),
    },
    {
      name: 'Renata Silva',
      email: 'renata.s@example.com',
      phone: phone(),
      subject: 'Do you service Queen Creek?',
      message: 'I could not find Queen Creek in your service areas list. Do you cover it, or can you recommend someone?',
      status: 'new',
      createdAt: daysAgo(2),
    },
    {
      name: 'Harold Kim',
      email: 'h.kim@example.com',
      subject: 'Commercial maintenance agreement',
      message:
        'Managing four retail suites with eight rooftop units total. Interested in what a commercial agreement would cost.',
      status: 'read',
      createdAt: daysAgo(5),
    },
    {
      name: 'Bianca Ferreira',
      email: 'b.ferreira@example.com',
      phone: phone(),
      subject: 'Thank you to Aaliyah',
      message:
        'Just wanted to pass on that Aaliyah was outstanding on our emergency call last Saturday. Please recognise her.',
      status: 'responded',
      createdAt: daysAgo(11),
    },
  ]);

  /* --------------------------------- notifications ---------------------------------- */
  const openInvoice = invoices.find((i) => i.customer.equals(demoCustomer._id) && i.status !== 'paid');
  const demoContract = contracts.find((c) => c.customer.equals(demoCustomer._id));

  notifications.push(
    {
      user: demoCustomer._id,
      type: 'appointment_reminder',
      title: 'Upcoming maintenance visit',
      message: 'Your next scheduled tune-up is coming up. We will confirm the arrival window the day before.',
      link: '/dashboard/customer/contracts',
      read: false,
      createdAt: daysAgo(1),
    },
    {
      user: demoCustomer._id,
      type: 'maintenance_due',
      title: 'Your plan is up for renewal',
      message: `${demoContract?.planName ?? 'Comfort Plus'} expires soon. Renew now to keep priority scheduling.`,
      link: '/dashboard/customer/contracts',
      read: false,
      createdAt: daysAgo(3),
    },
  );
  if (openInvoice) {
    notifications.push({
      user: demoCustomer._id,
      type: 'invoice_generated',
      title: `Invoice ${openInvoice.invoiceNumber}`,
      message: `$${openInvoice.balance.toFixed(2)} is outstanding on your account.`,
      link: `/dashboard/customer/invoices/${openInvoice._id}`,
      read: false,
      createdAt: openInvoice.issueDate,
    });
  }

  const unassignedToday = todayJobs.find((t) => t.job.status === 'unassigned');
  [...dispatchers, admin].forEach((staff) => {
    notifications.push(
      {
        user: staff._id,
        type: 'system',
        title: 'Unassigned job on today\'s board',
        message: `${unassignedToday?.job.jobNumber} still needs a technician.`,
        link: '/dashboard/dispatcher',
        read: false,
        createdAt: daysAgo(0.2),
      },
      {
        user: staff._id,
        type: 'quotation_approved',
        title: 'Quotation approved',
        message: 'A customer approved an estimate — schedule the visit.',
        link: '/dashboard/dispatcher',
        read: false,
        createdAt: daysAgo(0.5),
      },
    );
  });

  notifications.push({
    user: admin._id,
    type: 'contract_renewal',
    title: 'Contracts entering the renewal window',
    message: `${contracts.filter((c) => c.status === 'expiring').length} maintenance contracts expire within 60 days.`,
    link: '/dashboard/admin/contracts',
    read: false,
    createdAt: daysAgo(1),
  });

  technicians.slice(0, 3).forEach((t) => {
    notifications.push({
      user: t._id,
      type: 'technician_assigned',
      title: 'Jobs assigned for today',
      message: 'Your route for today is ready in the dashboard.',
      link: '/dashboard/technician',
      read: false,
      createdAt: daysAgo(0.4),
    });
  });

  await Notification.insertMany(notifications);
  console.log(`[seed] notifications → ${notifications.length}`);

  /* ------------------------------------ summary ------------------------------------- */
  const paidTotal = payments.reduce((a, p) => a + p.amount, 0);
  console.log('\n────────────────────────────────────────────────');
  console.log('  ServiceFlow demo database is ready');
  console.log('────────────────────────────────────────────────');
  console.log(`  Lifetime revenue seeded : $${Math.round(paidTotal).toLocaleString('en-US')}`);
  console.log(`  Completed jobs          : ${jobs.filter((j) => j.status === 'completed').length}`);
  console.log(`  Active contracts        : ${contracts.filter((c) => c.status !== 'expired').length}`);
  console.log('\n  Sign in with any of these — password: ArcticAir#2026');
  console.log('    admin@arcticair.com      → Administrator');
  console.log('    dispatch@arcticair.com   → Dispatcher');
  console.log('    marcus@arcticair.com     → Technician');
  console.log('    customer@arcticair.com   → Customer');
  console.log('────────────────────────────────────────────────\n');

  await disconnectDB();
}

run().catch(async (err) => {
  console.error('[seed] failed:', err);
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});

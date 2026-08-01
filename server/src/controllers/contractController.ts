import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { nextDocNumber } from '../utils/sequence';
import { MaintenanceContract, MaintenanceContractDoc } from '../models/MaintenanceContract';
import { MaintenancePlan } from '../models/MaintenancePlan';
import { notify, notifyRole } from '../services/notify';

/** Spreads N visits evenly across the contract term. */
function buildVisitSchedule(start: Date, months: number, visits: number) {
  const gap = months / visits;
  return Array.from({ length: visits }, (_, i) => {
    const d = new Date(start);
    d.setMonth(d.getMonth() + Math.round(gap * (i + 0.5)));
    return { scheduledDate: d, status: 'scheduled' as const };
  });
}

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await MaintenancePlan.find({ isActive: true }).sort({ sortOrder: 1 });
  res.json({ success: true, data: plans });
});

export const upsertPlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = id
    ? await MaintenancePlan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    : await MaintenancePlan.create(req.body);

  if (!plan) throw ApiError.notFound('Plan not found');
  res.json({ success: true, data: plan });
});

export const createContract = asyncHandler(async (req: Request, res: Response) => {
  const { plan: planId, customer, billingCycle = 'annual', startDate, autoRenew = true } = req.body;

  const plan = await MaintenancePlan.findById(planId);
  if (!plan) throw ApiError.notFound('Maintenance plan not found');

  // Customers enrolling themselves can only ever create their own contract.
  const owner = req.user!.role === 'customer' ? req.user!._id : customer;
  if (!owner) throw ApiError.badRequest('A customer is required');

  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);

  const existing = await MaintenanceContract.findOne({
    customer: owner,
    status: { $in: ['active', 'expiring'] },
  });
  if (existing) throw ApiError.conflict('This customer already holds an active contract');

  const contract = await MaintenanceContract.create({
    contractNumber: await nextDocNumber(MaintenanceContract, 'contractNumber', 'MC'),
    customer: owner,
    plan: plan._id,
    planName: plan.name,
    billingCycle,
    amount: billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly,
    startDate: start,
    endDate: end,
    status: 'active',
    autoRenew,
    visitsTotal: plan.visitsPerYear,
    visits: buildVisitSchedule(start, 12, plan.visitsPerYear),
  });

  await notify({
    user: owner,
    type: 'contract_renewal',
    title: `${plan.name} activated`,
    message: `Contract ${contract.contractNumber} runs to ${end.toLocaleDateString('en-US')} and includes ${plan.visitsPerYear} tune-ups.`,
    link: '/dashboard/customer/contracts',
  });
  await notifyRole(['admin'], {
    type: 'contract_renewal',
    title: 'New maintenance contract',
    message: `${contract.contractNumber} — ${plan.name} ($${contract.amount}).`,
    link: '/dashboard/admin/contracts',
  });

  res.status(201).json({ success: true, data: contract });
});

export const listContracts = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter: FilterQuery<MaintenanceContractDoc> = {};
  if (user.role === 'customer') filter.customer = user._id;
  if (req.query.status) filter.status = req.query.status;

  // Expiring-soon window used by the admin renewal queue.
  if (req.query.expiringWithin) {
    const days = Number(req.query.expiringWithin);
    filter.endDate = { $lte: new Date(Date.now() + days * 86400000), $gte: new Date() };
  }

  const contracts = await MaintenanceContract.find(filter)
    .populate('customer', 'name email phone customer')
    .populate('plan', 'name visitsPerYear repairDiscountPercent responseHours')
    .sort({ endDate: 1 })
    .limit(Number(req.query.limit) || 200);

  res.json({ success: true, count: contracts.length, data: contracts });
});

export const getContract = asyncHandler(async (req: Request, res: Response) => {
  const contract = await MaintenanceContract.findById(req.params.id)
    .populate('customer', 'name email phone customer')
    .populate('plan')
    .populate('visits.job', 'jobNumber status completedAt technician');

  if (!contract) throw ApiError.notFound('Contract not found');
  if (req.user!.role === 'customer' && String(contract.customer._id ?? contract.customer) !== req.user!.id) {
    throw ApiError.forbidden();
  }

  res.json({ success: true, data: contract });
});

export const renewContract = asyncHandler(async (req: Request, res: Response) => {
  const previous = await MaintenanceContract.findById(req.params.id);
  if (!previous) throw ApiError.notFound('Contract not found');

  const user = req.user!;
  if (user.role === 'customer' && String(previous.customer) !== user.id) throw ApiError.forbidden();
  if (previous.status === 'cancelled') throw ApiError.badRequest('A cancelled contract cannot be renewed');

  const plan = await MaintenancePlan.findById(req.body.plan ?? previous.plan);
  if (!plan) throw ApiError.notFound('Maintenance plan not found');

  // A renewal picks up where the old term ends — no gap in coverage.
  const start = previous.endDate > new Date() ? previous.endDate : new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);

  const billingCycle = req.body.billingCycle ?? previous.billingCycle;

  const renewal = await MaintenanceContract.create({
    contractNumber: await nextDocNumber(MaintenanceContract, 'contractNumber', 'MC'),
    customer: previous.customer,
    plan: plan._id,
    planName: plan.name,
    billingCycle,
    amount: billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly,
    startDate: start,
    endDate: end,
    status: 'active',
    autoRenew: previous.autoRenew,
    visitsTotal: plan.visitsPerYear,
    visits: buildVisitSchedule(start, 12, plan.visitsPerYear),
    renewedFrom: previous._id,
  });

  previous.status = 'expired';
  await previous.save();

  await notify({
    user: previous.customer,
    type: 'contract_renewal',
    title: 'Contract renewed',
    message: `${renewal.contractNumber} covers you through ${end.toLocaleDateString('en-US')}.`,
    link: '/dashboard/customer/contracts',
  });

  res.status(201).json({ success: true, data: renewal });
});

export const cancelContract = asyncHandler(async (req: Request, res: Response) => {
  const contract = await MaintenanceContract.findById(req.params.id);
  if (!contract) throw ApiError.notFound('Contract not found');
  if (req.user!.role === 'customer' && String(contract.customer) !== req.user!.id) {
    throw ApiError.forbidden();
  }

  contract.status = 'cancelled';
  contract.autoRenew = false;
  contract.cancelledAt = new Date();
  await contract.save();

  res.json({ success: true, data: contract });
});

export const toggleAutoRenew = asyncHandler(async (req: Request, res: Response) => {
  const contract = await MaintenanceContract.findById(req.params.id);
  if (!contract) throw ApiError.notFound('Contract not found');
  if (req.user!.role === 'customer' && String(contract.customer) !== req.user!.id) {
    throw ApiError.forbidden();
  }

  contract.autoRenew = Boolean(req.body.autoRenew);
  await contract.save();
  res.json({ success: true, data: contract });
});

/**
 * Sweeps contracts inside the renewal window and pushes a reminder for each
 * one that has not been chased yet (Module 6 — "send renewal reminders").
 */
export const sendRenewalReminders = asyncHandler(async (_req: Request, res: Response) => {
  const horizon = new Date(Date.now() + 60 * 86400000);
  const due = await MaintenanceContract.find({
    status: { $in: ['active', 'expiring'] },
    endDate: { $lte: horizon, $gte: new Date() },
  });

  let sent = 0;
  for (const contract of due) {
    contract.refreshStatus();
    const alreadySent = contract.remindersSent.some(
      (r) => r.type === 'renewal_60d' && Date.now() - new Date(r.at).getTime() < 30 * 86400000,
    );
    if (!alreadySent) {
      await notify({
        user: contract.customer,
        type: 'maintenance_due',
        title: 'Your maintenance plan is up for renewal',
        message: `${contract.planName} expires on ${contract.endDate.toLocaleDateString('en-US')}. Renew to keep priority scheduling.`,
        link: '/dashboard/customer/contracts',
      });
      contract.remindersSent.push({ type: 'renewal_60d', at: new Date() });
      sent += 1;
    }
    await contract.save();
  }

  res.json({ success: true, message: `${sent} renewal reminder(s) sent`, data: { checked: due.length, sent } });
});

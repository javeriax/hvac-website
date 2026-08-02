import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { nextDocNumber } from '../utils/sequence';
import { Quotation, QuotationDoc } from '../models/Quotation';
import { ServiceRequest } from '../models/ServiceRequest';
import { notify, notifyRole } from '../services/notify';

// Builds a quote against a request. Totals are worked out in the model, not taken from the client.
export const createQuotation = asyncHandler(async (req: Request, res: Response) => {
  const { serviceRequest: requestId, lineItems, taxRate, discountType, discountValue, notes, validUntil } =
    req.body;

  const request = await ServiceRequest.findById(requestId);
  if (!request) throw ApiError.notFound('Service request not found');
  if (!request.customer) {
    throw ApiError.badRequest(
      'This request has no linked customer account, create the customer first',
    );
  }
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw ApiError.badRequest('A quotation needs at least one line item');
  }

  const quotation = await Quotation.create({
    quoteNumber: await nextDocNumber(Quotation, 'quoteNumber', 'QT'),
    serviceRequest: request._id,
    customer: request.customer,
    lineItems,
    taxRate: taxRate ?? 8.25,
    discountType: discountType ?? 'none',
    discountValue: discountValue ?? 0,
    notes,
    validUntil: validUntil || undefined,
    createdBy: req.user!._id,
    status: 'draft',
  });

  request.quotation = quotation._id;
  if (request.status === 'submitted' || request.status === 'reviewing') {
    request.status = 'reviewing';
    request.timeline.push({ status: 'reviewing', note: 'Quotation drafted', at: new Date() });
  }
  await request.save();

  res.status(201).json({ success: true, data: quotation });
});

// Lists quotes. Customers never see drafts.
export const listQuotations = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter: FilterQuery<QuotationDoc> = {};

  if (user.role === 'customer') {
    filter.customer = user._id;
    // Customers never see drafts.
    filter.status = { $ne: 'draft' };
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.customer) filter.customer = req.query.customer;

  const quotations = await Quotation.find(filter)
    .populate('customer', 'name email phone')
    .populate('serviceRequest', 'trackingCode title serviceType address')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit) || 200);

  res.json({ success: true, count: quotations.length, data: quotations });
});

// One quote. Customers can only open their own, and drafts 404 for them.
export const getQuotation = asyncHandler(async (req: Request, res: Response) => {
  const quotation = await Quotation.findById(req.params.id)
    .populate('customer', 'name email phone customer')
    .populate('serviceRequest', 'trackingCode title serviceType description address priority');

  if (!quotation) throw ApiError.notFound('Quotation not found');

  const user = req.user!;
  if (user.role === 'customer') {
    if (String(quotation.customer._id ?? quotation.customer) !== user.id) throw ApiError.forbidden();
    if (quotation.status === 'draft') throw ApiError.notFound('Quotation not found');
  }

  res.json({ success: true, data: quotation });
});

// Edit a quote. Refused once the customer has accepted or rejected it.
export const updateQuotation = asyncHandler(async (req: Request, res: Response) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) throw ApiError.notFound('Quotation not found');
  if (['accepted', 'rejected'].includes(quotation.status)) {
    throw ApiError.badRequest('A quotation the customer has responded to can no longer be edited');
  }

  const editable = ['lineItems', 'taxRate', 'discountType', 'discountValue', 'notes', 'terms', 'validUntil'] as const;
  editable.forEach((key) => {
    if (req.body[key] !== undefined) (quotation as never as Record<string, unknown>)[key] = req.body[key];
  });

  await quotation.save();
  res.json({ success: true, data: quotation });
});

// Draft -> sent. Notifies the customer and moves the request to "quoted".
export const sendQuotation = asyncHandler(async (req: Request, res: Response) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) throw ApiError.notFound('Quotation not found');
  if (quotation.status !== 'draft') throw ApiError.badRequest('This quotation has already been sent');

  quotation.status = 'sent';
  quotation.sentAt = new Date();
  await quotation.save();

  await ServiceRequest.findByIdAndUpdate(quotation.serviceRequest, {
    status: 'quoted',
    $push: { timeline: { status: 'quoted', note: `Quotation ${quotation.quoteNumber} sent`, at: new Date() } },
  });

  await notify({
    user: quotation.customer,
    type: 'quotation_sent',
    title: `Quotation ${quotation.quoteNumber} is ready`,
    message: `Your estimate totals $${quotation.total.toFixed(2)}. Review and approve it online.`,
    link: `/dashboard/customer/quotations/${quotation.id}`,
  });

  res.json({ success: true, data: quotation });
});

// The customer accepting or rejecting. Expired quotes are refused and marked expired.
export const respondToQuotation = asyncHandler(async (req: Request, res: Response) => {
  const { decision, reason } = req.body;
  if (!['accept', 'reject'].includes(decision)) {
    throw ApiError.badRequest('Decision must be either "accept" or "reject"');
  }

  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) throw ApiError.notFound('Quotation not found');

  const user = req.user!;
  if (user.role === 'customer' && String(quotation.customer) !== user.id) throw ApiError.forbidden();
  if (quotation.status !== 'sent') {
    throw ApiError.badRequest('Only a quotation awaiting your decision can be actioned');
  }
  if (quotation.validUntil.getTime() < Date.now()) {
    quotation.status = 'expired';
    await quotation.save();
    throw ApiError.badRequest('This quotation has expired, please request a fresh estimate');
  }

  quotation.status = decision === 'accept' ? 'accepted' : 'rejected';
  quotation.respondedAt = new Date();
  if (decision === 'reject') quotation.rejectionReason = reason;
  await quotation.save();

  await ServiceRequest.findByIdAndUpdate(quotation.serviceRequest, {
    status: decision === 'accept' ? 'approved' : 'reviewing',
    $push: {
      timeline: {
        status: decision === 'accept' ? 'approved' : 'quote_rejected',
        note: decision === 'accept' ? 'Customer approved the quotation' : reason || 'Customer declined the quotation',
        at: new Date(),
      },
    },
  });

  await notifyRole(['dispatcher', 'admin'], {
    type: decision === 'accept' ? 'quotation_approved' : 'quotation_rejected',
    title: `Quotation ${quotation.quoteNumber} ${decision === 'accept' ? 'approved' : 'declined'}`,
    message:
      decision === 'accept'
        ? `Approved for $${quotation.total.toFixed(2)}, schedule a technician.`
        : `Declined${reason ? `: ${reason}` : ''}.`,
    link: '/dashboard/dispatcher',
  });

  res.json({ success: true, data: quotation });
});

// Deletes a draft. Anything already sent stays on the record.
export const deleteQuotation = asyncHandler(async (req: Request, res: Response) => {
  const quotation = await Quotation.findById(req.params.id);
  if (!quotation) throw ApiError.notFound('Quotation not found');
  if (quotation.status !== 'draft') throw ApiError.badRequest('Only drafts can be deleted');

  await ServiceRequest.findByIdAndUpdate(quotation.serviceRequest, { $unset: { quotation: 1 } });
  await quotation.deleteOne();

  res.json({ success: true, message: 'Draft deleted' });
});

import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { nextDocNumber } from '../utils/sequence';
import { Invoice, InvoiceDoc } from '../models/Invoice';
import { Payment } from '../models/Payment';
import { Job } from '../models/Job';
import { Quotation } from '../models/Quotation';
import { notify } from '../services/notify';

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { job: jobId, customer, lineItems, taxRate, discountAmount, dueDate, notes, contract } = req.body;

  let resolvedCustomer = customer;
  let resolvedItems = lineItems;
  let quotationId;

  // Invoicing straight off a completed job pulls its accepted quotation lines forward.
  if (jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found');
    if (job.invoice) throw ApiError.conflict('This job has already been invoiced');

    resolvedCustomer = job.customer;
    quotationId = job.quotation;

    if (!resolvedItems?.length && job.quotation) {
      const quote = await Quotation.findById(job.quotation);
      resolvedItems = quote?.lineItems ?? [];
    }
    if (!resolvedItems?.length && job.report) {
      resolvedItems = [
        {
          kind: 'labor',
          description: `${job.title} — ${job.report.laborHours}h on site`,
          quantity: job.report.laborHours,
          unitPrice: 95,
        },
        ...job.report.partsUsed.map((p) => ({
          kind: 'part' as const,
          description: p.name,
          quantity: p.quantity,
          unitPrice: 0,
        })),
      ];
    }
  }

  if (!resolvedCustomer) throw ApiError.badRequest('An invoice needs a customer');
  if (!resolvedItems?.length) throw ApiError.badRequest('An invoice needs at least one line item');

  const invoice = await Invoice.create({
    invoiceNumber: await nextDocNumber(Invoice, 'invoiceNumber', 'INV'),
    customer: resolvedCustomer,
    job: jobId || undefined,
    quotation: quotationId,
    contract: contract || undefined,
    lineItems: resolvedItems,
    taxRate: taxRate ?? 8.25,
    discountAmount: discountAmount ?? 0,
    dueDate: dueDate || undefined,
    notes,
    status: 'draft',
    createdBy: req.user!._id,
  });

  if (jobId) await Job.findByIdAndUpdate(jobId, { invoice: invoice._id });

  res.status(201).json({ success: true, data: invoice });
});

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter: FilterQuery<InvoiceDoc> = {};

  if (user.role === 'customer') {
    filter.customer = user._id;
    filter.status = { $ne: 'draft' };
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.customer) filter.customer = req.query.customer;

  const invoices = await Invoice.find(filter)
    .populate('customer', 'name email phone')
    .populate('job', 'jobNumber title completedAt')
    .sort({ createdAt: -1 })
    .limit(Number(req.query.limit) || 200);

  res.json({ success: true, count: invoices.length, data: invoices });
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('customer', 'name email phone customer')
    .populate('job', 'jobNumber title completedAt address serviceType')
    .populate('quotation', 'quoteNumber');

  if (!invoice) throw ApiError.notFound('Invoice not found');

  const user = req.user!;
  if (user.role === 'customer') {
    if (String(invoice.customer._id ?? invoice.customer) !== user.id) throw ApiError.forbidden();
    if (invoice.status === 'draft') throw ApiError.notFound('Invoice not found');
  }

  const payments = await Payment.find({ invoice: invoice._id }).sort({ paidAt: -1 });

  res.json({ success: true, data: { invoice, payments } });
});

export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.status === 'paid') throw ApiError.badRequest('A paid invoice can no longer be edited');

  (['lineItems', 'taxRate', 'discountAmount', 'dueDate', 'notes'] as const).forEach((key) => {
    if (req.body[key] !== undefined) (invoice as never as Record<string, unknown>)[key] = req.body[key];
  });

  await invoice.save();
  res.json({ success: true, data: invoice });
});

export const sendInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.status !== 'draft') throw ApiError.badRequest('This invoice has already been issued');

  invoice.status = 'sent';
  invoice.issueDate = new Date();
  await invoice.save();

  await notify({
    user: invoice.customer,
    type: 'invoice_generated',
    title: `Invoice ${invoice.invoiceNumber}`,
    message: `$${invoice.total.toFixed(2)} is due by ${invoice.dueDate.toLocaleDateString('en-US')}.`,
    link: `/dashboard/customer/invoices/${invoice.id}`,
  });

  res.json({ success: true, data: invoice });
});

export const voidInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.amountPaid > 0) throw ApiError.badRequest('Refund the payments before voiding');

  invoice.status = 'void';
  await invoice.save();
  res.json({ success: true, data: invoice });
});

/** Records a payment and rolls the invoice balance/status forward. */
export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, method, reference, paidAt } = req.body;
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.status === 'void') throw ApiError.badRequest('This invoice has been voided');

  const value = Number(amount);
  if (!value || value <= 0) throw ApiError.badRequest('Payment amount must be greater than zero');
  if (value > invoice.balance + 0.01) {
    throw ApiError.badRequest(`That exceeds the outstanding balance of $${invoice.balance.toFixed(2)}`);
  }

  const payment = await Payment.create({
    paymentNumber: await nextDocNumber(Payment, 'paymentNumber', 'PAY'),
    invoice: invoice._id,
    customer: invoice.customer,
    amount: value,
    method: method || 'card',
    reference,
    paidAt: paidAt || new Date(),
    recordedBy: req.user!._id,
  });

  invoice.amountPaid = Math.round((invoice.amountPaid + value) * 100) / 100;
  if (invoice.status === 'draft') invoice.status = 'sent';
  await invoice.save();

  await notify({
    user: invoice.customer,
    type: 'payment_received',
    title: 'Payment received',
    message: `Thank you — $${value.toFixed(2)} applied to ${invoice.invoiceNumber}.`,
    link: `/dashboard/customer/invoices/${invoice.id}`,
  });

  res.status(201).json({ success: true, data: { payment, invoice } });
});

export const listPayments = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const filter: Record<string, unknown> = {};
  if (user.role === 'customer') filter.customer = user._id;
  if (req.query.invoice) filter.invoice = req.query.invoice;

  const payments = await Payment.find(filter)
    .populate('invoice', 'invoiceNumber total')
    .populate('customer', 'name email')
    .sort({ paidAt: -1 })
    .limit(Number(req.query.limit) || 200);

  res.json({ success: true, count: payments.length, data: payments });
});

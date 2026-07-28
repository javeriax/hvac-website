"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { CheckIcon } from "@/components/icons";

type Quotation = {
  _id: string;
  laborCost: number;
  equipmentCost: number;
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  approvalStatus: "pending" | "accepted" | "rejected";
  serviceRequestId: {
    trackingCode: string;
    serviceType: string;
    customerName: string;
    description: string;
  };
};

const currency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function QuotationView({ quotationId }: { quotationId: string }) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    apiFetch<Quotation>(`/quotations/${quotationId}`)
      .then(setQuotation)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load quotation."))
      .finally(() => setLoading(false));
  }, [quotationId]);

  async function respond(decision: "accepted" | "rejected") {
    setResponding(true);
    setError("");
    try {
      const updated = await apiFetch<Quotation>(`/quotations/${quotationId}/respond`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      setQuotation(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your response.");
    } finally {
      setResponding(false);
    }
  }

  if (loading) return <p className="text-sm text-stone-500">Loading quotation…</p>;
  if (error && !quotation) return <p className="text-sm text-red-600">{error}</p>;
  if (!quotation) return null;

  const lineItems = [
    { label: "Labor", value: quotation.laborCost },
    { label: "Equipment", value: quotation.equipmentCost },
    { label: `Tax (${quotation.taxRate}%)`, value: quotation.taxAmount },
    { label: "Discount", value: -quotation.discount },
  ];

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {quotation.serviceRequestId.trackingCode}
          </div>
          <h2 className="mt-1 text-lg text-brand-900">{quotation.serviceRequestId.serviceType}</h2>
        </div>
        <StatusBadge status={quotation.approvalStatus} />
      </div>

      <p className="mt-3 text-sm text-stone-600">{quotation.serviceRequestId.description}</p>

      <div className="mt-6 divide-y divide-stone-100 border-t border-stone-100">
        {lineItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-stone-600">{item.label}</span>
            <span className="font-medium text-brand-900">{currency(item.value)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-3 text-base">
          <span className="font-semibold text-brand-900">Total</span>
          <span className="font-bold text-brand-700">{currency(quotation.total)}</span>
        </div>
      </div>

      {quotation.notes && (
        <p className="mt-4 rounded-md bg-stone-50 p-3 text-sm text-stone-600">{quotation.notes}</p>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {quotation.approvalStatus === "pending" ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => respond("accepted")}
            disabled={responding}
            className="btn-primary"
          >
            Accept Quotation
          </button>
          <button
            type="button"
            onClick={() => respond("rejected")}
            disabled={responding}
            className="btn-secondary"
          >
            Decline
          </button>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-2 text-sm text-stone-600">
          <CheckIcon className="h-4 w-4 text-brand-600" />
          You already {quotation.approvalStatus} this quotation.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Quotation["approvalStatus"] }) {
  const styles: Record<typeof status, string> = {
    pending: "bg-clay-100 text-clay-700",
    accepted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

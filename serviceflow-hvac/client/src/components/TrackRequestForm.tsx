"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type TrackedRequest = {
  trackingCode: string;
  serviceType: string;
  status: "pending" | "reviewing" | "quoted" | "scheduled" | "completed" | "closed";
  preferredDate: string;
  createdAt: string;
  quotation: { id: string; approvalStatus: string } | null;
};

const STATUS_LABEL: Record<TrackedRequest["status"], string> = {
  pending: "Received — awaiting review",
  reviewing: "Under review by dispatcher",
  quoted: "Quotation ready",
  scheduled: "Technician scheduled",
  completed: "Job completed",
  closed: "Closed",
};

const STATUS_STEP: Record<TrackedRequest["status"], number> = {
  pending: 1,
  reviewing: 2,
  quoted: 3,
  scheduled: 4,
  completed: 5,
  closed: 5,
};

const STEPS = ["Received", "Reviewing", "Quoted", "Scheduled", "Completed"];

export default function TrackRequestForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<TrackedRequest | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setRequest(null);

    try {
      const data = await apiFetch<TrackedRequest>(
        `/service-requests/track/${encodeURIComponent(code.trim())}?email=${encodeURIComponent(email.trim())}`,
      );
      setRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find that request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="trackingCode" className="field-label">Tracking code</label>
            <input
              id="trackingCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="SF-XXXXXX"
              className="field-input uppercase"
            />
          </div>
          <div>
            <label htmlFor="email" className="field-label">Email used on the request</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="field-input"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
          {loading ? "Looking up…" : "Track Request"}
        </button>
      </form>

      {request && (
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {request.trackingCode}
              </div>
              <h2 className="mt-1 text-lg text-brand-900">{request.serviceType}</h2>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {STATUS_LABEL[request.status]}
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            {STEPS.map((step, i) => {
              const stepIndex = i + 1;
              const active = stepIndex <= STATUS_STEP[request.status];
              return (
                <div key={step} className="flex flex-1 flex-col items-center text-center">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${active ? "bg-brand-700" : "bg-stone-200"}`}
                  />
                  <span className={`mt-2 text-[11px] ${active ? "text-brand-700" : "text-stone-400"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <dl className="mt-6 grid gap-4 border-t border-stone-100 pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">Preferred date</dt>
              <dd className="mt-0.5 font-medium text-brand-900">{request.preferredDate}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Submitted</dt>
              <dd className="mt-0.5 font-medium text-brand-900">
                {new Date(request.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>

          {request.quotation && (
            <div className="mt-5 rounded-md border border-clay-200 bg-clay-50 p-4">
              <p className="text-sm text-stone-700">
                A quotation is ready for this request.
              </p>
              <Link href={`/quotation/${request.quotation.id}`} className="btn-accent mt-3 inline-flex">
                View Quotation
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

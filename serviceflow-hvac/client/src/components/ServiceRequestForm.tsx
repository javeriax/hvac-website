"use client";

import { useState } from "react";
import Link from "next/link";
import { SERVICES, SERVICE_AREAS } from "@/lib/data";
import { apiUpload } from "@/lib/api";
import { CheckIcon } from "@/components/icons";

type SubmitResult = { trackingCode: string };

export default function ServiceRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [imageCount, setImageCount] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const data = await apiUpload<SubmitResult>("/service-requests", formData);
      setResult(data);
      form.reset();
      setImageCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="card border-2 border-brand-200 bg-brand-50">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-700 text-white">
          <CheckIcon />
        </div>
        <h2 className="mt-4 text-lg text-brand-900">Request submitted</h2>
        <p className="mt-2 text-sm text-stone-600">
          Save this tracking code — you&apos;ll need it to check your request status
          and to view your quotation once one is prepared.
        </p>
        <div className="mt-4 rounded-md border-2 border-dashed border-brand-300 bg-white px-4 py-3 text-center">
          <span className="text-xl font-bold tracking-wider text-brand-800">{result.trackingCode}</span>
        </div>
        <Link href={`/track-request?code=${result.trackingCode}`} className="btn-primary mt-5 inline-flex">
          Track This Request
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="customerName" className="field-label">Full name</label>
          <input id="customerName" name="customerName" type="text" required className="field-input" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" name="email" type="email" required className="field-input" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="field-label">Phone</label>
          <input id="phone" name="phone" type="tel" required className="field-input" />
        </div>
        <div>
          <label htmlFor="city" className="field-label">City</label>
          <select id="city" name="city" required className="field-input">
            <option value="">Select a city</option>
            {SERVICE_AREAS.map((area) => (
              <option key={area.city} value={area.city}>
                {area.city}, {area.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="serviceType" className="field-label">Service needed</label>
          <select id="serviceType" name="serviceType" required className="field-input">
            <option value="">Select a service</option>
            {SERVICES.map((service) => (
              <option key={service.slug} value={service.name}>
                {service.name}
              </option>
            ))}
            <option value="Inspection">Inspection only</option>
          </select>
        </div>
        <div>
          <label htmlFor="preferredDate" className="field-label">Preferred date</label>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="field-label">Describe the issue</label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="e.g. AC is running but not cooling below 78°F, noticed a clicking sound from the outdoor unit."
          className="field-input"
        />
      </div>

      <div>
        <label htmlFor="images" className="field-label">
          Photos <span className="font-normal text-stone-400">(optional, up to 5)</span>
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageCount(e.target.files?.length ?? 0)}
          className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
        {imageCount > 0 && (
          <p className="mt-1.5 text-xs text-stone-500">{imageCount} file(s) selected</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {submitting ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
}

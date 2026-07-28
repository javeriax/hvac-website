"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="card border-2 border-brand-200 bg-brand-50">
        <h2 className="text-lg text-brand-900">Message sent</h2>
        <p className="mt-2 text-sm text-stone-600">
          Thanks for reaching out — our team typically replies within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <input id="name" name="name" type="text" required className="field-input" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" name="email" type="email" required className="field-input" />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="field-label">Phone (optional)</label>
        <input id="phone" name="phone" type="tel" className="field-input" />
      </div>
      <div>
        <label htmlFor="message" className="field-label">Message</label>
        <textarea id="message" name="message" required rows={5} className="field-input" />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button type="submit" disabled={status === "submitting"} className="btn-primary w-full sm:w-auto">
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

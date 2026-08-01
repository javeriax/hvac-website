import type { Metadata } from "next";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import TrackRequestForm from "@/components/TrackRequestForm";

export const metadata: Metadata = { title: "Track Request" };

export default function TrackRequestPage() {
  return (
    <>
      <PageHero
        eyebrow="Track Request"
        title="Check the status of your service request."
        subtitle="Enter the tracking code you received after submitting a request."
      />

      <section className="section-container max-w-xl py-20">
        <Suspense fallback={null}>
          <TrackRequestForm />
        </Suspense>
      </section>
    </>
  );
}

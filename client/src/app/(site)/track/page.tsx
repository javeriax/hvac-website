import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHero } from '@/components/site/PageHero';
import { TrackRequest } from '@/components/site/TrackRequest';
import { Skeleton } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Track a Request',
  description:
    'Check the live status of an ArcticAir service request using your tracking code, no account required.',
};

export default function TrackPage() {
  return (
    <>
      <PageHero
        index="10"
        eyebrow="Track a Request"
        title="Where is my job right now?"
        lede="Enter the code from your confirmation and see exactly where the request sits, reviewed, quoted, scheduled or complete, with the technician's name once assigned."
      />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <TrackRequest />
        </Suspense>
      </section>
    </>
  );
}

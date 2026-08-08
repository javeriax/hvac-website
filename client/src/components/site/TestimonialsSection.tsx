'use client';

import { useState } from 'react';
import { ReviewForm } from './ReviewForm';
import { TestimonialWall } from './TestimonialWall';

/**
 * Wraps the review wall and the write-a-review panel together.
 *
 * They need to share one piece of state: when someone submits a review the
 * wall should refetch, in case an admin approves it while the page is still
 * open. Both are client components, so they need a client parent to hold it.
 */
export function TestimonialsSection() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <TestimonialWall refreshKey={refreshKey} />

      <div className="mt-14">
        <ReviewForm onPublishedChange={() => setRefreshKey((k) => k + 1)} />
      </div>
    </>
  );
}

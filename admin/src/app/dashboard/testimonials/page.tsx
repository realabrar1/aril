'use client';

import React, { useEffect } from 'react';
import { TestimonialsManager } from '@/components/customers/TestimonialsManager';

export default function TestimonialsPage() {
  useEffect(() => {
    document.title = 'Client Testimonials | ARILHA Admin';
  }, []);

  return (
    <div className="space-y-6">
      <TestimonialsManager />
    </div>
  );
}

import PaymentDetailsClient from './PaymentDetailsClient';

export function generateStaticParams() {
  return Array.from({ length: 100 }, (_, i) => ({ id: String(i + 1) }));
}

export default function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <PaymentDetailsClient params={params} />;
}

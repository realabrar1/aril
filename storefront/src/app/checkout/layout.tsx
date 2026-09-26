import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | ARILHA',
  description: 'Secure checkout page for ARILHA by Irsa Khan.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

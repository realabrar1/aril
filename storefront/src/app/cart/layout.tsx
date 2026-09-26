import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Bag | ARILHA',
  description: 'View items in your shopping bag at ARILHA by Irsa Khan.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

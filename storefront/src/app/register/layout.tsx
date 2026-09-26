import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | ARILHA',
  description: 'Create your ARILHA account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

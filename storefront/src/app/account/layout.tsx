import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account | ARILHA',
  description: 'Manage your profile and orders at ARILHA by Irsa Khan.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

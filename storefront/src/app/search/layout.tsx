import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Results | ARILHA',
  description: 'Search jewellery products at ARILHA by Irsa Khan.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

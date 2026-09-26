import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist | ARILHA',
  description: 'Saved wishlist items at ARILHA by Irsa Khan.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

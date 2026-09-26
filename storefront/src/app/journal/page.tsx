import { redirect, RedirectType } from 'next/navigation';

export default function JournalIndexPage() {
  redirect('/blog', RedirectType.replace);
}

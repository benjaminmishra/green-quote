import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { hasPermission } from '@/shared/rbac';
import { QuotesTable } from '@/modules/quotes/ui/QuotesTable';

export default async function Page(){
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');
  try {
    const auth = await verifyToken(token!);
    if (!hasPermission(auth, 'admin:quotes:read')) redirect('/quotes');
  } catch { redirect('/login'); }
  return <div><h2>Admin Quotes</h2><QuotesTable admin/></div>;
}

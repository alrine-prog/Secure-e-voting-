import { GetServerSideProps } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: { cookie }, redirect: 'manual' });
    if (!res.ok) return { redirect: { destination: '/login?role=system_owner', permanent: false } };
    const data = await res.json();
    if (data?.user?.role === 'system_owner') return { redirect: { destination: '/admin/university/pending', permanent: false } };
    return { redirect: { destination: '/unauthorized', permanent: false } };
  } catch {
    return { redirect: { destination: '/login?role=system_owner', permanent: false } };
  }
};

export default function SystemOwnerIndex() { return null; }

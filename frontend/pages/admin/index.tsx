// frontend/pages/admin/index.tsx
import { GetServerSideProps } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { cookie },
      // Do not follow redirects from the API — just get JSON
      redirect: 'manual',
    });

    if (!res.ok) {
      // Not authenticated — send user to admin login
      return {
        redirect: {
          destination: '/login?role=admin',
          permanent: false,
        },
      };
    }

    const data = await res.json();
    const role = data?.user?.role || '';

    if (role === 'system_owner') {
      return {
        redirect: {
          destination: '/admin/system-owner',
          permanent: false,
        },
      };
    }

    if (role === 'university_admin') {
      return {
        redirect: {
          destination: '/admin/university',
          permanent: false,
        },
      };
    }

    // default for other admin-like roles (staff/admin)
    return {
      redirect: {
        destination: '/admin/general',
        permanent: false,
      },
    };
  } catch (err) {
    // On error, fallback to login
    return {
      redirect: {
        destination: '/login?role=admin',
        permanent: false,
      },
    };
  }
};

export default function AdminIndex() {
  // getServerSideProps will always redirect, but Next requires a default export
  return null;
}

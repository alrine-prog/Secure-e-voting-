// frontend/pages/system-owner/index.tsx
import { GetServerSideProps } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookie = ctx.req.headers.cookie || '';

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { cookie },
      redirect: 'manual',
    });

    if (!res.ok) {
      // Unauthenticated — redirect to login
      return {
        redirect: {
          destination: '/login?role=system_owner',
          permanent: false,
        },
      };
    }

    const data = await res.json();
    const role = data?.user?.role || '';

    // Only allow system_owner to proceed to the main system owner area
    if (role === 'system_owner') {
      return {
        redirect: {
          destination: '/system-owner/universities', // Default dashboard/landing page for system_owner
          permanent: false,
        },
      };
    }

    // Authenticated, but NOT a system_owner (e.g., uni_admin, voter, staff)
    return {
      redirect: {
        destination: '/unauthorized',
        permanent: false,
      },
    };
  } catch (err) {
    // Network or server error — fallback to login
    return {
      redirect: {
        destination: '/login?role=system_owner',
        permanent: false,
      },
    };
  }
};

export default function SystemOwnerIndex() {
  return null;
}

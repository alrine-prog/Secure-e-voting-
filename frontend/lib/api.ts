export const apiFetch = async (path: string, opts: RequestInit = {}) => {
  const base = process.env.NEXT_PUBLIC_API_BASE || '';
  const res = await fetch(base + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, body: text ? JSON.parse(text) : null };
  } catch {
    return { ok: res.ok, status: res.status, body: text };
  }
};
// Add this to the end of your existing api.ts file

export function redirectUserByRole(role: string, router: any) {
  switch (role) {
    case 'system_owner':
      router.push('/system-owner/universities');
      break;
    case 'uni_admin':
      router.push('/admin/dashboard');
      break;
    case 'staff':
      router.push('/staff/register-voter');
      break;
    case 'voter':
      router.push('/voter/ballot');
      break;
    case 'observer':
      router.push('/observer/live-tally');
      break;
    default:
      router.push('/unauthorized');
      break;
  }
}

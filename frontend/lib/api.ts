export const apiFetch = async (path: string, opts: RequestInit = {}) => {
  const base = process.env.NEXT_PUBLIC_API_BASE || '';
  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers || {}),
  };
  const res = await fetch(base + path, {
    credentials: 'include',
    headers,
    ...opts,
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, body: text ? JSON.parse(text) : null };
  } catch {
    return { ok: res.ok, status: res.status, body: text };
  }
};

export function redirectUserByRole(role: string, router: { push: (path: string) => unknown }) {
  switch (role) {
    case 'system_owner': router.push('/admin/university/pending'); break;
    case 'uni_admin':
    case 'university_admin': router.push('/admin'); break;
    case 'staff': router.push('/staff'); break;
    case 'voter': router.push('/voter'); break;
    case 'observer': router.push('/observer/dashboard'); break;
    default: router.push('/unauthorized'); break;
  }
}

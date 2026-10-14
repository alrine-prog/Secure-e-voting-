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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SESSION_KEY = 'bioplit_admin_session';

export type AdminSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: { id: string; email?: string };
};

function config() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase не настроен. Проверьте переменные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в Vercel.');
  }
  return { url: SUPABASE_URL.replace(/\/$/, ''), key: SUPABASE_KEY };
}

export function getSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AdminSession : null;
  } catch {
    return null;
  }
}

function saveSession(session: AdminSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

async function request(path: string, init: RequestInit = {}, session?: AdminSession | null) {
  const { url, key } = config();
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('Content-Type', 'application/json');
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);
  else headers.set('Authorization', `Bearer ${key}`);
  const response = await fetch(`${url}${path}`, { ...init, headers });
  const body = await response.text();
  let data: unknown = null;
  try { data = body ? JSON.parse(body) : null; } catch { data = body; }
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data
      ? String((data as { message: unknown }).message)
      : typeof data === 'object' && data && 'msg' in data
        ? String((data as { msg: unknown }).msg)
        : `Ошибка Supabase (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export async function signIn(email: string, password: string): Promise<AdminSession> {
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(String(data.msg || data.message || 'Не удалось войти'));
  const session: AdminSession = {
    access_token: String(data.access_token),
    refresh_token: String(data.refresh_token),
    expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
    user: data.user as AdminSession['user'],
  };
  saveSession(session);
  return session;
}

export function signOut() { saveSession(null); }

export async function currentSession(): Promise<AdminSession | null> {
  let session = getSession();
  if (!session) return null;
  if (session.expires_at && session.expires_at > Math.floor(Date.now() / 1000) + 60) return session;
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const data = await response.json() as Record<string, unknown>;
  if (!response.ok) { saveSession(null); return null; }
  session = {
    access_token: String(data.access_token),
    refresh_token: String(data.refresh_token),
    expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
    user: data.user as AdminSession['user'],
  };
  saveSession(session);
  return session;
}

export async function isAdmin(session: AdminSession) {
  const rows = await request('/rest/v1/admin_users?select=user_id&user_id=eq.' + encodeURIComponent(session.user.id) + '&limit=1', {}, session);
  return Array.isArray(rows) && rows.length > 0;
}

export async function listRows(table: string, session: AdminSession) {
  return await request(`/rest/v1/${table}?select=*&order=sort_order.asc,created_at.desc`, {}, session) as Record<string, unknown>[];
}

export async function saveRow(table: string, row: Record<string, unknown>, session: AdminSession) {
  const isUpdate = typeof row.id === 'string' && row.id.length > 0;
  const path = isUpdate
    ? `/rest/v1/${table}?id=eq.${encodeURIComponent(String(row.id))}`
    : `/rest/v1/${table}`;
  return request(path, {
    method: isUpdate ? 'PATCH' : 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  }, session);
}

export async function deleteRow(table: string, id: string, session: AdminSession) {
  await request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }, session);
}

export async function uploadImage(file: File, session: AdminSession) {
  const { url, key } = config();
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
  const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const response = await fetch(`${url}/storage/v1/object/site-media/${path}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: file,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(String(error.message || 'Не удалось загрузить изображение'));
  }
  return `${url}/storage/v1/object/public/site-media/${path}`;
}

export async function publicRows(table: string) {
  return await request(`/rest/v1/${table}?select=*&is_active=eq.true&order=sort_order.asc,created_at.desc`) as Record<string, unknown>[];
}

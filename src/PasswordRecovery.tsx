import { useEffect, useState, type FormEvent } from 'react';
import { isAdmin, saveRecoverySession, updateAccountPassword, type AdminSession } from './lib/supabase';

export default function PasswordRecovery() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    async function verifyLink() {
      try {
        const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
        if (!supabaseUrl || !anonKey) throw new Error('Сервис авторизации не настроен. Обратитесь к владельцу сайта.');

        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const query = new URLSearchParams(window.location.search);
        let nextSession: AdminSession | null = null;

        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');
        if (accessToken && refreshToken && hash.get('type') === 'recovery') {
          const response = await fetch(supabaseUrl + '/auth/v1/user', {
            headers: { apikey: anonKey, Authorization: 'Bearer ' + accessToken },
          });
          if (!response.ok) throw new Error('Ссылка восстановления истекла или уже использована. Запросите новое письмо.');
          const user = await response.json();
          nextSession = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: Math.floor(Date.now() / 1000) + Number(hash.get('expires_in') || 3600),
            user,
          };
        } else if (query.get('token_hash')) {
          const response = await fetch(supabaseUrl + '/auth/v1/verify', {
            method: 'POST',
            headers: { apikey: anonKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ token_hash: query.get('token_hash'), type: 'recovery' }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.msg || data.message || 'Ссылка восстановления недействительна.');
          nextSession = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 3600),
            user: data.user,
          };
        } else if (query.get('error_description')) {
          throw new Error(query.get('error_description') || 'Не удалось подтвердить ссылку.');
        } else {
          throw new Error('Ссылка восстановления не найдена. Запросите новое письмо и откройте самую последнюю ссылку.');
        }

        if (!nextSession?.access_token || !nextSession.refresh_token || !nextSession.user?.id) {
          throw new Error('Не удалось подтвердить ссылку. Запросите новое письмо.');
        }
        saveRecoverySession(nextSession);
        if (active) setSession(nextSession);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Ошибка восстановления пароля');
      } finally {
        if (active) setChecking(false);
      }
    }
    void verifyLink();
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    if (password.length < 8) { setError('Пароль должен содержать не менее 8 символов.'); return; }
    if (password !== confirm) { setError('Пароли не совпадают.'); return; }
    setSaving(true); setError('');
    try {
      await updateAccountPassword(session, password);
      if (!(await isAdmin(session))) throw new Error('Пароль изменён, но у аккаунта нет прав администратора. Проверьте доступ в Supabase.');
      setDone(true);
      setPassword('');
      setConfirm('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить новый пароль');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#171D27] flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <a href="/" className="text-sm font-semibold text-orange-600">← На сайт БИОПЛИТ</a>
        <div className="mt-7 text-3xl font-black text-slate-900">БИО<span className="text-orange-600">ПЛИТ</span></div>
        <h1 className="mt-2 text-xl font-bold text-slate-800">Новый пароль</h1>
        {checking ? <p className="mt-5 text-sm text-slate-600">Проверяем ссылку восстановления…</p>
          : done ? <div className="mt-5">
              <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">Пароль успешно изменён. Теперь можно войти в панель управления.</p>
              <a href="/admin" className="mt-5 block rounded-lg bg-orange-600 py-3 text-center font-bold text-white">Перейти ко входу</a>
            </div>
          : session ? <form onSubmit={handleSubmit}>
              <p className="mt-2 text-sm text-slate-500">Придумайте новый пароль длиной не менее 8 символов.</p>
              <label className="mt-6 block text-sm font-semibold text-slate-700">Новый пароль</label>
              <input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-orange-500" />
              <label className="mt-4 block text-sm font-semibold text-slate-700">Повторите пароль</label>
              <input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-orange-500" />
              {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button disabled={saving} className="mt-6 w-full rounded-lg bg-orange-600 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50">{saving ? 'Сохраняем…' : 'Сохранить новый пароль'}</button>
            </form>
          : <div className="mt-5">
              <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>
              <a href="/admin" className="mt-5 block text-center text-sm font-semibold text-orange-700">Вернуться ко входу</a>
            </div>}
      </section>
    </main>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  currentSession, deleteRow, getSession, isAdmin, listRows, saveRow, signIn, signOut,
  uploadImage, sendPasswordReset, type AdminSession,
} from './lib/supabase';

type Row = Record<string, unknown>;
type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'number' | 'url' | 'checkbox' | 'select'; required?: boolean; options?: Array<{ value: string; label: string }> };
type Section = { id: string; title: string; table: string; fields: Field[] };

const sections: Section[] = [
  { id: 'catalog', title: 'Каталог', table: 'catalog_items', fields: [
    { key: 'title', label: 'Название', required: true }, { key: 'title_short', label: 'Короткое название' },
    { key: 'category', label: 'Категория' }, { key: 'description', label: 'Описание', type: 'textarea' },
    { key: 'image_url', label: 'Фото (URL)' }, { key: 'price', label: 'Цена', type: 'number' },
    { key: 'unit', label: 'Единица измерения' }, { key: 'sort_order', label: 'Порядок', type: 'number' },
    { key: 'is_active', label: 'Показывать на сайте', type: 'checkbox' },
  ]},
  { id: 'products', title: 'Товары каталога', table: 'catalog_products', fields: [
    { key: 'title', label: 'Название товара', required: true },
    { key: 'article', label: 'Артикул' },
    { key: 'category', label: 'Категория', type: 'select', required: true, options: [
      { value: 'facade', label: 'Фасадная плитка и камень' },
      { value: 'cokol', label: 'Цокольные панели' },
      { value: 'brus', label: 'Брусчатка и тротуарная плитка' },
      { value: 'tactile', label: 'Тактильная плитка' },
      { value: 'bord', label: 'Бордюры и водостоки' },
      { value: 'vazon', label: 'Цветочные вазоны' },
    ]},
    { key: 'description', label: 'Описание', type: 'textarea' },
    { key: 'image_url', label: 'Фото (URL)' },
    { key: 'price', label: 'Индивидуальная цена', type: 'number' },
    { key: 'unit', label: 'Единица измерения (м², шт.)' },
    { key: 'sort_order', label: 'Порядок', type: 'number' },
    { key: 'is_active', label: 'Показывать на сайте', type: 'checkbox' },
  ]},
  { id: 'works', title: 'Наши работы', table: 'works', fields: [
    { key: 'title', label: 'Название проекта', required: true }, { key: 'category', label: 'Категория' },
    { key: 'description', label: 'Описание', type: 'textarea' }, { key: 'image_url', label: 'Фото (URL)' },
    { key: 'video_url', label: 'Ссылка на видео', type: 'url' }, { key: 'year', label: 'Год' },
    { key: 'location', label: 'Место' }, { key: 'sort_order', label: 'Порядок', type: 'number' },
    { key: 'is_active', label: 'Показывать на сайте', type: 'checkbox' },
  ]},
  { id: 'services', title: 'Услуги', table: 'services', fields: [
    { key: 'title', label: 'Название услуги', required: true }, { key: 'description', label: 'Описание', type: 'textarea' },
    { key: 'price', label: 'Цена', type: 'number' }, { key: 'unit', label: 'Единица измерения' },
    { key: 'sort_order', label: 'Порядок', type: 'number' }, { key: 'is_active', label: 'Показывать на сайте', type: 'checkbox' },
  ]},
  { id: 'prices', title: 'Прайс-лист', table: 'price_items', fields: [
    { key: 'title', label: 'Наименование', required: true }, { key: 'category', label: 'Категория' },
    { key: 'price', label: 'Цена', type: 'number', required: true }, { key: 'unit', label: 'За что (м², шт., п.м.)' },
    { key: 'description', label: 'Примечание', type: 'textarea' }, { key: 'sort_order', label: 'Порядок', type: 'number' },
    { key: 'is_active', label: 'Показывать на сайте', type: 'checkbox' },
  ]},
  { id: 'settings', title: 'Настройки сайта', table: 'site_settings', fields: [
    { key: 'key', label: 'Ключ настройки', required: true }, { key: 'label', label: 'Название' },
    { key: 'value', label: 'Значение', type: 'textarea' }, { key: 'sort_order', label: 'Порядок', type: 'number' },
  ]},
];

const blankRow = (section: Section): Row => Object.fromEntries(section.fields.map(field => [
  field.key, field.type === 'checkbox' ? true : field.type === 'number' ? 0 : '',
]));

export default function AdminPanel() {
  const [session, setSession] = useState<AdminSession | null>(getSession());
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState('catalog');
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const section = useMemo(() => sections.find(item => item.id === active) || sections[0], [active]);

  const load = useCallback(async (current: AdminSession, selected: Section) => {
    const data = await listRows(selected.table, current);
    setRows(data);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const current = await currentSession();
        if (!alive) return;
        if (current) {
          const allowed = await isAdmin(current);
          if (!alive) return;
          setSession(current);
          setAuthorized(allowed);
          if (allowed) await load(current, section);
          else setError('У этой учётной записи нет прав администратора. Добавьте её UUID в таблицу admin_users.');
        }
      } catch (e) { if (alive) setError(e instanceof Error ? e.message : 'Ошибка подключения'); }
      finally { if (alive) setReady(true); }
    })();
    return () => { alive = false; };
  }, [load, section]);

  useEffect(() => {
    if (session && authorized) load(session, section).catch(e => setError(e instanceof Error ? e.message : 'Не удалось загрузить данные'));
  }, [session, authorized, section, load]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const current = await signIn(email.trim(), password);
      const allowed = await isAdmin(current);
      setSession(current); setAuthorized(allowed);
      if (!allowed) setError('Вход выполнен, но у пользователя пока нет роли администратора. Добавьте UUID пользователя в admin_users в Supabase.');
      else { setPassword(''); setNotice('Вход выполнен'); await load(current, section); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось войти'); }
    finally { setBusy(false); }
  }

  async function handlePasswordReset(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить письмо');
    } finally {
      setBusy(false);
    }
  }

  async function switchSection(id: string) {
    setActive(id); setEditing(null); setError(''); setNotice('');
  }

  function startEdit(row?: Row) {
    setEditing(row ? { ...row } : blankRow(section));
    setImageFile(null); setError(''); setNotice('');
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!session || !editing) return;
    setBusy(true); setError('');
    try {
      const next = { ...editing };
      if (imageFile) next.image_url = await uploadImage(imageFile, session);
      await saveRow(section.table, next, session);
      setEditing(null); setImageFile(null);
      await load(session, section);
      setNotice('Изменения сохранены');
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось сохранить'); }
    finally { setBusy(false); }
  }

  async function handleDelete(row: Row) {
    if (!session || typeof row.id !== 'string' || !window.confirm('Удалить эту запись?')) return;
    setBusy(true); setError('');
    try { await deleteRow(section.table, row.id, session); await load(session, section); setNotice('Запись удалена'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Не удалось удалить'); }
    finally { setBusy(false); }
  }

  function updateField(key: string, value: unknown) {
    setEditing(previous => previous ? { ...previous, [key]: value } : previous);
  }

  if (!ready) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white">Загрузка панели управления…</div>;

  if (!session || !authorized) return (
    <main className="min-h-screen bg-[#171D27] flex items-center justify-center p-4">
      {showForgot ? (
        <form onSubmit={handlePasswordReset} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <a href="/" className="text-sm font-semibold text-orange-600">← На сайт БИОПЛИТ</a>
          <div className="mt-7 text-3xl font-black text-slate-900">БИО<span className="text-orange-600">ПЛИТ</span></div>
          <h1 className="mt-2 text-xl font-bold text-slate-800">Восстановление пароля</h1>
          {resetSent ? <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">Если аккаунт с этой почтой существует, письмо для восстановления отправлено. Откройте последнее письмо и перейдите по ссылке.</p> : <>
            <p className="mt-2 text-sm text-slate-500">Укажите почту администратора. Мы отправим ссылку для создания нового пароля.</p>
            <label className="mt-6 block text-sm font-semibold text-slate-700">Электронная почта</label>
            <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-orange-500" />
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="mt-6 w-full rounded-lg bg-orange-600 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50">{busy ? 'Отправляем…' : 'Отправить ссылку'}</button>
          </>}
          <button type="button" onClick={() => { setShowForgot(false); setResetSent(false); setError(''); }} className="mt-4 w-full text-sm font-semibold text-slate-600">Вернуться ко входу</button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <a href="/" className="text-sm font-semibold text-orange-600">← На сайт БИОПЛИТ</a>
          <div className="mt-7 text-3xl font-black text-slate-900">БИО<span className="text-orange-600">ПЛИТ</span></div>
          <h1 className="mt-2 text-xl font-bold text-slate-800">Панель управления</h1>
          <p className="mt-2 text-sm text-slate-500">Вход только для пользователей, которым выдан доступ администратора.</p>
          <label className="mt-6 block text-sm font-semibold text-slate-700">Электронная почта</label>
          <input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-orange-500" />
          <label className="mt-4 block text-sm font-semibold text-slate-700">Пароль</label>
          <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-orange-500" />
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="mt-6 w-full rounded-lg bg-orange-600 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50">{busy ? 'Входим…' : 'Войти'}</button>
          <button type="button" onClick={() => { setShowForgot(true); setError(''); }} className="mt-4 w-full text-sm font-semibold text-orange-700 hover:underline">Забыли пароль?</button>
        </form>
      )}
    </main>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-[#212832] px-4 py-4 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div><a href="/" className="text-xl font-black">БИО<span className="text-orange-500">ПЛИТ</span></a><div className="text-xs text-white/60">Панель управления сайтом</div></div>
          <div className="flex items-center gap-3 text-sm"><span className="hidden sm:inline text-white/70">{session.user.email}</span><a href="/" className="rounded-lg border border-white/20 px-3 py-2">Открыть сайт</a><button onClick={() => { signOut(); setSession(null); setAuthorized(false); }} className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20">Выйти</button></div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {sections.map(item => <button key={item.id} onClick={() => switchSection(item.id)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${active === item.id ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}>{item.title}</button>)}
        </div>
        {error && <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-2xl font-black">{section.title}</h1><p className="mt-1 text-sm text-slate-500">Записей: {rows.length}</p></div>
            <button onClick={() => startEdit()} className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700">+ Добавить</button>
          </div>
          {editing && (
            <form onSubmit={handleSave} className="mt-6 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
              <h2 className="mb-4 font-bold">{editing.id ? 'Редактирование записи' : 'Новая запись'}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map(field => <label key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <span className="mb-1 block text-sm font-semibold text-slate-700">{field.label}</span>
                  {field.type === 'checkbox' ? <input type="checkbox" checked={Boolean(editing[field.key])} onChange={e => updateField(field.key, e.target.checked)} className="h-5 w-5 accent-orange-600" />
                    : field.type === 'textarea' ? <textarea value={String(editing[field.key] ?? '')} onChange={e => updateField(field.key, e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 bg-white p-3" />
                    : field.type === 'select' ? <select required={field.required} value={String(editing[field.key] ?? '')} onChange={e => updateField(field.key, e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3"><option value="">Выберите категорию</option>{(field.options || []).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                    : <input type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'} required={field.required} value={String(editing[field.key] ?? '')} onChange={e => updateField(field.key, field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3" />}
                </label>)}
                {section.fields.some(field => field.key === 'image_url') && <label className="sm:col-span-2"><span className="mb-1 block text-sm font-semibold text-slate-700">Загрузить новое фото</span><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="block w-full text-sm" /><span className="mt-1 block text-xs text-slate-500">Фото загрузится в защищённое хранилище сайта после сохранения.</span></label>}
              </div>
              <div className="mt-5 flex flex-wrap gap-2"><button disabled={busy} className="rounded-lg bg-orange-600 px-5 py-2.5 font-bold text-white disabled:opacity-50">{busy ? 'Сохраняем…' : 'Сохранить'}</button><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold">Отмена</button></div>
            </form>
          )}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500"><th className="px-3 py-3">Название / ключ</th><th className="px-3 py-3">Описание / данные</th><th className="px-3 py-3">Статус</th><th className="px-3 py-3 text-right">Действия</th></tr></thead>
              <tbody>{rows.map((row, index) => <tr key={String(row.id || index)} className="border-b border-slate-100">
                <td className="px-3 py-4 font-semibold">{String(row.title || row.key || 'Без названия')}{Boolean(row.image_url) && <img src={String(row.image_url)} alt="" className="mt-2 h-12 w-16 rounded object-cover" />}</td>
                <td className="max-w-sm px-3 py-4 text-slate-500">{String(row.description || row.value || (row.price != null ? `${row.price} ${row.unit || ''}` : '—')).slice(0, 110)}</td>
                <td className="px-3 py-4">{row.is_active === false ? <span className="text-slate-400">Скрыто</span> : <span className="text-emerald-700">Активно</span>}</td>
                <td className="px-3 py-4 text-right whitespace-nowrap"><button onClick={() => startEdit(row)} className="rounded-md px-3 py-2 font-semibold text-orange-700 hover:bg-orange-50">Изменить</button><button onClick={() => handleDelete(row)} className="rounded-md px-3 py-2 font-semibold text-red-600 hover:bg-red-50">Удалить</button></td>
              </tr>)}</tbody>
            </table>
            {rows.length === 0 && <p className="py-10 text-center text-sm text-slate-500">Пока нет записей. Нажмите «Добавить», чтобы создать первую.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

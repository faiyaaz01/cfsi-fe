import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, AuthUser } from '../lib/api';
import { useAuth } from '../context/AuthContext';
const empty = {username: '', password: '', full_name: '', role: 'student' as AuthUser['role'], certificate_number: '', is_active: true};
export function UsersPage() {
  const {user} = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [form, setForm] = useState({...empty});
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => setUsers(await api.users());
  useEffect(() => { load().catch(e => setError(e.message)); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const body: any = {...form, certificate_number: form.role === 'student' ? form.certificate_number : null};
      if (editing) { delete body.username; if (!body.password) delete body.password; }
      await api.users(editing ? 'PATCH' : 'POST', editing || '', body);
      setEditing(null); setForm({...empty}); await load(); setMessage('User saved successfully.');
    } catch(e) { setError(e.message); } finally {setBusy(false);}
  }
  async function remove(account: AuthUser) {
    if (!window.confirm(`Delete user ${account.username}? This removes their login access.`)) return;
    setBusy(true); setError('');
    try { await api.users('DELETE', account.id); await load(); setMessage('User deleted.'); }
    catch(e) {setError(e.message);} finally {setBusy(false);}
  }
  const input = 'w-full border rounded-lg p-2 bg-white dark:bg-slate-800';
  return <main className="max-w-6xl mx-auto p-6 space-y-6">
    <Link to="/dashboard" className="text-primary">← Dashboard</Link>
    <h1 className="text-3xl font-bold">User management</h1>
    <p>Create accounts and assign Admin, Teacher, or Student access. Student accounts must link to an existing certificate number. Account updates end existing sessions.</p>
    {error && <p role="alert" className="text-red-600">{error}</p>}{message && <p role="status" className="text-green-700">{message}</p>}
    <form onSubmit={save} className="border rounded-xl p-5 grid sm:grid-cols-2 gap-4">
      <h2 className="sm:col-span-2 text-xl font-bold">{editing ? 'Edit user' : 'Create user'}</h2>
      <label>Username<input className={input} required minLength={3} maxLength={100} disabled={!!editing} value={form.username} onChange={e => setForm({...form, username:e.target.value})} autoComplete="off" /></label>
      <label>Full name<input className={input} required maxLength={200} value={form.full_name} onChange={e => setForm({...form, full_name:e.target.value})} /></label>
      <label>{editing ? 'New password (leave blank to keep)' : 'Password'}<input type="password" className={input} required={!editing} minLength={8} maxLength={72} value={form.password} onChange={e => setForm({...form, password:e.target.value})} autoComplete="new-password" /></label>
      <label>Role<select className={input} value={form.role} disabled={editing === user?.id} onChange={e => setForm({...form, role:e.target.value as AuthUser['role']})}><option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option></select></label>
      {form.role === 'student' && <label>Certificate number<input className={input} required value={form.certificate_number} onChange={e => setForm({...form, certificate_number:e.target.value})} /></label>}
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} disabled={editing === user?.id} onChange={e => setForm({...form, is_active:e.target.checked})} /> Active account</label>
      <div className="flex gap-4"><button disabled={busy} className="bg-primary text-white px-4 py-2 rounded-lg">{busy ? 'Saving…' : 'Save user'}</button>{editing && <button type="button" onClick={() => {setEditing(null);setForm({...empty});}}>Cancel</button>}</div>
    </form>
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{['Name / username','Role','Status','Actions'].map(x => <th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{users.map(account => <tr key={account.id} className="border-t"><td className="p-3">{account.full_name}<div className="text-sm text-gray-500">{account.username}</div></td><td className="p-3 capitalize">{account.role}</td><td className="p-3">{account.is_active ? 'Active' : 'Inactive'}</td><td className="p-3 space-x-4"><button disabled={busy} onClick={() => {setEditing(account.id);setForm({...empty,...account,password:'',full_name:account.full_name || '',certificate_number:account.certificate_number || ''});setError('');}}>Edit</button><button disabled={busy || account.id === user?.id} className="text-red-600 disabled:opacity-30" onClick={() => void remove(account)}>Delete</button></td></tr>)}</tbody></table></div>
  </main>;
}

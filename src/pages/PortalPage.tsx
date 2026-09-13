import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
export function PortalPage() {
  const {user} = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState('attendance');
  const [message, setMessage] = useState('');
  const load = async () => {const [a,r] = await Promise.all([api.getAttendance(),api.getResults()]);setAttendance(a);setResults(r);};
  useEffect(() => {load().catch(e => setError(e.message)).finally(() => setLoading(false));}, [user?.id]);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const data = Object.fromEntries(new FormData(form));
    setBusy(true);setError('');setMessage('');
    try {
      if (kind === 'attendance') await api.saveAttendanceSingle(data);
      else await api.createResult({...data,marks_obtained:Number(data.marks_obtained),max_marks:Number(data.max_marks)});
      await load(); setMessage('Record saved.'); form.reset();
    } catch(e) {setError(e.message);} finally {setBusy(false);}
  }
  const field = (name: string, label: string, type='text', value?: string) => <label key={name}>{label}<input name={name} type={type} required defaultValue={value} min={type === 'number' ? 0 : undefined} className="block w-full rounded border p-2 bg-white dark:bg-slate-800" /></label>;
  return <main className="max-w-6xl mx-auto p-6 space-y-6"><h1 className="text-3xl font-bold capitalize">{user?.role} portal</h1><p>Welcome, {user?.full_name}. {user?.role === 'student' ? 'Your attendance and examination records appear below.' : 'Review and record student attendance and examination results.'}</p>
    {error && <p role="alert" className="text-red-600">{error}</p>}{message && <p role="status" className="text-green-700">{message}</p>}
    {user?.role === 'teacher' && <section className="border rounded-xl p-5"><h2 className="text-xl font-bold mb-4">Add a record</h2><select aria-label="Record type" value={kind} onChange={e => setKind(e.target.value)} className="border rounded p-2 mb-4 dark:bg-slate-800"><option value="attendance">Attendance</option><option value="results">Exam result</option></select><form key={kind} onSubmit={save} className="grid sm:grid-cols-2 gap-4">{field('certificate_number','Certificate number')}{field('course','Course')}{kind === 'attendance' ? <>{field('date','Date','date')}{field('slot','Slot', 'text','Slot 1')}<label>Status<select name="status" className="block border rounded p-2 dark:bg-slate-800"><option>Present</option><option>Absent</option></select></label>{field('topic_or_module','Topic / module')}</> : <>{field('subject','Subject')}{field('exam_date','Exam date','date')}{field('marks_obtained','Marks obtained','number')}{field('max_marks','Maximum marks','number','100')}{field('grade','Grade')}{field('semester_or_term','Semester / term')}</>}<button disabled={busy} className="bg-primary text-white rounded-lg p-2">{busy ? 'Saving…' : 'Save record'}</button></form></section>}
    {loading ? <p role="status">Loading records…</p> : <>{[['Attendance',attendance,['certificateNumber','date','slot','status']],['Results',results,['certificateNumber','subject','examDate','marksObtained','maxMarks','grade']]].map(([title, rows, columns]: any) => <section key={title}><h2 className="text-xl font-bold mb-3">{title}</h2>{rows.length === 0 ? <p>No records yet.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{columns.map(c => <th key={c} className="p-3 capitalize">{c.replace(/([A-Z])/g, ' $1')}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t">{columns.map(c => <td key={c} className="p-3">{row[c]}</td>)}</tr>)}</tbody></table></div>}</section>)}</>}
  </main>;
}

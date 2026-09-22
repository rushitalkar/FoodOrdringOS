'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ upiId: '', gstPercent: 5, language: 'english', whatsappToken: '', razorpayKey: '', printerEnabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const readResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    const text = await response.text();
    throw new Error(`Settings API returned ${response.status}: ${text.slice(0, 120)}`);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetch('http://localhost:5000/api/auth/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load settings');
        const data = await readResponse(response);
        setSettings((current) => ({ ...current, ...data }));
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [router]);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...settings, gstPercent: Number(settings.gstPercent) })
      });
      const data = await readResponse(response);
      if (!response.ok) throw new Error(data.error || 'Unable to save settings');
      setSettings((current) => ({ ...current, ...data }));
      setMessage('Settings saved.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-100 font-bold text-gray-700">Loading settings...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-orange-600">Restaurant Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Configure billing, language, notifications, and kitchen printing.</p>
        </div>
        <form onSubmit={saveSettings} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">UPI ID<input value={settings.upiId || ''} onChange={(event) => setSettings({ ...settings, upiId: event.target.value })} placeholder="restaurant@upi" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900" /></label>
            <label className="text-sm font-semibold text-gray-700">GST %<input type="number" min="0" value={settings.gstPercent} onChange={(event) => setSettings({ ...settings, gstPercent: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900" /></label>
            <label className="text-sm font-semibold text-gray-700">Notification language<select value={settings.language} onChange={(event) => setSettings({ ...settings, language: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900"><option value="english">English</option><option value="marathi">Marathi</option><option value="hindi">Hindi</option></select></label>
            <label className="text-sm font-semibold text-gray-700">WhatsApp token<input type="password" value={settings.whatsappToken || ''} onChange={(event) => setSettings({ ...settings, whatsappToken: event.target.value })} placeholder="Optional" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900" /></label>
            <label className="text-sm font-semibold text-gray-700">Razorpay key<input type="password" value={settings.razorpayKey || ''} onChange={(event) => setSettings({ ...settings, razorpayKey: event.target.value })} placeholder="Optional" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal text-gray-900" /></label>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-gray-700"><input type="checkbox" checked={Boolean(settings.printerEnabled)} onChange={(event) => setSettings({ ...settings, printerEnabled: event.target.checked })} className="h-5 w-5 accent-orange-600" /> Enable kitchen printer</label>
          {message && <p className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800">{message}</p>}
          <button type="submit" disabled={saving} className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save settings'}</button>
        </form>
      </div>
    </main>
  );
}

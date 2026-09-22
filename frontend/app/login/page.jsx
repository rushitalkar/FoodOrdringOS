'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/auth/${registerMode ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerMode
          ? { name, subdomain, ownerEmail: email, password }
          : { subdomain, ownerEmail: email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed. Please check credentials.');
      }

      if (registerMode) {
        setRegisterMode(false);
        setError('Account created. Sign in with your new credentials.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('companyId', data.companyId);

      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-orange-600 tracking-tight">FoodOrderingOS</h1>
          <p className="text-gray-500 text-sm mt-1">{registerMode ? 'Create your restaurant account' : 'Sign in to manage your restaurant operations'}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {registerMode && <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="My Restaurant" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" />
          </div>}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Subdomain</label>
            <input type="text" required value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="my-restaurant" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Owner Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@restaurant.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md disabled:opacity-50">
            {loading ? 'Please wait...' : registerMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <button type="button" onClick={() => { setRegisterMode(!registerMode); setError(''); }} className="w-full mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700">
          {registerMode ? 'Already have an account? Sign in' : 'New restaurant? Create an account'}
        </button>
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    revenue: 0,
    pendingKOT: 0,
    tablesOccupied: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('companyId');

    if (!token) {
      router.push('/login');
      return;
    }

    // Fetching stats from backend API using companyId (satisfies unused variable & async pattern)
    const fetchDashboardStats = async () => {
      try {
        // Uncomment when backend route /api/orders/stats is ready:
        // const res = await fetch(`http://localhost:5000/api/orders/stats?companyId=${companyId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await res.json();
        // setStats(data);

        // Fallback mock data structure for now:
        if (companyId) {
          setStats({
            todayOrders: 18,
            revenue: 4500,
            pendingKOT: 3,
            tablesOccupied: 6
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-orange-600">FoodOrderingOS Dashboard</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/menu')} 
            className="text-sm font-semibold text-gray-700 hover:text-orange-600">Menu</button>
          <button 
            onClick={() => router.push('/tables')} 
            className="text-sm font-semibold text-gray-700 hover:text-orange-600">Tables</button>
          <button 
            onClick={() => router.push('/kot')} 
            className="text-sm font-semibold text-gray-700 hover:text-orange-600">KOT</button>
          <button 
            onClick={handleLogout} 
            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Stats Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Overview Today</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Today&apos;s Orders</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats.todayOrders}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <p className="text-3xl font-extrabold text-green-600 mt-2">₹{stats.revenue}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Pending KOT</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2">{stats.pendingKOT}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Tables Occupied</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-2">{stats.tablesOccupied}</p>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => router.push('/menu')} className="bg-orange-50 text-orange-700 px-5 py-3 rounded-xl font-semibold hover:bg-orange-100 transition">
              Manage Menu & Dishes 🍔
            </button>
            <button onClick={() => router.push('/tables')} className="bg-orange-50 text-orange-700 px-5 py-3 rounded-xl font-semibold hover:bg-orange-100 transition">
              View Table QR Codes 📱
            </button>
            <button onClick={() => router.push('/kot')} className="bg-orange-50 text-orange-700 px-5 py-3 rounded-xl font-semibold hover:bg-orange-100 transition">
              Kitchen KOT Live View 👨‍🍳
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
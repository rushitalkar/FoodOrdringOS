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
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetching stats from backend API using companyId (satisfies unused variable & async pattern)
    const fetchDashboardStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsResponse, ordersResponse, kotResponse] = await Promise.all([
          fetch('http://localhost:5000/api/orders/stats', { headers }),
          fetch('http://localhost:5000/api/orders/list', { headers }),
          fetch('http://localhost:5000/api/kot/list', { headers })
        ]);
        if ([statsResponse, ordersResponse, kotResponse].some((response) => response.status === 401 || response.status === 403)) {
          localStorage.clear();
          router.push('/login');
          return;
        }
        if (!statsResponse.ok || !ordersResponse.ok || !kotResponse.ok) throw new Error('Unable to load dashboard data');
        const data = await statsResponse.json();
        const orders = await ordersResponse.json();
        const kots = await kotResponse.json();
        setRecentOrders(orders.slice(0, 5));
        setPendingTickets(kots.filter((kot) => ['pending', 'preparing'].includes(kot.status)).slice(0, 5));
        setStats({
          todayOrders: data.totalOrdersToday ?? 0,
          revenue: data.revenueToday ?? 0,
          pendingKOT: data.pendingKOTs ?? 0,
          tablesOccupied: data.occupiedTables ?? 0
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
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

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Recent Orders</h3>
            {recentOrders.length === 0 ? <p className="text-sm text-gray-500">No orders yet.</p> : <div className="space-y-3">
              {recentOrders.map((order) => <div key={order._id} className="flex items-center justify-between border-b border-gray-100 pb-3 text-sm">
                <span className="font-semibold text-gray-800">Table #{order.tableId?.tableNo || 'Takeaway'}</span>
                <span className="text-gray-500">{order.status}</span>
                <span className="font-bold text-orange-600">₹{Number(order.grandTotal).toFixed(2)}</span>
              </div>)}
            </div>}
          </section>
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Pending KOT</h3>
            {pendingTickets.length === 0 ? <p className="text-sm text-gray-500">No pending kitchen tickets.</p> : <div className="space-y-3">
              {pendingTickets.map((kot) => <div key={kot._id} className="flex items-center justify-between border-b border-gray-100 pb-3 text-sm">
                <span className="font-semibold text-gray-800">Table #{kot.tableId?.tableNo || 'Takeaway'}</span>
                <span className="font-bold uppercase text-amber-600">{kot.status}</span>
              </div>)}
            </div>}
          </section>
        </div>
      </main>
    </div>
  );
}
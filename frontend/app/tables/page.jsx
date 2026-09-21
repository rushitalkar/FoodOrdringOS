'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TablesPage() {
  const [tables, setTables] = useState([
    {
      _id: 't1',
      tableNo: 1,
      status: 'vacant',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=https://yourdomain.com/qr/mysubdomain/1&size=150x150'
    },
    {
      _id: 't2',
      tableNo: 2,
      status: 'occupied',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=https://yourdomain.com/qr/mysubdomain/2&size=150x150'
    },
    {
      _id: 't3',
      tableNo: 3,
      status: 'billed',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=https://yourdomain.com/qr/mysubdomain/3&size=150x150'
    }
  ]);
  const [newTableNo, setNewTableNo] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      router.push('/login');
      return;
    }

  }, [router]);

  const handleAddTable = async (e) => {
    e.preventDefault();
    const tableNum = Number(newTableNo);
    const generatedQr = `https://api.qrserver.com/v1/create-qr-code/?data=https://yourdomain.com/qr/mysubdomain/${tableNum}&size=150x150`;

    // Add locally for instant UI preview
    setTables([...tables, { _id: Date.now().toString(), tableNo: tableNum, status: 'vacant', qrCodeUrl: generatedQr }]);
    setNewTableNo('');
    alert(`Table #${tableNum} created with QR Code successfully!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-orange-600">Table Grid & QR Generator</h1>
            <p className="text-sm text-gray-600 mt-1">Generate and view scannable table QR codes for customer ordering.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold transition">
            Back to Dashboard
          </button>
        </div>

        {/* Add Table Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Table & Generate QR</h2>
          <form onSubmit={handleAddTable} className="flex gap-4">
            <input 
              type="number" placeholder="Table Number (e.g. 4)" required value={newTableNo} onChange={e => setNewTableNo(e.target.value)}
              className="flex-1 bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md">
              Generate QR 📱
            </button>
          </form>
        </div>

        {/* Tables Grid */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Tables Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map(table => {
            const statusColor = 
              table.status === 'vacant' ? 'bg-green-50 border-green-200 text-green-800' :
              table.status === 'occupied' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800';

            const badgeColor = 
              table.status === 'vacant' ? 'bg-green-600 text-white' :
              table.status === 'occupied' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white';

            return (
              <div key={table._id} className={`p-6 rounded-2xl shadow-sm border ${statusColor} flex flex-col justify-between bg-white`}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-2xl font-black text-gray-900">Table #{table.tableNo}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${badgeColor}`}>
                      {table.status}
                    </span>
                  </div>
                  
                  {/* QR Code Image Preview */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center my-4">
                    <img src={table.qrCodeUrl} alt={`QR Code for Table ${table.tableNo}`} className="w-32 h-32 object-contain" />
                    <span className="text-[10px] text-gray-500 mt-2 font-medium">Scan to open customer menu</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => alert(`Viewing active orders for Table #${table.tableNo}`)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition shadow-sm">
                    View Orders
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
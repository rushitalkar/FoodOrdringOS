'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      router.push('/login');
      return;
    }

    fetch('http://localhost:5000/api/orders/list', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (response) => {
      if (!response.ok) throw new Error('Unable to load orders');
      setOrders(await response.json());
    }).catch((err) => alert(err.message));
  }, [router]);

  const downloadBillPdf = (order) => {
    const pdf = new jsPDF();
    const subtotal = Number(order.total ?? 0);
    const gst = Number(order.gstTotal ?? 0);
    const grandTotal = Number(order.grandTotal ?? subtotal + gst);
    const tableNumber = order.tableId?.tableNo || 'Takeaway';
    const date = new Date(order.createdAt).toLocaleString();

    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FoodOrderingOS', 20, 22);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Restaurant bill', 20, 29);
    pdf.text(`Invoice: ${order._id}`, 140, 22);
    pdf.text(`Date: ${date}`, 140, 29);

    pdf.setDrawColor(220, 220, 220);
    pdf.line(20, 36, 190, 36);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Table: ${tableNumber}`, 20, 48);
    pdf.text(`Customer: ${order.customerName || 'Guest'}`, 20, 56);
    pdf.setFont('helvetica', 'normal');

    let y = 72;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Item', 20, y);
    pdf.text('Qty', 125, y);
    pdf.text('Amount', 155, y);
    pdf.line(20, y + 4, 190, y + 4);
    pdf.setFont('helvetica', 'normal');
    y += 14;

    order.items.forEach((item) => {
      pdf.text(String(item.title).slice(0, 45), 20, y);
      pdf.text(String(item.qty), 125, y);
      pdf.text(`Rs. ${(item.price * item.qty).toFixed(2)}`, 155, y);
      y += 9;
    });

    y += 6;
    pdf.line(115, y, 190, y);
    y += 10;
    pdf.text('Subtotal', 125, y);
    pdf.text(`Rs. ${subtotal.toFixed(2)}`, 155, y);
    y += 9;
    pdf.text('GST', 125, y);
    pdf.text(`Rs. ${gst.toFixed(2)}`, 155, y);
    y += 11;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Grand Total', 125, y);
    pdf.text(`Rs. ${grandTotal.toFixed(2)}`, 155, y);
    y += 18;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Payment status: PAID', 20, y);
    pdf.text('Thank you for dining with us.', 20, y + 9);
    pdf.save(`bill-${order._id}.pdf`);
  };

  const handleGenerateBill = async (orderId) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/orders/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, status: 'billed' })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Unable to settle order');
      return;
    }
    setOrders((current) => current.map((order) => order._id === orderId ? data.order : order));
    downloadBillPdf(data.order);
  };

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/orders/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, status })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Unable to update order');
      return;
    }
    setOrders((current) => current.map((order) => order._id === orderId ? data.order : order));
  };

  const sendWhatsApp = async (orderId, type) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, type })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Unable to send WhatsApp notification');
      return;
    }
    alert(`Notification (${type}) prepared in the saved language:\n\n${data.content}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-orange-600">Orders & Billing</h1>
            <p className="text-sm text-gray-600 mt-1">Manage active table bills, calculate totals, and process payments.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold transition">
            Back to Dashboard
          </button>
        </div>

        {/* Orders List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => {
            const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
            const gst = Number(order.gstTotal ?? 0);
            const total = Number(order.grandTotal ?? subtotal + gst);

            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                      <h3 className="text-2xl font-black text-gray-900">Table #{order.tableId?.tableNo || 'Takeaway'}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-extrabold uppercase ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                        {order.paymentStatus === 'paid' ? 'Paid / Billed' : 'Unpaid Bill'}
                    </span>
                  </div>

                  {/* Order Items Breakdown */}
                  <div className="space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bill Items</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl text-sm">
                        <span className="font-semibold text-gray-900">{item.title} (x{item.qty})</span>
                        <span className="font-bold text-gray-700">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5 mb-6 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST (5%)</span>
                      <span>₹{gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-200">
                      <span>Total Amount</span>
                      <span className="text-orange-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Billing Action */}
                <div>
                  {order.paymentStatus !== 'paid' ? (
                    <div className="space-y-2">
                      {order.status === 'new' && <button type="button" onClick={() => updateOrderStatus(order._id, 'preparing')} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700">Mark Preparing</button>}
                      {order.status === 'preparing' && <button type="button" onClick={() => updateOrderStatus(order._id, 'ready')} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">Mark Ready</button>}
                      {order.status === 'ready' && <button type="button" onClick={() => updateOrderStatus(order._id, 'delivered')} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white hover:bg-gray-800">Mark Delivered</button>}
                      {(order.status === 'delivered' || order.status === 'ready') && <button type="button" onClick={() => handleGenerateBill(order._id)} className="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold text-white hover:bg-orange-700">Collect Payment & Download Bill</button>}
                      <button type="button" onClick={() => sendWhatsApp(order._id, 'order-confirmed')} className="w-full rounded-xl border border-green-200 bg-green-50 py-3 text-xs font-bold text-green-700 hover:bg-green-100">Send Order Notification</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button type="button" onClick={() => downloadBillPdf(order)} className="w-full rounded-xl border border-green-200 bg-green-50 py-3 text-xs font-bold text-green-700 hover:bg-green-100">Download Bill PDF</button>
                      <button type="button" onClick={() => sendWhatsApp(order._id, 'bill')} className="w-full rounded-xl border border-green-200 bg-white py-3 text-xs font-bold text-green-700 hover:bg-green-50">Send Bill Notification</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect, use } from 'react';

export default function PublicQRMenu({ params }) {
  const resolvedParams = use(params);
  const { subdomain, tableNo } = resolvedParams;

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [restaurantName, setRestaurantName] = useState(subdomain.replace('-', ' ').toUpperCase());
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/dishes/public?subdomain=${encodeURIComponent(subdomain)}`);
        if (!res.ok) throw new Error('Restaurant menu unavailable');
        const data = await res.json();
        setRestaurantName(data.company.name);
        setDishes(data.dishes.map((dish) => ({
          ...dish,
          category: dish.categoryId?.name || 'Menu'
        })));
      } catch (err) {
        setMenuError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantInfo();
  }, [subdomain]);

  const addToCart = (dish) => {
    const existing = cart.find(item => item._id === dish._id);
    if (existing) {
      setCart(cart.map(item => item._id === dish._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...dish, qty: 1 }]);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const calculateGst = () => cart.reduce((total, item) => total + ((item.price * item.qty * (item.gstPercent || 5)) / 100), 0);

  const updateQuantity = (dishId, change) => {
    setCart((current) => current
      .map((item) => item._id === dishId ? { ...item, qty: item.qty + change } : item)
      .filter((item) => item.qty > 0));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companySubdomain: subdomain,
          tableNo: Number(tableNo),
          customerName,
          phone: customerPhone,
          items: cart.map(item => ({ dishId: item._id, qty: item.qty }))
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unable to place order');
      }
      setOrderPlaced(true);
    } catch (err) {
      alert(err.message);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 text-sm mb-6">Your order for <span className="font-bold text-orange-600">Table #{tableNo}</span> has been sent to the kitchen.</p>
          <button 
            onClick={() => { setOrderPlaced(false); setCart([]); }} 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition">
            Order More Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      {/* Top Banner */}
      <div className="bg-orange-600 text-white p-6 text-center shadow-md">
        <h1 className="text-2xl font-black tracking-tight uppercase">{restaurantName}</h1>
        <p className="text-orange-100 text-sm mt-1 font-semibold">Ordering for Table #{tableNo} 🍽️</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Explore Menu</h2>
          {!loading && !menuError && dishes.length > 0 && <div className="flex flex-wrap gap-2">
            {['All', ...new Set(dishes.map((dish) => dish.category))].map((category) => (
              <button type="button" key={category} onClick={() => setSelectedCategory(category)} className={`rounded-full px-4 py-2 text-xs font-bold ${selectedCategory === category ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>
                {category}
              </button>
            ))}
          </div>}
          {loading && <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading menu...</p>}
          {!loading && menuError && <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{menuError}</p>}
          {!loading && !menuError && dishes.length === 0 && <p className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">This restaurant has not published any dishes yet.</p>}
          {!loading && dishes.filter((dish) => selectedCategory === 'All' || dish.category === selectedCategory).map(dish => (
            <div key={dish._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                {dish.imageUrl && <img src={`http://localhost:5000${dish.imageUrl}`} alt={dish.title} className="mb-3 h-20 w-20 rounded-lg object-cover" />}
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${dish.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {dish.isVeg ? 'VEG 🌱' : 'NON-VEG 🍗'}
                </span>
                <h3 className="font-bold text-lg text-gray-900 mt-1">{dish.title}</h3>
                <p className="text-sm font-extrabold text-orange-600 mt-0.5">₹{dish.price}</p>
              </div>
              <button 
                onClick={() => addToCart(dish)}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-xl text-sm transition border border-orange-200">
                + Add
              </button>
            </div>
          ))}
        </div>

        {/* Cart & Checkout Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Cart ({cart.length})</h2>
          
          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Cart is empty. Add dishes from menu!</p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">₹{item.price} x {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateQuantity(item._id, -1)} className="rounded bg-gray-100 px-2 py-1 font-bold text-gray-700">-</button>
                      <span className="min-w-5 text-center font-bold text-gray-800">{item.qty}</span>
                      <button type="button" onClick={() => updateQuantity(item._id, 1)} className="rounded bg-gray-100 px-2 py-1 font-bold text-gray-700">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t flex justify-between font-black text-base text-gray-900">
                <span>Subtotal:</span>
                <span className="text-orange-600">₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600"><span>GST:</span><span>₹{calculateGst().toFixed(2)}</span></div>
              <div className="flex justify-between font-black text-gray-900"><span>Grand total:</span><span className="text-orange-600">₹{(calculateTotal() + calculateGst()).toFixed(2)}</span></div>

              <form onSubmit={handlePlaceOrder} className="space-y-3 pt-2">
                <input 
                  type="text" placeholder="Your Name" required value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <input 
                  type="tel" placeholder="Phone Number" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition shadow-md text-sm">
                  Place Order Now 🚀
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
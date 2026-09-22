'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [price, setPrice] = useState('');
  const [gstPercent, setGstPercent] = useState('5');
  const [isVeg, setIsVeg] = useState(true);
  const [prepTime, setPrepTime] = useState('15');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    const loadMenu = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [categoryResponse, dishResponse] = await Promise.all([
          fetch('http://localhost:5000/api/categories/list', { headers }),
          fetch('http://localhost:5000/api/dishes/list', { headers })
        ]);
        if (!categoryResponse.ok || !dishResponse.ok) throw new Error('Unable to load menu');
        setCategories(await categoryResponse.json());
        setDishes(await dishResponse.json());
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [router]);

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('companyId');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('categoryId', categoryId);
    formData.append('price', price);
    formData.append('gstPercent', gstPercent);
    formData.append('isVeg', isVeg);
    formData.append('prepTime', prepTime);
    if (imageFile) formData.append('image', imageFile);
    if (companyId) formData.append('companyId', companyId);

    try {
      const res = await fetch('http://localhost:5000/api/dishes/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert('Dish created successfully!');
        // Optimistically add to local state so user sees it instantly
        setDishes([...dishes, { _id: Date.now().toString(), title, price: Number(price), isVeg, prepTime }]);
        setTitle('');
        setPrice('');
        setImageFile(null);
      } else {
        alert(data.error || data.message || 'Failed to create dish');
      }
    } catch (err) {
      console.error('Backend connection error:', err);
      alert('Backend server is not running or unreachable at http://localhost:5000');
    }
  };

  const handleCategorySubmit = async () => {
    const name = newCategory.trim();
    if (!name) return;

    setCategorySaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/categories/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create category');

      setCategories((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryId(data._id);
      setNewCategory('');
    } catch (err) {
      alert(err.message);
    } finally {
      setCategorySaving(false);
    }
  };

  const toggleAvailability = async (dish) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/dishes/${dish._id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isAvailable: !dish.isAvailable })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Unable to update availability');
      return;
    }
    setDishes((current) => current.map((item) => item._id === data._id ? data : item));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-700 bg-gray-50">Loading Menu Management...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-orange-600">Menu & Dish Management</h1>
            <p className="text-sm text-gray-600 mt-1">Add and manage restaurant dishes with high visibility UI.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold transition">
            Back to Dashboard
          </button>
        </div>

        {/* Add Dish Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Dish</h2>
          <form onSubmit={handleDishSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dish Title</label>
              <input 
                type="text" placeholder="e.g. Masala Dosa" required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="dish-category" className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                id="dish-category"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                disabled={categories.length === 0}
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500">
                <option value="">{categories.length ? 'Select Category' : 'Create a category first'}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button type="button" onClick={handleCategorySubmit} disabled={categorySaving || !newCategory.trim()} className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {categorySaving ? 'Saving...' : 'Add'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
              <input 
                type="number" placeholder="250" required value={price} onChange={e => setPrice(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">GST %</label>
              <input 
                type="number" value={gstPercent} onChange={e => setGstPercent(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time (mins)</label>
              <input 
                type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dish Image</label>
              <input 
                type="file" onChange={e => setImageFile(e.target.files[0])}
                className="w-full bg-white border border-gray-300 text-gray-700 p-2 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-3 bg-orange-50 p-4 rounded-xl border border-orange-100">
              <input type="checkbox" id="isVeg" checked={isVeg} onChange={e => setIsVeg(e.target.checked)} className="w-5 h-5 text-orange-600 rounded" />
              <label htmlFor="isVeg" className="text-sm font-bold text-gray-800">Mark as Vegetarian Dish</label>
            </div>

            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl md:col-span-3 transition shadow-md">
              Save & Upload Dish 🚀
            </button>
          </form>
        </div>

        {/* Existing Dishes Grid */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Existing Dishes Catalog ({dishes.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dishes.map(dish => (
            <div key={dish._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                {dish.imageUrl && <img src={`http://localhost:5000${dish.imageUrl}`} alt={dish.title} className="mb-4 h-40 w-full rounded-xl object-cover" />}
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-extrabold ${dish.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {dish.isVeg ? 'VEG 🌱' : 'NON-VEG 🍗'}
                  </span>
                  <span className="text-lg font-extrabold text-orange-600">₹{dish.price}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">{dish.title}</h3>
                <p className="text-sm text-gray-600 mt-1">Prep Time: <span className="font-semibold">{dish.prepTime} mins</span></p>
                <p className="text-sm text-gray-600 mt-1">Category: <span className="font-semibold">{dish.categoryId?.name || 'Uncategorized'}</span></p>
              </div>
              <button type="button" onClick={() => toggleAvailability(dish)} className={`mt-5 w-full rounded-xl py-2.5 text-sm font-bold transition ${dish.isAvailable ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {dish.isAvailable ? 'Available to customers' : 'Hidden from customers'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
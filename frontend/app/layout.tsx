'use client';
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Check if current page is Login or Public QR Menu
  const isPublicOrLogin = pathname.startsWith('/login') || pathname.startsWith('/qr');

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        
        {/* Sticky Admin Navbar - Yeh sirf Dashboard/Admin pages par dikhega, Login ya QR par nahi */}
        {!isPublicOrLogin && (
          <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
              <div className="bg-orange-600 text-white font-black p-2.5 rounded-xl text-lg shadow-md">🍽️</div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">FoodOrderingOS</h1>
                <p className="text-xs text-gray-500 font-medium">Restaurant Management & POS System</p>
              </div>
            </div>
            
            {/* Quick Navigation Links & Logout */}
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4 text-sm font-bold text-gray-600">
                <button onClick={() => router.push('/dashboard')} className="hover:text-orange-600 transition">Dashboard</button>
                <button onClick={() => router.push('/menu')} className="hover:text-orange-600 transition">Menu</button>
                <button onClick={() => router.push('/tables')} className="hover:text-orange-600 transition">Tables</button>
                <button onClick={() => router.push('/kot')} className="hover:text-orange-600 transition">KOT</button>
                <button onClick={() => router.push('/orders')} className="hover:text-orange-600 transition">Orders</button>
                <button onClick={() => router.push('/settings')} className="hover:text-orange-600 transition">Settings</button>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-sm transition border border-red-200">
                Logout 🔒
              </button>
            </div>
          </nav>
        )}

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
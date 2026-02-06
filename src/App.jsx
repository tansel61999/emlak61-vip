import React, { useState } from 'react';
import IlanYonetimi from './sayfalar/IlanYonetimi'; // Dosya yolunu kontrol et
import Duyurular from './sayfalar/Duyurular';       // Dosya yolunu kontrol et
import { LayoutGrid, Bell, LogOut, User } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

const AnaPanel = () => {
  const [aktifSekme, setAktifSekme] = useState("ILANLAR"); // ILANLAR veya DUYURULAR
  const auth = getAuth();

  const cikisYap = () => {
    if (window.confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      signOut(auth);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ANA NAVİGASYON BAR */}
      <nav className="sticky top-0 z-[100] bg-[#0A192F] text-white px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Logo ve Kullanıcı */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-[#FFD700]">EMLAK61</h1>
              <span className="text-[10px] font-bold text-blue-300/50 uppercase tracking-widest">Yönetim Paneli</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-[#0A192F] text-[10px] font-black uppercase">
                {auth.currentUser?.displayName?.charAt(0) || "U"}
              </div>
              <span className="text-[11px] font-black uppercase truncate max-w-[100px]">
                {auth.currentUser?.displayName || "Kullanıcı"}
              </span>
            </div>
          </div>

          {/* Menü Butonları */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-auto">
            <button
              onClick={() => setAktifSekme("ILANLAR")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-xs transition-all ${aktifSekme === "ILANLAR" ? "bg-[#FFD700] text-[#0A192F] shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <LayoutGrid size={18} /> İLAN YÖNETİMİ
            </button>
            <button
              onClick={() => setAktifSekme("DUYURULAR")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-xs transition-all ${aktifSekme === "DUYURULAR" ? "bg-[#FFD700] text-[#0A192F] shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <Bell size={18} /> DUYURULAR
            </button>
          </div>

          {/* Çıkış */}
          <button
            onClick={cikisYap}
            className="p-3 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* SAYFA İÇERİĞİ */}
      <main className="animate-in fade-in duration-500">
        {aktifSekme === "ILANLAR" ? <IlanYonetimi /> : <Duyurular />}
      </main>

      {/* ALT BİLGİ */}
      <footer className="py-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        &copy; 2026 EMLAK61 KUŞADASI GAYRİMENKUL - TÜM HAKLARI SAKLIDIR
      </footer>
    </div>
  );
};

export default AnaPanel;
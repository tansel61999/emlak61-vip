import React from 'react';
import { Home, PlusSquare, Users, Archive, LogOut } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

const Navigasyon = ({ setAktifSayfa, aktifSayfa }) => {
  const auth = getAuth();

  const guvenliCikis = async () => {
    try {
      await signOut(auth);
      // Çıkıştan sonra her şeyi sıfırlamak için sayfayı yenile
      window.location.reload();
    } catch (e) {
      console.error("Çıkış hatası:", e);
    }
  };

  const menuElemani = (id, baslik, Icon) => (
    <button
      onClick={() => setAktifSayfa(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        aktifSayfa === id ? 'bg-[#FFD700] text-[#0A192F] shadow-md' : 'text-white hover:bg-white/10'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold text-xs uppercase">{baslik}</span>
    </button>
  );

  return (
    <nav className="bg-[#0A192F] p-4 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-[#FFD700] font-black text-2xl tracking-tighter cursor-pointer" onClick={() => setAktifSayfa('ANASAYFA')}>
          EMLAK61 <span className="text-white">VIP</span>
        </div>

        <div className="flex gap-2 items-center">
          {menuElemani('ANASAYFA', 'Ana Sayfa', Home)}
          {menuElemani('ILANLAR', 'İlanlar', PlusSquare)}
          {menuElemani('MUSTERILER', 'CRM', Users)}
          {menuElemani('ARSIV', 'Arşiv', Archive)}
          
          <div className="w-px h-6 bg-white/20 mx-2" /> {/* Ayırıcı çizgi */}
          
          <button 
            onClick={guvenliCikis}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all font-black text-xs uppercase"
          >
            <LogOut size={20} />
            ÇIKIŞ
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigasyon;

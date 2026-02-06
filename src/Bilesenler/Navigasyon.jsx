import React from 'react';
import { Home, PlusSquare, Users, Archive } from 'lucide-react';

const Navigasyon = ({ setAktifSayfa, aktifSayfa }) => {
  const menuElemani = (id, baslik, Icon) => (
    <button
      onClick={() => setAktifSayfa(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        aktifSayfa === id ? 'bg-[#FFD700] text-[#0A192F] shadow-md' : 'text-white hover:bg-white/10'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold">{baslik}</span>
    </button>
  );

  return (
    <nav className="bg-[#0A192F] p-4 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-[#FFD700] font-black text-2xl tracking-tighter">
          EMLAK61 <span className="text-white">VIP</span>
        </div>

        <div className="flex gap-2">
          {menuElemani('ANASAYFA', 'Ana Sayfa', Home)}
          {menuElemani('ILANLAR', 'İlanlar', PlusSquare)}
          {menuElemani('MUSTERILER', 'CRM / Müşteriler', Users)}
          {menuElemani('ARSIV', 'Arşiv', Archive)}
        </div>
      </div>
    </nav>
  );
};

export default Navigasyon;
import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import IlanYonetimi from '../sayfalar/IlanYonetimi';
import MusteriYonetimi from '../sayfalar/MusteriYonetimi';
import Arsiv from '../sayfalar/Arsiv';
import Duyurular from '../sayfalar/Duyurular';

const Navigasyon = () => {
  const [aktifSayfa, setAktifSayfa] = useState('ana');
  const auth = getAuth();

  const cikisYap = () => signOut(auth);

  // Sayfa İçeriğini Belirle
  const SayfaIcerigi = () => {
    switch (aktifSayfa) {
      case 'ilanlar': return <IlanYonetimi />;
      case 'crm': return <MusteriYonetimi />;
      case 'arsiv': return <Arsiv />;
      default: return <Duyurular />; // Ana sayfa varsayılan olarak Duyurular olsun
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Üst Bar */}
      <nav className="bg-[#0A192F] text-white p-4 flex justify-between items-center shadow-lg">
        <div className="text-[#FFD700] font-black text-xl tracking-tighter">
          EMLAK61 <span className="text-white">VIP</span>
        </div>
        
        <div className="flex gap-6 items-center">
          <button onClick={() => setAktifSayfa('ana')} className={`hover:text-[#FFD700] ${aktifSayfa === 'ana' ? 'text-[#FFD700]' : ''}`}>ANA SAYFA</button>
          <button onClick={() => setAktifSayfa('ilanlar')} className={`hover:text-[#FFD700] ${aktifSayfa === 'ilanlar' ? 'text-[#FFD700]' : ''}`}>İLANLAR</button>
          <button onClick={() => setAktifSayfa('crm')} className={`hover:text-[#FFD700] ${aktifSayfa === 'crm' ? 'text-[#FFD700]' : ''}`}>CRM</button>
          <button onClick={() => setAktifSayfa('arsiv')} className={`hover:text-[#FFD700] ${aktifSayfa === 'arsiv' ? 'text-[#FFD700]' : ''}`}>ARŞİV</button>
          <button onClick={cikisYap} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 ml-4">ÇIKIŞ</button>
        </div>
      </nav>

      {/* Sayfa İçeriği */}
      <main className="p-6">
        <SayfaIcerigi />
      </main>
    </div>
  );
};

export default Navigasyon;

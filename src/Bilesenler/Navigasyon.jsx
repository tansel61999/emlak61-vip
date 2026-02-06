import React, { useState } from 'react';
import Navigasyon from './Bilesenler/navigasyon';
import IlanYonetimi from './sayfalar/IlanYonetimi';
import { getAuth, signOut } from 'firebase/auth';

const AnaPanel = () => {
  const [aktifSayfa, setAktifSayfa] = useState('ANASAYFA');
  const auth = getAuth();

  const sayfaIcerigi = () => {
    switch (aktifSayfa) {
      case 'ILANLAR':
        return <IlanYonetimi varsayilanGorunum="OFIS" />;
      case 'ARSIV':
        return <IlanYonetimi varsayilanGorunum="ARSIV" />; // Arşive tıklandığında direkt Arşiv görünümüyle açılır
      case 'MUSTERILER':
        return <div className="p-20 text-center font-black text-gray-400 uppercase tracking-widest bg-white rounded-[40px] m-6 border-2 border-dashed">Müşteri Yönetimi (CRM) Modülü Hazırlanıyor...</div>;
      case 'ANASAYFA':
      default:
        return (
          <div className="p-10 text-center space-y-4">
            <h2 className="text-3xl font-black text-[#0A192F] uppercase">EMLAK61 VIP OPERASYON MERKEZİ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-10">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border hover:scale-105 transition-all cursor-pointer" onClick={() => setAktifSayfa('ILANLAR')}>
                <h3 className="font-black text-blue-600 text-xs mb-2 tracking-widest">HIZLI ERİŞİM</h3>
                <p className="font-bold text-[#0A192F]">AKTİF İLANLAR</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] shadow-sm border hover:scale-105 transition-all cursor-pointer" onClick={() => setAktifSayfa('ARSIV')}>
                <h3 className="font-black text-green-600 text-xs mb-2 tracking-widest">BAŞARI TABLOSU</h3>
                <p className="font-bold text-[#0A192F]">SATILAN / ARŞİV</p>
              </div>
              <div className="bg-white p-8 rounded-[40px] shadow-sm border hover:scale-105 transition-all cursor-pointer" onClick={() => setAktifSayfa('MUSTERILER')}>
                <h3 className="font-black text-amber-600 text-xs mb-2 tracking-widest">YAKINDA</h3>
                <p className="font-bold text-[#0A192F]">MÜŞTERİ KAYITLARI</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#E6EAEF]">
      <Navigasyon setAktifSayfa={setAktifSayfa} aktifSayfa={aktifSayfa} />
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {sayfaIcerigi()}
      </main>
      <footer className="py-10 text-center text-gray-400 text-[9px] font-black uppercase tracking-[0.3em]">
        &copy; 2026 EMLAK61 KUŞADASI GAYRİMENKUL - TEKNOLOJİ ÜSSÜ
      </footer>
    </div>
  );
};

export default AnaPanel;

import React, { useState } from 'react';
import Navigasyon from './Bilesenler/navigasyon';
import IlanYonetimi from './sayfalar/IlanYonetimi';
import Arsiv from './sayfalar/Arsiv'; // Yeni oluşturulacak
// Diğer sayfalar (CRM, Duyurular vs.) buraya eklenecek

const AnaPanel = () => {
  const [aktifSayfa, setAktifSayfa] = useState('ANASAYFA');

  const sayfaIcerigi = () => {
    switch (aktifSayfa) {
      case 'ILANLAR':
        return <IlanYonetimi />;
      case 'ARSIV':
        return <Arsiv />;
      case 'MUSTERILER':
        return <div className="p-10 text-center font-bold">CRM / Müşteriler Modülü Yakında...</div>;
      case 'ANASAYFA':
      default:
        return (
          <div className="p-10 text-center">
            <h2 className="text-2xl font-black text-[#0A192F]">Hoş Geldin, EMLAK61 VIP Paneli Hazır!</h2>
            <p className="text-gray-500 mt-2">Sol üstteki menüden işlemlere başlayabilirsin.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navigasyon setAktifSayfa={setAktifSayfa} aktifSayfa={aktifSayfa} />
      <main className="container mx-auto py-6">
        {sayfaIcerigi()}
      </main>
    </div>
  );
};

export default AnaPanel;

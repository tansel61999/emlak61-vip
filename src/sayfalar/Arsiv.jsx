import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { Archive, User, Home, Tag, Phone } from 'lucide-react';

const Arsiv = () => {
  const [arsivMusteriler, setArsivMusteriler] = useState([]);
  const [arsivIlanlar, setArsivIlanlar] = useState([]);
  const [sekme, setSekme] = useState('musteri');

  useEffect(() => {
    // 1. Müşteri Arşivi: 'Arşivlendi' veya 'arsivlendi' olan her şeyi getir
    const qMusteri = query(collection(veritabani, "musteriler"));
    const unsubscribeMusteri = onSnapshot(qMusteri, (snap) => {
      const veriler = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.durum === "Arşivlendi" || m.durum === "arsivlendi");
      setArsivMusteriler(veriler);
    });

    // 2. İlan Arşivi: Durumu Satıldı, Pasif, satildi, pasif olan her şeyi getir
    const qIlan = query(collection(veritabani, "ilanlar"));
    const unsubscribeIlan = onSnapshot(qIlan, (snap) => {
      const ilanVerileri = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(i => ["Satıldı", "Pasif", "satildi", "pasif", "Satildi"].includes(i.durum));
      setArsivIlanlar(ilanVerileri);
    });

    return () => { unsubscribeMusteri(); unsubscribeIlan(); };
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* Şık Üst Panel */}
      <div className="bg-[#0A192F] p-8 rounded-[2.5rem] shadow-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#FFD700] p-4 rounded-3xl text-[#0A192F] shadow-lg">
              <Archive size={32} strokeWidth={2.5}/>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">GENEL ARŞİV</h2>
              <p className="text-[#FFD700] text-[10px] font-black tracking-widest opacity-80 uppercase">Emlak61 VIP Yönetim Paneli</p>
            </div>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <button 
              onClick={() => setSekme('musteri')}
              className={`px-8 py-3 rounded-xl font-black text-xs transition-all duration-300 ${sekme === 'musteri' ? 'bg-[#FFD700] text-[#0A192F] shadow-lg scale-105' : 'text-gray-400 hover:text-white'}`}
            >
              MÜŞTERİLER ({arsivMusteriler.length})
            </button>
            <button 
              onClick={() => setSekme('ilan')}
              className={`px-8 py-3 rounded-xl font-black text-xs transition-all duration-300 ${sekme === 'ilan' ? 'bg-[#FFD700] text-[#0A192F] shadow-lg scale-105' : 'text-gray-400 hover:text-white'}`}
            >
              İLANLAR ({arsivIlanlar.length})
            </button>
          </div>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sekme === 'musteri' ? (
          arsivMusteriler.map(m => (
            <div key={m.id} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all border-t-4 border-t-blue-500">
              <div className="flex justify-between items-start mb-5">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><User size={24}/></div>
                <span className="text-[9px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-400 tracking-tighter uppercase">PASİF MÜŞTERİ</span>
              </div>
              <h3 className="text-2xl font-black text-[#0A192F] uppercase mb-1 tracking-tighter">{m.ad}</h3>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-6"><Phone size={14}/> 0{m.telefon}</div>
              <div className="bg-slate-50 p-5 rounded-3xl italic text-xs text-slate-500 leading-relaxed border border-slate-100">"{m.not}"</div>
            </div>
          ))
        ) : (
          arsivIlanlar.map(i => (
            <div key={i.id} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all border-t-4 border-t-orange-500">
              <div className="flex justify-between items-start mb-5">
                <div className="bg-orange-50 p-3 rounded-2xl text-orange-600"><Home size={24}/></div>
                <span className={`text-[9px] font-black px-4 py-1.5 rounded-full shadow-sm ${i.durum?.toLowerCase().includes('sat') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {i.durum?.toUpperCase()}
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#0A192F] uppercase mb-2 tracking-tighter leading-tight">{i.baslik}</h3>
              <div className="flex items-center gap-2 text-[#0A192F] font-black bg-amber-50 w-fit px-4 py-2 rounded-xl">
                 <Tag size={18} className="text-[#FFD700]"/> {i.fiyat} TL
              </div>
            </div>
          ))
        )}

        {/* Boş Durum Kontrolü */}
        {((sekme === 'musteri' && arsivMusteriler.length === 0) || (sekme === 'ilan' && arsivIlanlar.length === 0)) && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <Archive size={64} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-300 font-black text-xl uppercase tracking-widest">Henüz kayıt bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Arsiv;

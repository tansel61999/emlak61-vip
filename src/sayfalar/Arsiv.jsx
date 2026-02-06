import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Archive, User, Home, Tag, Clock } from 'lucide-react';

const Arsiv = () => {
  const [arsivMusteriler, setArsivMusteriler] = useState([]);
  const [arsivIlanlar, setArsivIlanlar] = useState([]);
  const [sekme, setSekme] = useState('musteri'); // 'musteri' veya 'ilan'

  useEffect(() => {
    // 1. Arşivlenmiş Müşterileri Getir
    const qMusteri = query(collection(veritabani, "musteriler"), where("durum", "==", "Arşivlendi"));
    const unsubscribeMusteri = onSnapshot(qMusteri, (snap) => {
      setArsivMusteriler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 2. Satılmış veya Pasif İlanları Getir
    const qIlan = query(collection(veritabani, "ilanlar"), where("durum", "in", ["Satıldı", "Pasif", "satıldı", "pasif"]));
    const unsubscribeIlan = onSnapshot(qIlan, (snap) => {
      setArsivIlanlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubscribeMusteri(); unsubscribeIlan(); };
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Başlık Kartı */}
      <div className="bg-[#0A192F] p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-[#FFD700] p-4 rounded-2xl text-[#0A192F]"><Archive size={32}/></div>
          <div>
            <h2 className="text-3xl font-black uppercase">Genel Arşiv</h2>
            <p className="text-amber-200 text-sm font-bold opacity-70">SİSTEMDEKİ TÜM PASİF KAYITLAR</p>
          </div>
        </div>

        {/* Sekme Değiştirici */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl mt-4 md:mt-0">
          <button 
            onClick={() => setSekme('musteri')}
            className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${sekme === 'musteri' ? 'bg-[#FFD700] text-[#0A192F]' : 'text-white'}`}
          >
            MÜŞTERİLER ({arsivMusteriler.length})
          </button>
          <button 
            onClick={() => setSekme('ilan')}
            className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${sekme === 'ilan' ? 'bg-[#FFD700] text-[#0A192F]' : 'text-white'}`}
          >
            İLANLAR ({arsivIlanlar.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sekme === 'musteri' ? (
          arsivMusteriler.length > 0 ? (
            arsivMusteriler.map(m => (
              <div key={m.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><User size={20}/></div>
                    <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-400">ARŞİVLENDİ</span>
                  </div>
                  <h3 className="text-xl font-black text-[#0A192F] uppercase">{m.ad}</h3>
                  <p className="text-gray-500 font-bold text-sm mb-4">{m.telefon}</p>
                  <div className="bg-gray-50 p-4 rounded-2xl italic text-xs text-gray-500">"{m.not}"</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border-2 border-dashed font-bold text-gray-300">ARŞİVLENMİŞ MÜŞTERİ YOK</div>
          )
        ) : (
          arsivIlanlar.length > 0 ? (
            arsivIlanlar.map(ilan => (
              <div key={ilan.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Home size={20}/></div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${ilan.durum === 'Satıldı' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {ilan.durum?.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#0A192F] uppercase mb-2">{ilan.baslik}</h3>
                <div className="flex items-center gap-2 text-[#FFD700] font-black">
                   <Tag size={16}/> {ilan.fiyat} TL
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border-2 border-dashed font-bold text-gray-300">SATILAN VEYA PASİF İLAN YOK</div>
          )
        )}
      </div>
    </div>
  );
};

export default Arsiv;

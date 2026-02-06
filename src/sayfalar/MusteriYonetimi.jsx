import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Search, Phone, MessageSquare, Trash2, UserCheck, Repeat, ArrowUpDown, Tag } from 'lucide-react';

const MusteriYonetimi = () => {
  const [musteriler, setMusteriler] = useState([]);
  const [ilanlar, setIlanlar] = useState([]); // Eşleşme için ilanları çekiyoruz
  const [aramaMetni, setAramaMetni] = useState("");
  const [formAcik, setFormAcik] = useState(false);
  const [yeniMusteri, setYeniMusteri] = useState({ 
    ad: "", 
    telefon: "", 
    not: "", 
    durum: "Beklemede",
    tip: "Alıcı", // Alıcı veya Satıcı
    butce: "",
    bolge: ""
  });

  useEffect(() => {
    // Müşterileri Dinle
    const qMusteri = query(collection(veritabani, "musteriler"));
    const unsubscribeMusteri = onSnapshot(qMusteri, (snap) => {
      setMusteriler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // İlanları Dinle (Eşleşme için)
    const qIlan = query(collection(veritabani, "ilanlar"));
    const unsubscribeIlan = onSnapshot(qIlan, (snap) => {
      setIlanlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubscribeMusteri();
      unsubscribeIlan();
    };
  }, []);

  const musteriKaydet = async (e) => {
    e.preventDefault();
    await addDoc(collection(veritabani, "musteriler"), {
      ...yeniMusteri,
      tarih: serverTimestamp()
    });
    setFormAcik(false);
    setYeniMusteri({ ad: "", telefon: "", not: "", durum: "Beklemede", tip: "Alıcı", butce: "", bolge: "" });
  };

  const durumGuncelle = async (id, yeniDurum) => {
    await updateDoc(doc(veritabani, "musteriler", id), { durum: yeniDurum });
  };

  const musteriSil = async (id) => {
    if (window.confirm("Müşteri kaydını silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(veritabani, "musteriler", id));
    }
  };

  const whatsappMesaj = (tel) => {
    const temizTel = tel.replace(/\s/g, '');
    window.open(`https://wa.me/90${temizTel}`, '_blank');
  };

  // OTOMATİK EŞLEŞME MANTIĞI
  const eslesenIlanlariBul = (musteri) => {
    if (musteri.tip !== "Alıcı") return [];
    return ilanlar.filter(ilan => {
      const bolgeUyuyor = ilan.konum?.toLowerCase().includes(musteri.bolge?.toLowerCase());
      const fiyatUyuyor = Number(ilan.fiyat) <= Number(musteri.butce) * 1.1; // %10 esneklik
      return bolgeUyuyor && fiyatUyuyor;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm gap-4">
        <h2 className="text-2xl font-black text-[#0A192F]">MÜŞTERİ PORTFÖYÜ</h2>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Müşteri, bölge veya bütçe ara..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"
            onChange={(e) => setAramaMetni(e.target.value.toLowerCase())}
          />
        </div>

        <button
          onClick={() => setFormAcik(true)}
          className="bg-[#0A192F] text-[#FFD700] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
        >
          <UserPlus size={20} /> Yeni Talep / Müşteri
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musteriler.filter(m => 
          m.ad?.toLowerCase().includes(aramaMetni) || 
          m.bolge?.toLowerCase().includes(aramaMetni) ||
          m.not?.toLowerCase().includes(aramaMetni)
        ).map((m) => {
          const eslesmeler = eslesenIlanlariBul(m);
          return (
            <div key={m.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
              {/* Tip Etiketi */}
              <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase ${m.tip === 'Alıcı' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                {m.tip}
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 p-3 rounded-2xl text-[#0A192F]">
                  <UserCheck size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.durum === 'Tamamlandı' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {m.durum}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-1">{m.ad}</h3>
              <p className="text-gray-500 font-medium mb-2 flex items-center gap-2"><Phone size={14}/> {m.telefon}</p>
              
              <div className="flex gap-2 mb-4">
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg font-bold">📍 {m.bolge || 'Bölge Belirtilmedi'}</span>
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-lg font-bold">💰 {Number(m.butce).toLocaleString()} TL</span>
              </div>

              {/* OTOMATİK EŞLEŞME BİLGİSİ */}
              {m.tip === "Alıcı" && eslesmeler.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-xs mb-1">
                    <Repeat size={14} /> {eslesmeler.length} UYGUN İLAN BULUNDU
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-2xl mb-6 min-h-[60px]">
                <p className="text-sm text-gray-600 italic">"{m.not}"</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => whatsappMesaj(m.telefon)}
                  className="flex-1 bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-all flex justify-center"
                >
                  <MessageSquare size={20} />
                </button>
                <button
                  onClick={() => durumGuncelle(m.id, m.durum === 'Beklemede' ? 'Tamamlandı' : 'Beklemede')}
                  className="flex-1 bg-[#0A192F] text-[#FFD700] p-3 rounded-xl font-bold text-xs"
                >
                  {m.durum === 'Beklemede' ? 'ONAYLA' : 'GERİ AL'}
                </button>
                <button
                  onClick={() => musteriSil(m.id)}
                  className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-100 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Müşteri Ekleme Modal */}
      {formAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black mb-6 text-[#0A192F]">Yeni Müşteri Talebi</h3>
            <form onSubmit={musteriKaydet} className="space-y-4">
              
              <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                {['Alıcı', 'Satıcı'].map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setYeniMusteri({...yeniMusteri, tip})}
                    className={`flex-1 py-2 rounded-xl font-bold transition-all ${yeniMusteri.tip === tip ? 'bg-white shadow-sm text-[#0A192F]' : 'text-gray-400'}`}
                  >
                    {tip}
                  </button>
                ))}
              </div>

              <input required placeholder="Ad Soyad" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"
                onChange={e => setYeniMusteri({...yeniMusteri, ad: e.target.value})} />
              
              <input required placeholder="Telefon" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"
                onChange={e => setYeniMusteri({...yeniMusteri, telefon: e.target.value})} />

              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Bütçe / Fiyat" type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"

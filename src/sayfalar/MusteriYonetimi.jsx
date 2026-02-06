import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Search, Phone, MessageSquare, Trash2, UserCheck, Repeat } from 'lucide-react';

const MusteriYonetimi = () => {
  const [musteriler, setMusteriler] = useState([]);
  const [ilanlar, setIlanlar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [formAcik, setFormAcik] = useState(false);
  const [yeniMusteri, setYeniMusteri] = useState({ 
    ad: "", 
    telefon: "", 
    not: "", 
    durum: "Beklemede",
    tip: "Alıcı",
    butce: "",
    bolge: ""
  });

  useEffect(() => {
    const qMusteri = query(collection(veritabani, "musteriler"));
    const unsubscribeMusteri = onSnapshot(qMusteri, (snap) => {
      setMusteriler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

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

  const eslesenIlanlariBul = (musteri) => {
    if (musteri.tip !== "Alıcı") return [];
    return ilanlar.filter(ilan => {
      const bolgeUyuyor = ilan.konum?.toLowerCase().includes(musteri.bolge?.toLowerCase());
      const fiyatUyuyor = Number(ilan.fiyat) <= Number(musteri.butce) * 1.1;
      return bolgeUyuyor && fiyatUyuyor;
    });
  };

  return (
    <div className="space-y-6 p-4">
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
          m.ad?.toLowerCase().

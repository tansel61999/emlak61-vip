import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Search, Phone, MessageSquare, Trash2, UserCheck, Clock } from 'lucide-react';

const MusteriYonetimi = () => {
  const [musteriler, setMusteriler] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [formAcik, setFormAcik] = useState(false);
  const [yeniMusteri, setYeniMusteri] = useState({ ad: "", telefon: "", not: "", durum: "Beklemede" });

  useEffect(() => {
    const q = query(collection(veritabani, "musteriler"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMusteriler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const musteriKaydet = async (e) => {
    e.preventDefault();
    await addDoc(collection(veritabani, "musteriler"), {
      ...yeniMusteri,
      tarih: serverTimestamp()
    });
    setFormAcik(false);
    setYeniMusteri({ ad: "", telefon: "", not: "", durum: "Beklemede" });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:row justify-between items-center bg-white p-6 rounded-3xl shadow-sm gap-4">
        <h2 className="text-2xl font-black text-[#0A192F]">MÜŞTERİ PORTFÖYÜ</h2>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Müşteri adı veya notlarda ara..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"
            onChange={(e) => setAramaMetni(e.target.value.toLowerCase())}
          />
        </div>

        <button
          onClick={() => setFormAcik(true)}
          className="bg-[#0A192F] text-[#FFD700] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
        >
          <UserPlus size={20} /> Yeni Müşteri Ekle
        </button>
      </div>

      {/* Müşteri Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musteriler.filter(m => m.ad?.toLowerCase().includes(aramaMetni) || m.not?.toLowerCase().includes(aramaMetni)).map((m) => (
          <div key={m.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-100 p-3 rounded-2xl text-[#0A192F]">
                <UserCheck size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.durum === 'Tamamlandı' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {m.durum}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-1">{m.ad}</h3>
            <p className="text-gray-500 font-medium mb-4 flex items-center gap-2"><Phone size={14}/> {m.telefon}</p>

            <div className="bg-gray-50 p-4 rounded-2xl mb-6 min-h-[80px]">
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
        ))}
      </div>

      {/* Müşteri Ekleme Modal */}
      {formAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black mb-6">Müşteri Kaydı</h3>
            <form onSubmit={musteriKaydet} className="space-y-4">
              <input required placeholder="Ad Soyad" className="w-full p-4 bg-gray-50 border-none rounded-2xl"
                onChange={e => setYeniMusteri({...yeniMusteri, ad: e.target.value})} />
              <input required placeholder="Telefon (Başında 0 olmadan)" className="w-full p-4 bg-gray-50 border-none rounded-2xl"
                onChange={e => setYeniMusteri({...yeniMusteri, telefon: e.target.value})} />
              <textarea placeholder="Müşteri Notu (Hangi ilanla ilgileniyor?)" className="w-full p-4 bg-gray-50 border-none rounded-2xl h-32"
                onChange={e => setYeniMusteri({...yeniMusteri, not: e.target.value})} />
              <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-4 rounded-2xl font-black">MÜŞTERİYİ KAYDET</button>
              <button type="button" onClick={() => setFormAcik(false)} className="w-full text-gray-400 font-bold">Vazgeç</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusteriYonetimi;
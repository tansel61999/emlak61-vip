import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Archive, User, Home, Tag, Phone, Clock, Calendar, RotateCcw, MapPin, BadgeInfo, X } from 'lucide-react';

const Arsiv = () => {
  const [arsivMusteriler, setArsivMusteriler] = useState([]);
  const [arsivIlanlar, setArsivIlanlar] = useState([]);
  const [sekme, setSekme] = useState('musteri');
  const [seciliDetay, setSeciliDetay] = useState(null);

  useEffect(() => {
    const qMusteri = query(collection(veritabani, "musteriler"));
    const unsubscribeMusteri = onSnapshot(qMusteri, (snap) => {
      const veriler = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.durum === "Arşivlendi" || m.durum === "arsivlendi");
      setArsivMusteriler(veriler);
    });

    const qIlan = query(collection(veritabani, "ilanlar"));
    const unsubscribeIlan = onSnapshot(qIlan, (snap) => {
      const ilanVerileri = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(i => ["Satıldı", "Pasif", "satildi", "pasif", "Satildi"].includes(i.durum));
      setArsivIlanlar(ilanVerileri);
    });

    return () => { unsubscribeMusteri(); unsubscribeIlan(); };
  }, []);

  const geriYukle = async (id, tip) => {
    const onay = window.confirm("Bu kaydı aktif listeye geri taşımak istiyor musunuz?");
    if (onay) {
      const ref = doc(veritabani, tip === 'musteri' ? "musteriler" : "ilanlar", id);
      await updateDoc(ref, { 
        durum: tip === 'musteri' ? "Beklemede" : "Aktif",
        sonIslemTarihi: serverTimestamp() 
      });
      setSeciliDetay(null);
    }
  };

  const formatTarih = (ts) => {
    if (!ts) return "Tarih Yok";
    const d = ts.toDate();
    return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-100 min-h-screen">
      {/* Üst Bilgi Paneli */}
      <div className="bg-[#0A192F] p-8 rounded-[2.5rem] shadow-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#FFD700] p-4 rounded-3xl text-[#0A192F] shadow-lg">
              <Archive size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">ARŞİV VE GEÇMİŞ</h2>
              <p className="text-[#FFD700] text-[10px] font-black tracking-widest opacity-80 uppercase">Hatalı işlemleri geri alabilir ve detayları inceleyebilirsiniz</p>
            </div>
          </div>

          <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
            <button onClick={() => setSekme('musteri')} className={`px-8 py-3 rounded-xl font-black text-xs transition-all ${sekme === 'musteri' ? 'bg-[#FFD700] text-[#0A192F]' : 'text-gray-300'}`}>
              MÜŞTERİLER ({arsivMusteriler.length})
            </button>
            <button onClick={() => setSekme('ilan')} className={`px-8 py-3 rounded-xl font-black text-xs transition-all ${sekme === 'ilan' ? 'bg-[#FFD700] text-[#0A192F]' : 'text-gray-300'}`}>
              İLANLAR ({arsivIlanlar.length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste Görünümü */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(sekme === 'musteri' ? arsivMusteriler : arsivIlanlar).map(item => (
          <div key={item.id} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-200 group hover:border-[#FFD700] transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${sekme === 'musteri' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {sekme === 'musteri' ? <User size={24}/> : <Home size={24}/>}
              </div>
              <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">
                 {item.durum}
              </span>
            </div>
            
            <h3 className="text-2xl font-black text-[#0A192F] uppercase mb-1 tracking-tighter leading-tight">{item.ad || item.baslik}</h3>
            <div className="space-y-2 mb-6 text-sm font-bold text-gray-500">
                <p className="flex items-center gap-2"><Phone size={14} className="text-[#FFD700]"/> 0{item.telefon}</p>
                <p className="flex items-center gap-2"><Clock size={14} className="text-red-400"/> Arşiv: {formatTarih(item.arsivTarihi)}</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setSeciliDetay(item)}
                className="flex-1 bg-gray-100 text-[#0A192F] py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all"
              >
                <BadgeInfo size={16}/> TÜM DETAYLAR
              </button>
              <button 
                onClick={() => geriYukle(item.id, sekme)}
                className="flex-1 bg-[#0A192F] text-[#FFD700] py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white transition-all"
              >
                <RotateCcw size={16}/> GERİ YÜKLE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DETAY MODAL - HER ŞEY BURADA */}
      {seciliDetay && (
        <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl relative">
            <button onClick={() => setSeciliDetay(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                <X size={32}/>
            </button>
            
            <div className="bg-[#FFD700] p-10 text-[#0A192F]">
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-2">{seciliDetay.ad || seciliDetay.baslik}</h3>
              <div className="flex gap-4 opacity-80 font-bold text-sm">
                <span className="flex items-center gap-1"><Calendar size={16}/> Kayıt: {formatTarih(seciliDetay.tarih)}</span>
              </div>
            </div>

            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">TALEP / KATEGORİ</p>
                  <p className="font-black text-[#0A192F] uppercase">{seciliDetay.talepDetay?.kategori || seciliDetay.kategori || "Belirtilmedi"}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">BÜTÇE / FİYAT</p>
                  <p className="font-black text-green-600 uppercase">
                    {seciliDetay.talepDetay?.fiyatMax ? `${seciliDetay.talepDetay.fiyatMax} TL` : (seciliDetay.fiyat ? `${seciliDetay.fiyat} TL` : "NaN")}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                <p className="text-[10px] font-black text-blue-500 uppercase mb-2 tracking-widest flex items-center gap-1"><MapPin size={12}/> İSTENEN KONUM</p>
                <p className="font-bold text-[#0A192F]">{seciliDetay.talepDetay?.konum || seciliDetay.konum || "Bölge Belirtilmedi"}</p>
              </div>

              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase mb-2 tracking-widest">MÜŞTERİ / İLAN NOTU</p>
                <p className="text-sm text-amber-900 font-medium italic leading-relaxed">"{seciliDetay.not || "Not girilmemiş."}"</p>
              </div>

              <button 
                onClick={() => geriYukle(seciliDetay.id, sekme)}
                className="w-full bg-[#0A192F] text-[#FFD700] py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-transform"
              >
                <RotateCcw size={24}/> BU KAYDI AKTİF LİSTEYE TAŞI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arsiv;

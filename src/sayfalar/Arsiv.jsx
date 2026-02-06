import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Archive, User, Home, Tag, Phone, Clock, Calendar, RotateCcw, Info, X, UserPlus } from 'lucide-react';

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
    if (!ts) return "Belirtilmedi";
    const d = ts.toDate();
    return `${d.toLocaleDateString('tr-TR')} - ${d.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* Üst Panel */}
      <div className="bg-[#0A192F] p-8 rounded-[2.5rem] shadow-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#FFD700] p-4 rounded-3xl text-[#0A192F] shadow-lg">
              <Archive size={32} strokeWidth={2.5}/>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">ARŞİV MERKEZİ</h2>
              <p className="text-[#FFD700] text-[10px] font-black tracking-widest opacity-80 uppercase">Geçmiş Kayıt ve Geri Yükleme Yönetimi</p>
            </div>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <button onClick={() => setSekme('musteri')} className={`px-8 py-3 rounded-xl font-black text-xs transition-all ${sekme === 'musteri' ? 'bg-[#FFD700] text-[#0A192F]' : 'text-gray-400'}`}>
              MÜŞTERİLER ({arsivMusteriler.length})
            </button>
            <button onClick={() => setSekme('ilan')} className={`px-8 py-3 rounded-xl font-black text-xs transition-all ${sekme === 'ilan' ? 'bg-[#FFD700] text-[#0A192F]' : 'text-gray-400'}`}>
              İLANLAR ({arsivIlanlar.length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(sekme === 'musteri' ? arsivMusteriler : arsivIlanlar).map(item => (
          <div key={item.id} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-[#FFD700] transition-all">
            <div className="flex justify-between items-start mb-5">
              <div className={`p-3 rounded-2xl ${sekme === 'musteri' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {sekme === 'musteri' ? <User size={24}/> : <Home size={24}/>}
              </div>
              <button onClick={() => setSeciliDetay(item)} className="text-gray-300 hover:text-[#0A192F] transition-colors">
                <Info size={24} />
              </button>
            </div>
            
            <h3 className="text-2xl font-black text-[#0A192F] uppercase mb-1 tracking-tighter">{item.ad || item.baslik}</h3>
            <p className="text-gray-400 text-xs font-bold flex items-center gap-1 mb-6">
              <Clock size={12}/> Arşivlenme: {formatTarih(item.arsivTarihi)}
            </p>

            <button 
              onClick={() => geriYukle(item.id, sekme)}
              className="w-full bg-gray-50 text-[#0A192F] py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#FFD700] transition-all border border-gray-100"
            >
              <RotateCcw size={16}/> AKTİF LİSTEYE GERİ AL
            </button>
          </div>
        ))}
      </div>

      {/* DETAY MODALI */}
      {seciliDetay && (
        <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button onClick={() => setSeciliDetay(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"><X size={32}/></button>
            
            <div className="bg-[#FFD700] p-10 text-[#0A192F]">
              <div className="bg-[#0A192F] w-16 h-16 rounded-2xl flex items-center justify-center text-[#FFD700] mb-4 shadow-xl">
                {sekme === 'musteri' ? <User size={32}/> : <Home size={32}/>}
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight">{seciliDetay.ad || seciliDetay.baslik}</h3>
              <p className="font-bold opacity-70">Kayıt ID: {seciliDetay.id.slice(0,8)}...</p>
            </div>

            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Oluşturma Tarihi</p>
                  <p className="text-sm font-bold text-[#0A192F] flex items-center gap-2"><Calendar size={14}/> {formatTarih(seciliDetay.tarih)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Arşivlenme Tarihi</p>
                  <p className="text-sm font-bold text-orange-600 flex items-center gap-2"><Clock size={14}/> {formatTarih(seciliDetay.arsivTarihi)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#0A192F] font-bold">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Phone size={16}/></div>
                  0{seciliDetay.telefon || "Belirtilmedi"}
                </div>
                {seciliDetay.not && (
                  <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Sistem Notu</p>
                    <p className="text-sm text-amber-900 font-medium italic">"{seciliDetay.not}"</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => geriYukle(seciliDetay.id, sekme)}
                className="w-full bg-[#0A192F] text-[#FFD700] py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-transform"
              >
                <RotateCcw size={24}/> HATALI İŞLEM: GERİ YÜKLE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arsiv;

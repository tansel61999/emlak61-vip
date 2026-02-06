import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Archive, User, Home, Tag, Phone, Clock, Calendar, RotateCcw, BadgeInfo, X, UserCheck, Edit3 } from 'lucide-react';

const Arsiv = () => {
  const [arsivMusteriler, setArsivMusteriler] = useState([]);
  const [arsivIlanlar, setArsivIlanlar] = useState([]);
  const [sekme, setSekme] = useState('musteri');
  const [seciliDetay, setSeciliDetay] = useState(null);

  // Mevcut giriş yapan kullanıcıyı al (Eğer auth sistemin varsa buraya bağla)
  const aktifKullanici = localStorage.getItem("kullaniciAd") || "Yönetici";

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
        sonIslemTarihi: serverTimestamp(),
        sonIslemYapan: aktifKullanici // Geri yükleyen kişiyi kaydeder
      });
      setSeciliDetay(null);
    }
  };

  const formatTarih = (ts) => {
    if (!ts) return "Belirtilmedi";
    const d = ts.toDate();
    return d.toLocaleString('tr-TR');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#F1F5F9] min-h-screen">
      {/* Üst Panel */}
      <div className="bg-[#0A192F] p-8 rounded-[3rem] shadow-2xl text-white border-b-8 border-[#FFD700]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#FFD700] p-4 rounded-2xl text-[#0A192F]"><Archive size={32} /></div>
            <div>
              <h2 className="text-3xl font-black uppercase italic">Sistem Arşivi</h2>
              <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Kullanıcı İşlem Takip Merkezi</p>
            </div>
          </div>
          <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10">
            <button onClick={() => setSekme('musteri')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${sekme === 'musteri' ? 'bg-[#FFD700] text-[#0A192F]' : 'text-white'}`}>MÜŞTERİLER</button>
            <button onClick={() => setSekme('ilan')} className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${sekme === 'ilan' ? 'bg-[#FFD700] text-[#0A192F]' : 'text-white'}`}>İLANLAR</button>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(sekme === 'musteri' ? arsivMusteriler : arsivIlanlar).map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase italic">Arşivlendi</span>
              <div className="text-gray-300"><Clock size={18}/></div>
            </div>
            <h3 className="text-xl font-black text-[#0A192F] uppercase mb-4">{item.ad || item.baslik}</h3>
            
            <div className="space-y-2 mb-6 border-l-2 border-[#FFD700] pl-4">
               <p className="text-[10px] text-gray-400 font-bold uppercase">Son İşlem Yapan</p>
               <p className="text-sm font-black text-[#0A192F] flex items-center gap-2"><UserCheck size={14} className="text-blue-500"/> {item.sonIslemYapan || item.kayitEden || "Bilinmiyor"}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSeciliDetay(item)} className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-xl font-black text-[10px] hover:bg-blue-50 hover:text-blue-600 transition-all uppercase">Detaylar</button>
              <button onClick={() => geriYukle(item.id, sekme)} className="flex-1 bg-[#0A192F] text-[#FFD700] py-3 rounded-xl font-black text-[10px] hover:bg-green-600 hover:text-white transition-all uppercase italic">Geri Yükle</button>
            </div>
          </div>
        ))}
      </div>

      {/* Detay Modalı */}
      {seciliDetay && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[500] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#FFD700] p-8 text-[#0A192F] flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{seciliDetay.ad || seciliDetay.baslik}</h3>
              <button onClick={() => setSeciliDetay(null)} className="bg-[#0A192F] text-white p-2 rounded-xl"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase">Kaydı Oluşturan</p>
                <p className="font-bold text-[#0A192F]">{seciliDetay.kayitEden || "Sistem"}</p>
                <p className="text-[9px] text-gray-400 italic">{formatTarih(seciliDetay.tarih)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-500 uppercase">Arşivleyen / Güncelleyen</p>
                <p className="font-bold text-[#0A192F]">{seciliDetay.sonIslemYapan || "Bilinmiyor"}</p>
                <p className="text-[9px] text-gray-400 italic">{formatTarih(seciliDetay.arsivTarihi || seciliDetay.sonIslemTarihi)}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase mb-1 font-bold">Not:</p>
                <p className="text-xs text-amber-900 italic font-medium">"{seciliDetay.not || "Not yok."}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arsiv;

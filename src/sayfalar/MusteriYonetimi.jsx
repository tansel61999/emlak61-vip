import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Search, Phone, MessageSquare, Trash2, UserCheck, PlusCircle, X, Briefcase, Zap, Filter } from 'lucide-react';
import GenelForm from './GenelForm';

const MusteriYonetimi = () => {
  const [musteriler, setMusteriler] = useState([]);
  const [ilanlar, setIlanlar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [kategoriFiltre, setKategoriFiltre] = useState("Hepsi");
  const [formAcik, setFormAcik] = useState(false);
  const [seciliMusteri, setSeciliMusteri] = useState(null);
  
  const [isTalebi, setIsTalebi] = useState({
    musteriAd: "", musteriTelefon: "", islemTuru: "Satılık", emlakTipi: "Daire", 
    fiyat: "", konum: "", aciklama: "", resimler: []
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

    return () => { unsubscribeMusteri(); unsubscribeIlan(); };
  }, []);

  const eslesenIlanlariGetir = (talep) => {
    if (!talep) return [];
    return ilanlar.filter(ilan => {
      const katUyumu = ilan.emlakTipi === talep.emlakTipi;
      const islemUyumu = ilan.islemTuru === talep.islemTuru;
      return katUyumu && islemUyumu;
    });
  };

  const talepKaydet = async (e) => {
    if(e) e.preventDefault();
    
    if (seciliMusteri) {
      const musteriRef = doc(veritabani, "musteriler", seciliMusteri.id);
      await updateDoc(musteriRef, { 
        ad: isTalebi.musteriAd,
        telefon: isTalebi.musteriTelefon,
        talepDetay: isTalebi 
      });
    } else {
      await addDoc(collection(veritabani, "musteriler"), { 
        ad: isTalebi.musteriAd, 
        telefon: isTalebi.musteriTelefon, 
        not: isTalebi.aciklama,
        talepDetay: isTalebi,
        tarih: serverTimestamp() 
      });
    }
    
    setFormAcik(false);
    setSeciliMusteri(null);
    setIsTalebi({ musteriAd: "", musteriTelefon: "", islemTuru: "Satılık", emlakTipi: "Daire", fiyat: "", konum: "", aciklama: "", resimler: [] });
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
    <div className="space-y-6 p-4">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-black text-[#0A192F]">MÜŞTERİ PORTFÖYÜ</h2>
          <button onClick={() => { setSeciliMusteri(null); setFormAcik(true); }} className="bg-[#0A192F] text-[#FFD700] px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <UserPlus size={20} /> YENİ MÜŞTERİ
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center pt-4 border-t border-gray-100">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="İsim, telefon veya notlarda ara..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700] font-bold"
              onChange={(e) => setAramaMetni(e.target.value.toLowerCase())}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musteriler
          .filter(m => m.ad?.toLowerCase().includes(aramaMetni) || m.telefon?.includes(aramaMetni))
          .map((m) => {
            const eslesmeler = eslesenIlanlariGetir(m.talepDetay);
            return (
              <div key={m.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative group overflow-hidden">
                {eslesmeler.length > 0 && (
                  <div className="absolute top-0 left-0 bg-[#FFD700] text-[#0A192F] px-4 py-2 rounded-br-2xl font-black text-[10px] flex items-center gap-1 animate-pulse">
                    <Zap size={12} fill="currentColor"/> {eslesmeler.length} UYGUN İLAN
                  </div>
                )}

                <div className="flex justify-between items-center mb-6">
                  <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-[#0A192F]">
                    <UserCheck size={24} />
                  </div>
                  <button onClick={() => musteriSil(m.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>

                <h3 className="text-2xl font-black text-gray-800 mb-1 uppercase leading-tight">{m.ad}</h3>
                <div className="flex items-center gap-2 text-gray-500 font-bold mb-6">
                   <Phone size={16} className="text-[#FFD700]"/> 0{m.telefon}
                </div>

                <div className="bg-gray-50 p-5 rounded-3xl mb-6 border border-gray-100">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-2">Talep Özeti</p>
                  {m.talepDetay ? (
                    <div className="flex flex-wrap gap-2 pt-3">
                      <span className="bg-[#0A192F] text-[#FFD700] text-[9px] px-2 py-1 rounded-lg font-black uppercase">{m.talepDetay.islemTuru}</span>
                      <span className="bg-blue-50 text-blue-700 text-[9px] px-2 py-1 rounded-lg font-black uppercase">{m.talepDetay.emlakTipi}</span>
                      <span className="bg-green-50 text-green-700 text-[9px] px-2 py-1 rounded-lg font-black uppercase">{m.talepDetay.konum}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-tighter">Henüz detaylı talep girilmedi</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => { 
                      setSeciliMusteri(m); 
                      setIsTalebi(m.talepDetay || { musteriAd: m.ad, musteriTelefon: m.telefon, islemTuru: "Satılık", emlakTipi: "Daire" }); 
                      setFormAcik(true); 
                    }}
                    className="w-full bg-[#FFD700] text-[#0A192F] py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#0A192F] hover:text-[#FFD700] transition-all"
                  >
                    <Briefcase size={16}/> {m.talepDetay ? "TALEBİ GÜNCELLE" : "İŞ / TALEP EKLE"}
                  </button>
                  <button onClick={() => whatsappMesaj(m.telefon)} className="w-full bg-[#25D366] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs hover:opacity-90">
                    <MessageSquare size={18} /> WHATSAPP'TAN YAZ
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {formAcik && (
        <GenelForm 
          tip="talep"
          baslik={seciliMusteri ? "TALEBİ GÜNCELLE" : "YENİ MÜŞTERİ TALEBİ"}
          veri={isTalebi}
          setVeri={setIsTalebi}
          kapat={() => { setFormAcik(false); setSeciliMusteri(null); }}
          kaydet={talepKaydet}
          resimYukle={() => {}}
          resimYukleniyor={false}
        />
      )}
    </div>
  );
};

export default MusteriYonetimi;

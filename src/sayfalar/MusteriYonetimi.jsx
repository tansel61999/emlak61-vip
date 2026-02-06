import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Search, Phone, MessageSquare, Trash2, UserCheck, PlusCircle, X, Briefcase, Zap, Filter } from 'lucide-react';

const MusteriYonetimi = () => {
  const [musteriler, setMusteriler] = useState([]);
  const [ilanlar, setIlanlar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [kategoriFiltre, setKategoriFiltre] = useState("Hepsi");
  const [formAcik, setFormAcik] = useState(false);
  const [talepFormAcik, setTalepFormAcik] = useState(false);
  const [seciliMusteri, setSeciliMusteri] = useState(null);
  
  const [yeniMusteri, setYeniMusteri] = useState({ ad: "", telefon: "", not: "" });
  const [isTalebi, setIsTalebi] = useState({
    islemTipi: "Satılık", kategori: "Daire", fiyatMin: "", fiyatMax: "",
    konum: "", mutfak: "Fark Etmez", manzara: "Yok", isitma: "Klima", kat: ""
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
      const katUyumu = ilan.kategori === talep.kategori;
      const islemUyumu = ilan.islemTipi === talep.islemTipi;
      const fiyatUyumu = (!talep.fiyatMax || Number(ilan.fiyat) <= Number(talep.fiyatMax)) &&
                         (!talep.fiyatMin || Number(ilan.fiyat) >= Number(talep.fiyatMin));
      const konumUyumu = talep.konum ? ilan.konum?.toLowerCase().includes(talep.konum.split(',')[0].trim().toLowerCase()) : true;
      return katUyumu && islemUyumu && fiyatUyumu && konumUyumu;
    });
  };

  const musteriKaydet = async (e) => {
    e.preventDefault();
    await addDoc(collection(veritabani, "musteriler"), { ...yeniMusteri, durum: "Beklemede", tarih: serverTimestamp() });
    setFormAcik(false);
    setYeniMusteri({ ad: "", telefon: "", not: "" });
  };

  const talepKaydet = async (e) => {
    e.preventDefault();
    const musteriRef = doc(veritabani, "musteriler", seciliMusteri.id);
    await updateDoc(musteriRef, { talepDetay: isTalebi });
    setTalepFormAcik(false);
    setSeciliMusteri(null);
    setIsTalebi({ islemTipi: "Satılık", kategori: "Daire", fiyatMin: "", fiyatMax: "", konum: "", mutfak: "Fark Etmez", manzara: "Yok", isitma: "Klima", kat: "" });
  };

  const musteriSil = async (id) => {
    if (window.confirm("Müşteri kaydını silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(veritabani, "musteriler", id));
    }
  };

  const arsivle = async (id) => {
    const onay = window.confirm("Bu müşteriyi arşive taşımak istiyor musunuz?");
    if (onay) {
      await updateDoc(doc(veritabani, "musteriler", id), { 
        durum: "Arşivlendi",
        arsivTarihi: serverTimestamp() 
      });
    }
  };

  const whatsappMesaj = (tel) => {
    const temizTel = tel.replace(/\s/g, '');
    window.open(`https://wa.me/90${temizTel}`, '_blank');
  };

  return (
    <div className="space-y-6 p-4">
      {/* Üst Panel */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-black text-[#0A192F]">MÜŞTERİ PORTFÖYÜ</h2>
          <button onClick={() => setFormAcik(true)} className="bg-[#0A192F] text-[#FFD700] px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg">
            <UserPlus size={20} /> YENİ MÜŞTERİ
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center pt-4 border-t border-gray-100">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="İsim veya telefon ara..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700] font-bold"
              onChange={(e) => setAramaMetni(e.target.value.toLowerCase())}
            />
          </div>
          <select 
            className="p-3.5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#FFD700]"
            onChange={(e) => setKategoriFiltre(e.target.value)}
          >
            <option value="Hepsi">Tüm Kategoriler</option>
            <option value="Daire">Daire</option>
            <option value="Villa">Villa</option>
            <option value="Arsa">Arsa</option>
          </select>
        </div>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musteriler
          .filter(m => m.durum !== "Arşivlendi")
          .filter(m => m.ad?.toLowerCase().includes(aramaMetni) || m.telefon?.includes(aramaMetni))
          .filter(m => kategoriFiltre === "Hepsi" || m.talepDetay?.kategori === kategoriFiltre)
          .map((m) => {
            const eslesmeler = eslesenIlanlariGetir(m.talepDetay);
            return (
              <div key={m.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
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

                <h3 className="text-2xl font-black text-gray-800 mb-1 uppercase tracking-tighter">{m.ad}</h3>
                <div className="flex items-center gap-2 text-gray-500 font-bold mb-6 text-sm">
                   <Phone size={14} className="text-[#FFD700]"/> 0{m.telefon}
                </div>

                <div className="bg-gray-50 p-5 rounded-3xl mb-6 border border-gray-100 min-h-[100px]">
                  <p className="text-sm text-gray-600 font-medium italic mb-3">"{m.not}"</p>
                  {m.talepDetay && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                      <span className="bg-[#0A192F] text-[#FFD700] text-[9px] px-2 py-1 rounded-lg font-black uppercase">{m.talepDetay.islemTipi}</span>
                      <span className="bg-blue-50 text-blue-700 text-[9px] px-2 py-1 rounded-lg font-black uppercase">{m.talepDetay.kategori}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => { setSeciliMusteri(m); setTalepFormAcik(true); }}
                    className="w-full bg-[#FFD700] text-[#0A192F] py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-[#0A192F] hover:text-[#FFD700] transition-all"
                  >
                    <Briefcase size={16}/> {m.talepDetay ? "TALEBİ GÜNCELLE" : "İŞ / TALEP EKLE"}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => whatsappMesaj(m.telefon)} className="flex-1 bg-[#25D366] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs">
                      <MessageSquare size={18} /> WHATSAPP
                    </button>
                    <button onClick={() => arsivle(m.id)} className="flex-1 bg-[#0A192F] text-[#FFD700] py-4 rounded-2xl font-black text-[10px]">
                      ARŞİVLE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* MODAL: MÜŞTERİ EKLE */}
      {formAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md">
            <h3 className="text-3xl font-black mb-8 text-[#0A192F]">YENİ MÜŞTERİ</h3>
            <form onSubmit={musteriKaydet} className="space-y-5">
              <input required placeholder="Ad Soyad" className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold" onChange={e => setYeniMusteri({...yeniMusteri, ad: e.target.value})} />
              <input required placeholder="Telefon" className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold" onChange={e => setYeniMusteri({...yeniMusteri, telefon: e.target.value})} />
              <textarea placeholder="Not..." className="w-full p-5 bg-gray-50 border-none rounded-2xl h-32 font-bold" onChange={e => setYeniMusteri({...yeniMusteri, not: e.target.value})} />
              <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-5 rounded-2xl font-black text-lg">KAYDET</button>
              <button type="button" onClick={() => setFormAcik(false)} className="w-full text-gray-400 font-bold py-2">Vazgeç</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TALEP FORMU */}
      {talepFormAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-6 right-6 text-gray-400" onClick={() => setTalepFormAcik(false)}><X size={30}/></button>
            <h3 className="text-2xl font-black mb-8 text-[#0A192F] uppercase">{seciliMusteri?.ad} <br/><span className="text-[#FFD700]">TALEP DETAYLARI</span></h3>
            <form onSubmit={talepKaydet} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase">İşlem & Kategori</label>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" value={isTalebi.islemTipi} onChange={e => setIsTalebi({...isTalebi, islemTipi: e.target.value})}>
                        <option>Satılık</option><option>Kiralık</option>
                    </select>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" value={isTalebi.kategori} onChange={e => setIsTalebi({...isTalebi, kategori: e.target.value})}>
                        <option>Daire</option><option>Villa</option><option>Yazlık</option><option>Arsa</option>
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase">Bütçe (TL)</label>
                    <input type="number" placeholder="Min" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" onChange={e => setIsTalebi({...isTalebi, fiyatMin: e.target.value})} />
                    <input type="number" placeholder="Max" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" onChange={e => setIsTalebi({...isTalebi, fiyatMax: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase">Konum</label>
                    <input placeholder="Örn: Kuşadası..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" onChange={e => setIsTalebi({...isTalebi, konum: e.target.value})} />
                </div>
                <button type="submit" className="md:col-span-2 bg-[#0A192F] text-[#FFD700] py-5 rounded-2xl font-black text-xl shadow-xl">KAYDET VE EŞLEŞTİR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusteriYonetimi;

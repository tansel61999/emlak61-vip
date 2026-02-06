import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Search, Phone, MessageSquare, Trash2, UserCheck, PlusCircle, X } from 'lucide-react';

const MusteriYonetimi = () => {
  const [musteriler, setMusteriler] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [formAcik, setFormAcik] = useState(false);
  const [talepFormAcik, setTalepFormAcik] = useState(false);
  const [seciliMusteri, setSeciliMusteri] = useState(null);
  
  // Ana Müşteri Kaydı (Sadece 3 Bilgi)
  const [yeniMusteri, setYeniMusteri] = useState({ ad: "", telefon: "", not: "", durum: "Beklemede" });

  // Detaylı Talep Formu State
  const [isTalebi, setIsTalebi] = useState({
    islemTipi: "Satılık",
    kategori: "Daire",
    fiyatMin: "",
    fiyatMax: "",
    konum: "",
    mutfak: "Fark Etmez",
    manzara: "Yok",
    isitma: "Klima",
    kat: ""
  });

  useEffect(() => {
    const q = query(collection(veritabani, "musteriler"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMusteriler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const musteriKaydet = async (e) => {
    e.preventDefault();
    await addDoc(collection(veritabani, "musteriler"), { ...yeniMusteri, tarih: serverTimestamp() });
    setFormAcik(false);
    setYeniMusteri({ ad: "", telefon: "", not: "", durum: "Beklemede" });
  };

  const talepKaydet = async (e) => {
    e.preventDefault();
    const musteriRef = doc(veritabani, "musteriler", seciliMusteri.id);
    await updateDoc(musteriRef, { talepDetay: isTalebi });
    setTalepFormAcik(false);
    setSeciliMusteri(null);
    setIsTalebi({ islemTipi: "Satılık", kategori: "Daire", fiyatMin: "", fiyatMax: "", konum: "", mutfak: "Fark Etmez", manzara: "Yok", isitma: "Klima", kat: "" });
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
    <div className="space-y-6 p-4">
      {/* Üst Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm gap-4">
        <h2 className="text-2xl font-black text-[#0A192F]">MÜŞTERİ PORTFÖYÜ</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Müşteri ara..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700]"
            onChange={(e) => setAramaMetni(e.target.value.toLowerCase())}
          />
        </div>
        <button onClick={() => setFormAcik(true)} className="bg-[#0A192F] text-[#FFD700] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
          <UserPlus size={20} /> Yeni Müşteri Ekle
        </button>
      </div>

      {/* Müşteri Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musteriler.filter(m => m.ad?.toLowerCase().includes(aramaMetni)).map((m) => (
          <div key={m.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-100 p-3 rounded-2xl text-[#0A192F]"><UserCheck size={24} /></div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.durum === 'Tamamlandı' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {m.durum}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-1">{m.ad}</h3>
            <p className="text-gray-500 font-medium mb-4 flex items-center gap-2">
               <Phone size={14}/> {m.telefon} 
               <a href={`tel:0${m.telefon}`} className="ml-2 text-blue-500 text-xs underline">Ara</a>
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl mb-4 min-h-[60px]">
              <p className="text-sm text-gray-600 italic">"{m.not}"</p>
              {m.talepDetay && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-bold text-[#0A192F] uppercase bg-[#FFD700]/20 px-2 py-1 rounded">
                    {m.talepDetay.islemTipi} - {m.talepDetay.kategori}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setSeciliMusteri(m); setTalepFormAcik(true); }}
                className="w-full bg-[#FFD700] text-[#0A192F] py-2 rounded-xl font-black text-xs flex items-center justify-center gap-2"
              >
                <PlusCircle size={16}/> {m.talepDetay ? "TALEBİ GÜNCELLE" : "İŞ / TALEP EKLE"}
              </button>
              
              <div className="flex gap-2">
                <button onClick={() => whatsappMesaj(m.telefon)} className="flex-1 bg-green-500 text-white p-3 rounded-xl flex justify-center"><MessageSquare size={20} /></button>
                <button onClick={() => durumGuncelle(m.id, m.durum === 'Beklemede' ? 'Tamamlandı' : 'Beklemede')} className="flex-1 bg-[#0A192F] text-[#FFD700] p-3 rounded-xl font-bold text-xs">
                  {m.durum === 'Beklemede' ? 'ONAYLA' : 'GERİ AL'}
                </button>
                <button onClick={() => musteriSil(m.id)} className="bg-red-50 text-red-500 p-3 rounded-xl"><Trash2 size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Hızlı Müşteri Ekleme (3 Bilgi) */}
      {formAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-black mb-6">Hızlı Müşteri Kaydı</h3>
            <form onSubmit={musteriKaydet} className="space-y-4">
              <input required placeholder="Ad Soyad" className="w-full p-4 bg-gray-50 border-none rounded-2xl" onChange={e => setYeniMusteri({...yeniMusteri, ad: e.target.value})} />
              <input required placeholder="Telefon" className="w-full p-4 bg-gray-50 border-none rounded-2xl" onChange={e => setYeniMusteri({...yeniMusteri, telefon: e.target.value})} />
              <textarea placeholder="Kısa Not" className="w-full p-4 bg-gray-50 border-none rounded-2xl h-24" onChange={e => setYeniMusteri({...yeniMusteri, not: e.target.value})} />
              <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-4 rounded-2xl font-black">KAYDET</button>
              <button type="button" onClick={() => setFormAcik(false)} className="w-full text-gray-400 font-bold">Vazgeç</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Detaylı İş/Talep Formu */}
      {talepFormAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/80 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase">{seciliMusteri?.ad} - TALEP FORMU</h3>
              <button onClick={() => setTalepFormAcik(false)}><X/></button>
            </div>
            
            <form onSubmit={talepKaydet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400">İŞLEM VE KATEGORİ</label>
                <select className="w-full p-3 bg-gray-50 rounded-xl mt-1" onChange={e => setIsTalebi({...isTalebi, islemTipi: e.target.value})}>
                  <option>Satılık</option><option>Kiralık</option>
                </select>
                <select className="w-full p-3 bg-gray-50 rounded-xl mt-2" onChange={e => setIsTalebi({...isTalebi, kategori: e.target.value})}>
                  <option>Daire</option><option>Villa</option><option>Yazlık</option><option>Arsa</option><option>Tarla</option><option>Ticari</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400">FİYAT ARALIĞI (TL)</label>
                <div className="flex gap-2 mt-1">
                  <input type="number" placeholder="Min" className="w-1/2 p-3 bg-gray-50 rounded-xl" onChange={e => setIsTalebi({...isTalebi, fiyatMin: e.target.value})} />
                  <input type="number" placeholder="Max" className="w-1/2 p-3 bg-gray-50 rounded-xl" onChange={e => setIsTalebi({...isTalebi, fiyatMax: e.target.value})} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400">KONUM (İl, İlçe, Mahalle)</label>
                <input placeholder="Örn: Aydın, Kuşadası, Kadınlar Denizi..." className="w-full p-3 bg-gray-50 rounded-xl mt-1" onChange={e => setIsTalebi({...isTalebi, konum: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400">MUTFAK VE ISITMA</label>
                <select className="w-full p-3 bg-gray-50 rounded-xl mt-1" onChange={e => setIsTalebi({...isTalebi, mutfak: e.target.value})}>
                  <option>Fark Etmez</option><option>Açık Mutfak</option><option>Kapalı Mutfak</option>
                </select>
                <select className="w-full p-3 bg-gray-50 rounded-xl mt-2" onChange={e => setIsTalebi({...isTalebi, isitma: e.target.value})}>
                  <option>Klima</option><option>Doğalgaz</option><option>Yerden Isıtma</option><option>Isı Pompası</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400">MANZARA VE KAT</label>
                <select className="w-full p-3 bg-gray-50 rounded-xl mt-1" onChange={e => setIsTalebi({...isTalebi, manzara: e.target.value})}>
                  <option>Yok</option><option>Deniz</option><option>Doğa</option><option>Şehir</option>
                </select>
                <input placeholder="Kat Tercihi (Örn: 2-5 arası)" className="w-full p-3 bg-gray-50 rounded-xl mt-2" onChange={e => setIsTalebi({...isTalebi, kat: e.target.value})} />
              </div>

              <div className="md:col-span-2 mt-4">
                <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-4 rounded-2xl font-black">TALEBİ MÜŞTERİYE BAĞLA</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusteriYonetimi;

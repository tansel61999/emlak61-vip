import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Search, Phone, MessageSquare, Trash2, UserCheck, PlusCircle, X, Briefcase } from 'lucide-react';

const MusteriYonetimi = () => {
  const [musteriler, setMusteriler] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [formAcik, setFormAcik] = useState(false);
  const [talepFormAcik, setTalepFormAcik] = useState(false);
  const [seciliMusteri, setSeciliMusteri] = useState(null);
  
  const [yeniMusteri, setYeniMusteri] = useState({ ad: "", telefon: "", not: "" });

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

  const whatsappMesaj = (tel) => {
    const temizTel = tel.replace(/\s/g, '');
    window.open(`https://wa.me/90${temizTel}`, '_blank');
  };

  return (
    <div className="space-y-6 p-4">
      {/* Üst Panel */}
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
          <UserPlus size={20} /> Yeni Müşteri
        </button>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musteriler.filter(m => m.ad?.toLowerCase().includes(aramaMetni)).map((m) => (
          <div key={m.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative">
            <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center text-[#0A192F] mb-4">
              <UserCheck size={28} />
            </div>

            <h3 className="text-2xl font-black text-gray-800 mb-1 uppercase leading-tight">{m.ad}</h3>
            <div className="flex items-center gap-2 text-gray-500 font-bold mb-6">
               <Phone size={16} className="text-[#FFD700]"/> 0{m.telefon}
            </div>

            <div className="bg-gray-50 p-5 rounded-3xl mb-6">
              <p className="text-sm text-gray-600 font-medium italic">"{m.not}"</p>
              {m.talepDetay && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
                  <span className="bg-[#0A192F] text-[#FFD700] text-[10px] px-3 py-1 rounded-full font-black uppercase">
                    {m.talepDetay.islemTipi}
                  </span>
                  <span className="bg-gray-200 text-gray-700 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                    {m.talepDetay.kategori}
                  </span>
                </div>
              )}
            </div>

            {/* ANA BUTON: İŞ/TALEP EKLE */}
            <button 
              onClick={() => { setSeciliMusteri(m); setTalepFormAcik(true); }}
              className="w-full bg-[#FFD700] text-[#0A192F] py-4 rounded-2xl font-black text-sm mb-4 flex items-center justify-center gap-2 hover:bg-[#ecc600] transition-colors shadow-lg shadow-yellow-100"
            >
              <Briefcase size={18}/> {m.talepDetay ? "TALEBİ DÜZENLE" : "İŞ / TALEP EKLE"}
            </button>
            
            <div className="flex gap-3">
              <button onClick={() => whatsappMesaj(m.telefon)} className="flex-1 bg-[#25D366] text-white p-4 rounded-2xl flex justify-center hover:opacity-90"><MessageSquare size={22} /></button>
              <button onClick={() => musteriSil(m.id)} className="bg-red-50 text-red-500 p-4 rounded-2xl hover:bg-red-100"><Trash2 size={22} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: MÜŞTERİ EKLE */}
      {formAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-3xl font-black mb-8 text-[#0A192F]">YENİ MÜŞTERİ</h3>
            <form onSubmit={musteriKaydet} className="space-y-5">
              <input required placeholder="Ad Soyad" className="w-full p-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700] font-bold" onChange={e => setYeniMusteri({...yeniMusteri, ad: e.target.value})} />
              <input required placeholder="Telefon" className="w-full p-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#FFD700] font-bold" onChange={e => setYeniMusteri({...yeniMusteri, telefon: e.target.value})} />
              <textarea placeholder="Kısa Not..." className="w-full p-5 bg-gray-50 border-none rounded-2xl h-32 outline-none focus:ring-2 focus:ring-[#FFD700] font-bold" onChange={e => setYeniMusteri({...yeniMusteri, not: e.target.value})} />
              <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-5 rounded-2xl font-black text-lg">KAYDET</button>
              <button type="button" onClick={() => setFormAcik(false)} className="w-full text-gray-400 font-bold py-2 hover:text-red-500 transition-colors">Vazgeç</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TALEP FORMU */}
      {talepFormAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button className="absolute top-6 right-6 text-gray-400 hover:text-black" onClick={() => setTalepFormAcik(false)}><X size={30}/></button>
            <h3 className="text-2xl font-black mb-8 pr-10 uppercase text-[#0A192F]">{seciliMusteri?.ad} <br/><span className="text-[#FFD700]">DETAYLI TALEP FORMU</span></h3>
            
            <form onSubmit={talepKaydet} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Emlak Kategorisi</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#FFD700]" onChange={e => setIsTalebi({...isTalebi, islemTipi: e.target.value})}>
                  <option>Satılık</option><option>Kiralık</option>
                </select>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-[#FFD700]" onChange={e => setIsTalebi({...isTalebi, kategori: e.target.value})}>
                  <option>Daire</option><option>Villa</option><option>Yazlık</option><option>Arsa</option><option>Tarla</option><option>Ticari</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Bütçe Aralığı (TL)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-1/2 p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#FFD700]" onChange={e => setIsTalebi({...isTalebi, fiyatMin: e.target.value})} />
                  <input type="number" placeholder="Max" className="w-1/2 p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#FFD700]" onChange={e => setIsTalebi({...isTalebi, fiyatMax: e.target.value})} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Konum Seçimi (Birden Fazla Yazılabilir)</label>
                <input placeholder="Örn: Kuşadası, Kadınlar Denizi, Davutlar..." className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#FFD700]" onChange={e => setIsTalebi({...isTalebi, konum: e.target.value})} />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Donanım & Isıtma</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" onChange={e => setIsTalebi({...isTalebi, mutfak: e.target.value})}>
                  <option>Mutfak: Fark Etmez</option><option>Açık Mutfak</option><option>Kapalı Mutfak</option>
                </select>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" onChange={e => setIsTalebi({...isTalebi, isitma: e.target.value})}>
                  <option>Klima</option><option>Doğalgaz</option><option>Yerden Isıtma</option><option>Isı Pompası</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 tracking-widest uppercase">Dış Özellikler</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none" onChange={e => setIsTalebi({...isTalebi, manzara: e.target.value})}>
                  <option>Manzara: Yok</option><option>Deniz</option><option>Doğa</option><option>Şehir</option>
                </select>
                <input placeholder="Kat Tercihi (Örn: 2-5 arası)" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#FFD700]" onChange={e => setIsTalebi({...isTalebi, kat: e.target.value})} />
              </div>

              <div className="md:col-span-2 mt-6">
                <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-5 rounded-2xl font-black text-xl hover:scale-[1.02] transition-transform">TALEBİ KAYDET VE BAĞLA</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusteriYonetimi;

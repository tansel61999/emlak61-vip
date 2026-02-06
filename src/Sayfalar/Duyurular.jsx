import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { getAuth } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Bell, Trash2, Megaphone, Calendar, User, Plus, X, Quote, ArrowRight } from 'lucide-react';

const Duyurular = () => {
  const [duyurular, setDuyurular] = useState([]);
  const [yeniDuyuru, setYeniDuyuru] = useState({ baslik: "", icerik: "" });
  const [formAcik, setFormAcik] = useState(false);
  const auth = getAuth();
  const YONETICI_EPOSTA = "tansel6199@gmail.com";

  const isAdmin = auth.currentUser && auth.currentUser.email && auth.currentUser.email.toLowerCase() === YONETICI_EPOSTA.toLowerCase();

  useEffect(() => {
    const q = query(collection(veritabani, "duyurular"), orderBy("tarih", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setDuyurular(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const duyuruEkle = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(veritabani, "duyurular"), {
        baslik: yeniDuyuru.baslik,
        icerik: yeniDuyuru.icerik,
        tarih: serverTimestamp(),
        yayinlayan: auth.currentUser?.displayName || "Yönetici"
      });
      setYeniDuyuru({ baslik: "", icerik: "" });
      setFormAcik(false);
    } catch (h) {
      alert("Duyuru eklenemedi!");
    }
  };

  const duyuruSil = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("Bu duyuruyu silmek istiyor musunuz?")) {
      await deleteDoc(doc(veritabani, "duyurular", id));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Üst Başlık Alanı - Daha Zarif */}
      <div className="flex justify-between items-center mb-12 bg-white/50 p-8 rounded-[40px] border border-white shadow-sm backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-[2px] bg-[#FFD700]"></span>
            <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Kurumsal İletişim</span>
          </div>
          <h2 className="text-3xl font-black text-[#0A192F] tracking-tighter uppercase">Ofis Ajandası</h2>
        </div>
        {isAdmin && (
          <button
            onClick={() => setFormAcik(true)}
            className="bg-[#0A192F] text-[#FFD700] px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95 text-[11px] uppercase tracking-widest"
          >
            <Plus size={16} /> Yeni Yayın
          </button>
        )}
      </div>

      {/* Duyuru Listesi */}
      <div className="grid grid-cols-1 gap-8">
        {duyurular.length === 0 ? (
          <div className="text-center py-24 bg-white/40 rounded-[50px] border-2 border-dashed border-gray-200">
            <Megaphone size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="font-black text-gray-300 uppercase text-[10px] tracking-[0.3em]">Şu an için bir duyuru bulunmuyor</p>
          </div>
        ) : (
          duyurular.map((d) => (
            <div key={d.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex group hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-500 relative">

              {/* Sol Vurgu Şeridi */}
              <div className="w-1.5 bg-gradient-to-b from-[#FFD700] to-amber-600"></div>

              <div className="p-10 flex-1 relative">
                {/* Dekoratif Tırnak İkonu */}
                <Quote className="absolute top-8 right-10 text-gray-50/80 -scale-x-100" size={80} />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <span className="bg-[#0A192F] text-[#FFD700] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">BİLGİLENDİRME</span>
                        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-tighter">
                            <Calendar size={13} className="text-amber-500" />
                            {d.tarih ? d.tarih.toDate().toLocaleDateString('tr-TR') : "..."}
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-[#0A192F] uppercase tracking-tight leading-tight group-hover:text-amber-600 transition-colors">{d.baslik}</h3>
                  </div>

                  {isAdmin && (
                    <button onClick={() => duyuruSil(d.id)} className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="relative z-10 mb-8">
                    <p className="text-gray-500 font-medium leading-relaxed text-[15px] whitespace-pre-wrap max-w-[90%]">
                        {d.icerik}
                    </p>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
                        <div className="w-8 h-8 bg-[#0A192F] rounded-xl flex items-center justify-center text-[#FFD700] text-[10px] font-black shadow-md">
                            {d.yayinlayan?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">YAYINLAYAN</span>
                          <span className="text-[11px] font-black text-[#0A192F] uppercase">{d.yayinlayan}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <span className="text-[10px] font-black uppercase tracking-widest">Detayları Gör</span>
                      <ArrowRight size={16} />
                    </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Duyuru Ekleme Modal - Şık ve Odaklanmış */}
      {formAcik && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[1000] p-4" onClick={() => setFormAcik(false)}>
          <div className="bg-white rounded-[50px] p-12 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-2 bg-[#FFD700]"></div>

            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-[#0A192F] tracking-tighter uppercase">Duyuru Hazırla</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ekibinizi bilgilendirin.</p>
              </div>
              <button onClick={() => setFormAcik(false)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><X size={24}/></button>
            </div>

            <form onSubmit={duyuruEkle} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-[0.2em]">Başlık</label>
                <input
                    required
                    className="w-full p-5 bg-gray-50 rounded-[25px] font-bold outline-none border-2 border-transparent focus:border-[#FFD700] focus:bg-white transition-all text-sm uppercase"
                    placeholder="DUYURU BAŞLIĞINI BURAYA YAZIN"
                    value={yeniDuyuru.baslik}
                    onChange={e => setYeniDuyuru({...yeniDuyuru, baslik: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-[0.2em]">İçerik Detayı</label>
                <textarea
                    required
                    className="w-full p-6 bg-gray-50 rounded-[30px] font-bold outline-none border-2 border-transparent focus:border-[#FFD700] focus:bg-white transition-all text-sm min-h-[180px] leading-relaxed"
                    placeholder="Mesajınızı detaylıca açıklayın..."
                    value={yeniDuyuru.icerik}
                    onChange={e => setYeniDuyuru({...yeniDuyuru, icerik: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-5 rounded-[25px] font-black text-sm uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl active:scale-95 mt-4">
                Yayına Al
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Duyurular;
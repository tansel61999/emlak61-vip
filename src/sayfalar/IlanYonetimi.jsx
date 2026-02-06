import React, { useState, useEffect } from 'react';
import { veritabani, depolama } from '../firebaseYapilandirma';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Search, Image as ImageIcon, Loader2, Edit3, Trash2, MapPin, UserPlus, ShieldCheck, LogOut, LayoutGrid, Briefcase, Plus, Archive, CheckCircle2, AlertCircle } from 'lucide-react';
// YENİ FORM BİLEŞENİNİ IMPORT EDİYORUZ
import GenelForm from './components/GenelForm';

const IlanYonetimi = () => {
  const [gorunum, setGorunum] = useState("OFIS"); 
  const [ilanlar, setIlanlar] = useState([]);
  const [danismanlar, setDanismanlar] = useState([]);
  const [yeniDanismanIsmi, setYeniDanismanIsmi] = useState("");
  const [aramaTerimi, setAramaTerimi] = useState("");
  const [formAcik, setFormAcik] = useState(false);
  const [danismanPanelAcik, setDanismanPanelAcik] = useState(false);
  const [detayIlan, setDetayIlan] = useState(null);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [resimYukleniyor, setResimYukleniyor] = useState(false);
  const [aktifResimIdx, setAktifResimIdx] = useState(0);

  const [kullaniciBilgi, setKullaniciBilgi] = useState(null);
  const [authHazir, setAuthHazir] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const YONETICI_EPOSTA = "tansel6199@gmail.com";

  const auth = getAuth();

  const bosForm = {
    islemTuru: "", baslik: "", fiyat: "", il: "Aydın", ilce: "", mahalle: "",
    emlakTipi: "", konutTipi: "", odaSayisi: "", kat: "", durum: "AKTİF", isitma: "", 
    banyo: "1", siteIci: "Hayır", m2: "", aciklama: "", resimler: [], ada: "", parsel: "",
    ekleyen: "", ekleyenAd: "", ekleyenFoto: ""
  };

  const [yeniIlan, setYeniIlan] = useState(bosForm);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const eposta = user.email.toLowerCase();
        const varsayilanAd = user.displayName || eposta.split('@')[0].toUpperCase();
        if (eposta === YONETICI_EPOSTA.toLowerCase()) {
          setIsAdmin(true);
          setKullaniciBilgi({ eposta, ad: varsayilanAd, foto: user.photoURL });
        } else {
          const dRef = collection(veritabani, "danismanlar");
          const q = query(dRef, where("isim", "==", eposta));
          const dSnap = await getDocs(q);
          if (!dSnap.empty) {
            setIsAdmin(false);
            setKullaniciBilgi({ eposta, ad: varsayilanAd, foto: user.photoURL });
          } else {
            await signOut(auth);
            setKullaniciBilgi(null);
            alert("Yetkili danışman listesinde değilsiniz.");
          }
        }
      } else {
        setKullaniciBilgi(null);
        setIsAdmin(false);
      }
      setAuthHazir(true);
    });

    const qIlanlar = query(collection(veritabani, "ilanlar"));
    const unsubIlanlar = onSnapshot(qIlanlar, (snap) => {
      const veriler = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setIlanlar(veriler.sort((a, b) => (b.tarih?.seconds || 0) - (a.tarih?.seconds || 0)));
      setYukleniyor(false);
    });

    const qDanismanlar = query(collection(veritabani, "danismanlar"), orderBy("isim", "asc"));
    const unsubDanismanlar = onSnapshot(qDanismanlar, (snap) => {
      setDanismanlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubAuth(); unsubIlanlar(); unsubDanismanlar(); };
  }, []);

  const googleIleGiris = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } catch (e) { alert("Giriş Hatası!"); }
  };

  const guvenliCikis = async () => {
    try { await signOut(auth); window.location.reload(); } catch (e) { console.error(e); }
  };

  const formatPara = (d) => {
    if (!d) return "0";
    const deger = d.toString().replace(/\D/g, "");
    return new Intl.NumberFormat('tr-TR').format(deger);
  };

  const ilanKaydet = async (e) => {
    e.preventDefault();
    try {
      const kaydedilecekVeri = {
        ...yeniIlan,
        fiyat: yeniIlan.fiyat.toString().replace(/\D/g, ""),
        ekleyen: isAdmin ? (yeniIlan.ekleyen || kullaniciBilgi.eposta) : kullaniciBilgi.eposta,
        ekleyenAd: isAdmin ? (yeniIlan.ekleyenAd || kullaniciBilgi.ad) : kullaniciBilgi.ad,
        ekleyenFoto: isAdmin ? (yeniIlan.ekleyenFoto || kullaniciBilgi.foto) : kullaniciBilgi.foto
      };

      if (duzenlenenId) {
        await updateDoc(doc(veritabani, "ilanlar", duzenlenenId), { ...kaydedilecekVeri, guncellemeTarihi: serverTimestamp() });
      } else {
        await addDoc(collection(veritabani, "ilanlar"), { ...kaydedilecekVeri, tarih: serverTimestamp() });
      }
      formuKapat();
    } catch (h) { alert("Kaydetme hatası!"); }
  };

  const durumuGuncelle = async (id, yeniDurum) => {
    try { await updateDoc(doc(veritabani, "ilanlar", id), { durum: yeniDurum }); } catch (e) { alert("Durum güncellenemedi!"); }
  };

  const formuKapat = () => {
    setFormAcik(false);
    setDuzenlenenId(null);
    setYeniIlan(bosForm);
  };

  const ilanSil = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("Bu ilanı tamamen silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(veritabani, "ilanlar", id));
      setDetayIlan(null);
    }
  };

  const danismanEkle = async () => {
    if (!isAdmin || !yeniDanismanIsmi.trim()) return;
    try {
      await addDoc(collection(veritabani, "danismanlar"), { isim: yeniDanismanIsmi.toLowerCase().trim() });
      setYeniDanismanIsmi("");
    } catch (h) { alert("Hata!"); }
  };

  const danismanSil = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("Silinsin mi?")) { await deleteDoc(doc(veritabani, "danismanlar", id)); }
  };

  const tarihFormatla = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filtrelenmisIlanlar = ilanlar.filter(i => {
    const baslik = i.baslik || "";
    const ekleyenAd = i.ekleyenAd || "";
    const aramaUygun = baslik.toLowerCase().includes(aramaTerimi.toLowerCase()) ||
                       ekleyenAd.toLowerCase().includes(aramaTerimi.toLowerCase());
    
    if (gorunum === "ARSIV") return aramaUygun && (i.durum === "SATILDI" || i.durum === "PASİF");
    if (gorunum === "ILANLARIM") return aramaUygun && i.ekleyen === kullaniciBilgi?.eposta && i.durum !== "SATILDI" && i.durum !== "PASİF";
    return aramaUygun && (i.durum === "AKTİF" || !i.durum);
  });

  if (!authHazir) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#0A192F]" size={40} /></div>;

  if (!kullaniciBilgi) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center z-[9999] p-4">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border text-center max-w-sm w-full">
          <h2 className="text-3xl font-black text-[#0A192F] mb-2 uppercase">EMLAK61</h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase mb-8">Yönetim Paneli Girişi</p>
          <button onClick={googleIleGiris} className="w-full bg-[#0A192F] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-105 transition-all">
            <ShieldCheck size={20} /> GOOGLE İLE GİRİŞ YAP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6EAEF] p-4 pb-20 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Üst Header Kısmı */}
        <div className="flex flex-col gap-4 bg-white p-6 rounded-[32px] shadow-sm border">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A192F] flex items-center justify-center text-white font-black text-sm">{kullaniciBilgi?.ad?.charAt(0)}</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">HOŞ GELDİN</span>
                  <span className="text-xs font-black text-[#0A192F] uppercase">{kullaniciBilgi?.ad}</span>
                </div>
             </div>
             <div className="flex items-center gap-2">
                {isAdmin && (
                  <button onClick={() => setDanismanPanelAcik(true)} className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <UserPlus size={20} />
                  </button>
                )}
                <button onClick={guvenliCikis} className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-3 rounded-2xl font-black text-[10px] hover:bg-red-600 hover:text-white transition-all uppercase shadow-sm">
                  <LogOut size={16} /> ÇIKIŞ
                </button>
             </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-[#0A192F]">EMLAK61</h2>
                {isAdmin && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-black">YÖNETİCİ</span>}
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 overflow-x-auto w-full md:w-auto">
              <button onClick={() => setGorunum("OFIS")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${gorunum === "OFIS" ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}><LayoutGrid size={14} /> OFİS İLANLARI</button>
              <button onClick={() => setGorunum("ILANLARIM")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${gorunum === "ILANLARIM" ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}><Briefcase size={14} /> İLANLARIM</button>
              <button onClick={() => setGorunum("ARSIV")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${gorunum === "ARSIV" ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}><Archive size={14} /> ARŞİV</button>
            </div>

            <button onClick={() => setFormAcik(true)} className="w-full md:w-auto bg-[#0A192F] text-[#FFD700] px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-black transition-all uppercase text-xs flex items-center justify-center gap-2">
              <Plus size={16}/> YENİ İLAN
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="İlan başlığı veya danışman ismi ile ara..." className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all font-bold text-sm" onChange={(e) => setAramaTerimi(e.target.value)} />
          </div>
        </div>

        {/* İlan Listeleme Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {yukleniyor ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-[#0A192F]" size={48} />
              <span className="font-black text-[#0A192F] text-xs uppercase tracking-widest">Veriler Yükleniyor...</span>
            </div>
          ) : filtrelenmisIlanlar.length === 0 ? (
            <div className="col-span-full py-24 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-[40px] border-2 border-dashed border-gray-200">Gösterilecek ilan bulunamadı</div>
          ) : (
            filtrelenmisIlanlar.map((i) => (
              <div key={i.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all relative flex flex-col group">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    {(isAdmin || i.ekleyen === kullaniciBilgi?.eposta) && (
                      <>
                        <button onClick={() => { setDuzenlenenId(i.id); setYeniIlan(i); setFormAcik(true); }} className="p-2.5 bg-white/90 backdrop-blur text-blue-600 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button>
                        <button onClick={() => ilanSil(i.id)} className="p-2.5 bg-white/90 backdrop-blur text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                      </>
                    )}
                </div>
                <div className="h-60 cursor-pointer relative overflow-hidden" onClick={() => { setDetayIlan(i); setAktifResimIdx(0); }}>
                   {i.resimler?.[0] ? <img src={i.resimler[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" /> : <div className="h-full bg-gray-50 flex items-center justify-center text-gray-300 font-bold uppercase">Resim Yok</div>}
                   <div className="absolute top-4 left-4 bg-[#0A192F] text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase shadow-lg border border-white/20">{i.emlakTipi}</div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-2xl font-black text-[#0A192F] mb-1">{formatPara(i.fiyat)} ₺</div>
                  <h3 className="font-bold text-gray-700 uppercase line-clamp-1 mb-3 text-sm">{i.baslik}</h3>
                  <div className="flex items-start gap-2 mb-6 text-gray-500">
                    <MapPin size={14} className="mt-0.5 text-blue-500 shrink-0" />
                    <span className="text-[10px] font-bold uppercase">{i.ilce} / {i.mahalle}</span>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 mb-6">
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 pr-4 rounded-2xl">
                      <div className="w-8 h-8 bg-[#0A192F] rounded-full flex items-center justify-center text-white text-[10px] font-black">{i.ekleyenAd?.charAt(0)}</div>
                      <span className="text-[10px] font-black text-[#0A192F] uppercase">{i.ekleyenAd || "Sistem"}</span>
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase">{tarihFormatla(i.tarih)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => durumuGuncelle(i.id, i.durum === "SATILDI" ? "AKTİF" : "SATILDI")} className={`flex-1 py-3 rounded-xl font-black text-[9px] ${i.durum === "SATILDI" ? "bg-green-600 text-white" : "bg-green-50 text-green-700"}`}>SATILDI</button>
                    <button onClick={() => durumuGuncelle(i.id, i.durum === "PASİF" ? "AKTİF" : "PASİF")} className={`flex-1 py-3 rounded-xl font-black text-[9px] ${i.durum === "PASİF" ? "bg-red-600 text-white" : "bg-red-50 text-red-700"}`}>PASİF</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* YENİ MODÜLER FORMUMUZU ÇAĞIRIYORUZ */}
      {formAcik && (
        <GenelForm 
          tip="ilan"
          baslik={duzenlenenId ? "İlanı Güncelle" : "Yeni İlan Ekle"}
          veri={yeniIlan}
          setVeri={setYeniIlan}
          kapat={formuKapat}
          kaydet={ilanKaydet}
        />
      )}

      {/* Detay ve Danışman Modalları (Aynı Kaldı) */}
      {danismanPanelAcik && isAdmin && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[900] p-4">
            <div className="bg-white rounded-[40px] w-full max-w-md p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-[#0A192F]">DANIŞMANLAR</h3>
                    <button onClick={() => setDanismanPanelAcik(false)}><X size={24}/></button>
                </div>
                <div className="flex gap-2 mb-6">
                    <input type="text" className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder="E-POSTA" value={yeniDanismanIsmi} onChange={e => setYeniDanismanIsmi(e.target.value)} />
                    <button onClick={danismanEkle} className="bg-[#0A192F] text-white px-5 rounded-2xl"><Plus/></button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {danismanlar.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                            <span className="font-bold text-xs uppercase">{d.isim}</span>
                            <button onClick={() => danismanSil(d.id)} className="text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {detayIlan && (
        <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-xl flex items-center justify-center z-[1000] p-4" onClick={() => setDetayIlan(null)}>
            <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="md:w-2/3 bg-black relative flex items-center justify-center min-h-[300px]">
                    <button onClick={() => setDetayIlan(null)} className="absolute top-6 left-6 z-50 bg-white/20 text-white p-3 rounded-full"><X size={24}/></button>
                    {detayIlan.resimler?.[aktifResimIdx] && <img src={detayIlan.resimler[aktifResimIdx]} className="w-full h-full object-contain" alt="" />}
                </div>
                <div className="md:w-1/3 p-10 overflow-y-auto bg-white">
                    <h2 className="text-4xl font-black text-[#0A192F] mb-2">{formatPara(detayIlan.fiyat)} ₺</h2>
                    <h3 className="text-lg font-bold text-gray-700 uppercase mb-8">{detayIlan.baslik}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-10 text-xs font-black">
                        <div className="bg-gray-50 p-4 rounded-2xl uppercase">Ada/Parsel: {detayIlan.ada || "-"}/{detayIlan.parsel || "-"}</div>
                        <div className="bg-gray-50 p-4 rounded-2xl uppercase">Konum: {detayIlan.ilce}</div>
                    </div>
                    <p className="text-sm text-gray-600 font-bold whitespace-pre-wrap uppercase">{detayIlan.aciklama}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default IlanYonetimi;

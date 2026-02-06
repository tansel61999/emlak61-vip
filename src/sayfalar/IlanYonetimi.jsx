import React, { useState, useEffect } from 'react';
import { veritabani, depolama } from '../firebaseYapilandirma';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Search, Image as ImageIcon, Loader2, Edit3, Trash2, MapPin, UserPlus, ShieldCheck, LogOut, LayoutGrid, Briefcase, Plus, Archive, CheckCircle2, AlertCircle } from 'lucide-react';

const IlanYonetimi = () => {
  const [gorunum, setGorunum] = useState("OFIS"); // OFIS, ILANLARIM, ARSIV
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
    try {
      await signOut(auth);
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  const formatPara = (d) => {
    if (!d) return "0";
    const deger = d.toString().replace(/\D/g, "");
    return new Intl.NumberFormat('tr-TR').format(deger);
  };

  const resimleriYukle = async (dosyalar) => {
    setResimYukleniyor(true);
    const yuklenenURLler = [];
    try {
      for (let i = 0; i < dosyalar.length; i++) {
        const depoRef = ref(depolama, `ilanlar/${Date.now()}-${dosyalar[i].name}`);
        const sonuc = await uploadBytes(depoRef, dosyalar[i]);
        const url = await getDownloadURL(sonuc.ref);
        yuklenenURLler.push(url);
      }
      setYeniIlan(prev => ({ ...prev, resimler: [...(prev.resimler || []), ...yuklenenURLler] }));
    } catch (h) { alert("Resim yükleme hatası!"); }
    setResimYukleniyor(false);
  };

  const ilanKaydet = async (e) => {
    e.preventDefault();
    try {
      const kaydedilecekVeri = {
        ...yeniIlan,
        fiyat: yeniIlan.fiyat.toString().replace(/\D/g, ""),
        durum: yeniIlan.durum || "AKTİF",
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
    try {
      await updateDoc(doc(veritabani, "ilanlar", id), { durum: yeniDurum });
    } catch (e) { alert("Durum güncellenemedi!"); }
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
    if (window.confirm("Silinsin mi?")) {
      await deleteDoc(doc(veritabani, "danismanlar", id));
    }
  };

  const tarihFormatla = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const bosForm = {
    islemTuru: "", baslik: "", fiyat: "", il: "Aydın", ilce: "", mahalle: "",
    emlakTipi: "", oda: "", kat: "", durum: "AKTİF", isinma: "", binaYasi: "",
    cephe: "", kredi: "", aciklama: "", resimler: [], ada: "", parsel: "",
    ekleyen: "", ekleyenAd: "", ekleyenFoto: ""
  };

  const [yeniIlan, setYeniIlan] = useState(bosForm);

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
        <div className="flex flex-col gap-4 bg-white p-6 rounded-[32px] shadow-sm border">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A192F] flex items-center justify-center text-white font-black text-sm">
                  {kullaniciBilgi?.ad?.charAt(0)}
                </div>
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
              <button onClick={() => setGorunum("OFIS")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${gorunum === "OFIS" ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                <LayoutGrid size={14} /> OFİS İLANLARI
              </button>
              <button onClick={() => setGorunum("ILANLARIM")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${gorunum === "ILANLARIM" ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                <Briefcase size={14} /> İLANLARIM
              </button>
              <button onClick={() => setGorunum("ARSIV")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${gorunum === "ARSIV" ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
                <Archive size={14} /> ARŞİV
              </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {yukleniyor ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-[#0A192F]" size={48} />
              <span className="font-black text-[#0A192F] text-xs uppercase tracking-widest">Veriler Yükleniyor...</span>
            </div>
          ) : filtrelenmisIlanlar.length === 0 ? (
            <div className="col-span-full py-24 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-[40px] border-2 border-dashed border-gray-200">
              Gösterilecek ilan bulunamadı
            </div>
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
                   <div className="absolute top-4 left-4 bg-[#0A192F] text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase shadow-lg border border-white/20">{i.islemTuru}</div>
                   {i.durum && i.durum !== "AKTİF" && (
                     <div className={`absolute bottom-4 right-4 px-4 py-1.5 rounded-full font-black text-[9px] uppercase shadow-lg ${i.durum === "SATILDI" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                       {i.durum}
                     </div>
                   )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-2xl font-black text-[#0A192F] mb-1">{formatPara(i.fiyat)} ₺</div>
                  <h3 className="font-bold text-gray-700 uppercase line-clamp-1 mb-3 text-sm">{i.baslik}</h3>
                  
                  <div className="flex items-start gap-2 mb-6 text-gray-500">
                    <MapPin size={14} className="mt-0.5 text-blue-500 shrink-0" />
                    <span className="text-[10px] font-bold uppercase">{i.ilce} / {i.mahalle}</span>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 mb-6">
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 pr-4 rounded-2xl border border-gray-100">
                      <div className="w-8 h-8 bg-[#0A192F] rounded-full flex items-center justify-center text-white text-[10px] font-black uppercase shadow-sm">{i.ekleyenAd?.charAt(0) || "E"}</div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest leading-none mb-0.5">DANIŞMAN</span>
                        <span className="text-[10px] font-black text-[#0A192F] uppercase truncate max-w-[90px]">{i.ekleyenAd || "Sistem"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-gray-400 uppercase">{tarihFormatla(i.tarih)}</div>
                    </div>
                  </div>

                  {/* ARŞİVLEME BUTONLARI */}
                  {(isAdmin || i.ekleyen === kullaniciBilgi?.eposta) && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => durumuGuncelle(i.id, i.durum === "SATILDI" ? "AKTİF" : "SATILDI")} 
                        className={`flex-1 py-3 rounded-xl font-black text-[9px] flex items-center justify-center gap-1.5 transition-all ${i.durum === "SATILDI" ? "bg-green-600 text-white shadow-md" : "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white"}`}
                      >
                        <CheckCircle2 size={12} /> {i.durum === "SATILDI" ? "AKTİFE AL" : "SATILDI"}
                      </button>
                      <button 
                        onClick={() => durumuGuncelle(i.id, i.durum === "PASİF" ? "AKTİF" : "PASİF")} 
                        className={`flex-1 py-3 rounded-xl font-black text-[9px] flex items-center justify-center gap-1.5 transition-all ${i.durum === "PASİF" ? "bg-red-600 text-white shadow-md" : "bg-red-50 text-red-700 hover:bg-red-600 hover:text-white"}`}
                      >
                        <AlertCircle size={12} /> {i.durum === "PASİF" ? "AKTİFE AL" : "PASİF"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALLAR */}
      {danismanPanelAcik && isAdmin && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[900] p-4" onClick={() => setDanismanPanelAcik(false)}>
            <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-[#0A192F] uppercase">DANIŞMANLAR</h3>
                    <button onClick={() => setDanismanPanelAcik(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
                </div>
                <div className="flex gap-2 mb-6">
                    <input type="text" className="flex-1 p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none uppercase text-sm" placeholder="E-POSTA ADRESİ" value={yeniDanismanIsmi} onChange={e => setYeniDanismanIsmi(e.target.value.toLowerCase())} />
                    <button onClick={danismanEkle} className="bg-[#0A192F] text-white px-5 rounded-2xl hover:bg-black transition-all shadow-lg"><Plus size={20}/></button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {danismanlar.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                            <span className="font-bold text-[#0A192F] text-xs uppercase">{d.isim}</span>
                            <button onClick={() => danismanSil(d.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {formAcik && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[700] p-4" onClick={formuKapat}>
          <div className="bg-white rounded-[40px] p-8 w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 border-b pb-6">
              <h3 className="text-2xl font-black text-[#0A192F] uppercase">{duzenlenenId ? "İLAN GÜNCELLE" : "YENİ İLAN KAYDI"}</h3>
              <button onClick={formuKapat} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={32} /></button>
            </div>
            <form onSubmit={ilanKaydet} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4 border-2 border-dashed border-gray-200 p-10 rounded-[32px] text-center bg-gray-50 relative group hover:border-blue-400 transition-all">
                  <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => resimleriYukle(e.target.files)} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <ImageIcon className="text-blue-500" size={28} />
                    </div>
                    <p className="font-black text-gray-400 text-[10px] uppercase tracking-widest">FOTOĞRAFLARI BURAYA SÜRÜKLE VEYA TIKLA</p>
                  </div>
                  <div className="flex gap-3 mt-6 flex-wrap justify-center relative z-20">
                    {yeniIlan.resimler?.map((u, idx) => (
                      <div key={idx} className="relative group/img">
                        <img src={u} className="w-24 h-24 object-cover rounded-2xl border-4 border-white shadow-lg" alt="" />
                        <button type="button" onClick={() => setYeniIlan({...yeniIlan, resimler: yeniIlan.resimler.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl scale-0 group-hover/img:scale-100 transition-transform"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <input type="text" placeholder="İLAN BAŞLIĞI" required className="md:col-span-3 p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 outline-none uppercase text-sm" value={yeniIlan.baslik} onChange={e => setYeniIlan({...yeniIlan, baslik: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="FİYAT" required className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 outline-none uppercase text-sm" value={yeniIlan.fiyat} onChange={e => setYeniIlan({...yeniIlan, fiyat: formatPara(e.target.value)})} />
                <select required className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none text-sm cursor-pointer focus:border-blue-500" value={yeniIlan.islemTuru} onChange={e => setYeniIlan({...yeniIlan, islemTuru: e.target.value})}>
                  <option value="">İŞLEM TÜRÜ SEÇ</option>
                  <option value="SATILIK">SATILIK</option>
                  <option value="KİRALIK">KİRALIK</option>
                </select>
                <select required className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none text-sm cursor-pointer focus:border-blue-500" value={yeniIlan.emlakTipi} onChange={e => setYeniIlan({...yeniIlan, emlakTipi: e.target.value})}>
                  <option value="">EMLAK TİPİ SEÇ</option>
                  <option value="DAİRE">DAİRE</option>
                  <option value="VİLLA">VİLLA</option>
                  <option value="ARSA">ARSA</option>
                  <option value="DÜKKAN">DÜKKAN</option>
                  <option value="BİNA">BİNA</option>
                </select>
                <input type="text" placeholder="ODA SAYISI (ÖRN: 3+1)" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.oda} onChange={e => setYeniIlan({...yeniIlan, oda: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="BULUNDUĞU KAT" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.kat} onChange={e => setYeniIlan({...yeniIlan, kat: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="İLÇE" required className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.ilce} onChange={e => setYeniIlan({...yeniIlan, ilce: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="MAHALLE" required className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.mahalle} onChange={e => setYeniIlan({...yeniIlan, mahalle: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="ADA" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.ada} onChange={e => setYeniIlan({...yeniIlan, ada: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="PARSEL" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.parsel} onChange={e => setYeniIlan({...yeniIlan, parsel: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="ISINMA TİPİ" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.isinma} onChange={e => setYeniIlan({...yeniIlan, isinma: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="BİNA YAŞI" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.binaYasi} onChange={e => setYeniIlan({...yeniIlan, binaYasi: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="CEPHE" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.cephe} onChange={e => setYeniIlan({...yeniIlan, cephe: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="KREDİ DURUMU" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.kredi} onChange={e => setYeniIlan({...yeniIlan, kredi: e.target.value.toUpperCase()})} />
                <textarea placeholder="İLAN DETAYLI AÇIKLAMASI..." required className="md:col-span-4 p-5 bg-gray-50 border-2 border-transparent rounded-[32px] font-bold min-h-[180px] outline-none uppercase text-sm focus:border-blue-500" value={yeniIlan.aciklama} onChange={e => setYeniIlan({...yeniIlan, aciklama: e.target.value.toUpperCase()})} />
                <button type="submit" disabled={resimYukleniyor} className="md:col-span-4 bg-[#0A192F] text-[#FFD700] py-6 rounded-[32px] font-black text-xl shadow-2xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] hover:bg-black transition-all">
                  {resimYukleniyor ? "FOTOĞRAFLAR YÜKLENİYOR..." : duzenlenenId ? "İLAN GÜNCELLE" : "İLAN YAYINLA"}
                </button>
            </form>
          </div>
        </div>
      )}

      {detayIlan && (
        <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-xl flex items-center justify-center z-[1000] p-4" onClick={() => setDetayIlan(null)}>
            <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="md:w-2/3 bg-black relative flex items-center justify-center min-h-[300px]">
                    <button onClick={() => setDetayIlan(null)} className="absolute top-6 left-6 z-50 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all"><X size={24}/></button>
                    {detayIlan.resimler?.[aktifResimIdx] && <img src={detayIlan.resimler[aktifResimIdx]} className="w-full h-full object-contain" alt="" />}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto max-w-[90%] p-3 bg-black/40 backdrop-blur rounded-[24px]">
                        {detayIlan.resimler?.map((r, idx) => (
                            <img key={idx} src={r} onClick={() => setAktifResimIdx(idx)} className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition-all shrink-0 ${aktifResimIdx === idx ? "border-amber-500 scale-110 shadow-lg" : "border-transparent opacity-60"}`} alt="" />
                        ))}
                    </div>
                </div>
                <div className="md:w-1/3 p-10 overflow-y-auto bg-white flex flex-col">
                    <div className="mb-8">
                        <span className="bg-[#0A192F] text-white text-[10px] px-5 py-2 rounded-full font-black uppercase mb-4 inline-block tracking-widest">{detayIlan.islemTuru}</span>
                        <h2 className="text-4xl font-black text-[#0A192F] mb-2">{formatPara(detayIlan.fiyat)} ₺</h2>
                        <h3 className="text-lg font-bold text-gray-700 uppercase leading-tight tracking-tight">{detayIlan.baslik}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><span className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-tighter">KONUM</span><span className="text-[11px] font-black text-[#0A192F] uppercase">{detayIlan.ilce}/{detayIlan.mahalle}</span></div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><span className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-tighter">EMLAK TİPİ</span><span className="text-[11px] font-black text-[#0A192F] uppercase">{detayIlan.emlakTipi}</span></div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><span className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-tighter">ODA</span><span className="text-[11px] font-black text-[#0A192F] uppercase">{detayIlan.oda || "-"}</span></div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><span className="text-[9px] font-black text-gray-400 block mb-1 uppercase tracking-tighter">ADA/PARSEL</span><span className="text-[11px] font-black text-[#0A192F] uppercase">{detayIlan.ada || "-"}/{detayIlan.parsel || "-"}</span></div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-[#0A192F] mb-4 uppercase text-xs border-b border-gray-100 pb-3 tracking-widest">İLAN DETAYI</h4>
                        <p className="text-sm text-gray-600 font-bold whitespace-pre-wrap leading-relaxed uppercase tracking-tight">{detayIlan.aciklama}</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default IlanYonetimi;

import React, { useState, useEffect } from 'react';
import { veritabani, depolama } from '../firebaseYapilandirma';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Search, Image as ImageIcon, Loader2, Edit3, Trash2, MapPin, UserPlus, ShieldCheck, LogOut, LayoutGrid, Briefcase, Plus } from 'lucide-react';

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

  const formuKapat = () => {
    setFormAcik(false);
    setDuzenlenenId(null);
    setYeniIlan(bosForm);
  };

  const ilanSil = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("Bu ilanı silmek üzeresiniz?")) {
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
    return gorunum === "ILANLARIM" ? (aramaUygun && i.ekleyen === kullaniciBilgi?.eposta) : aramaUygun;
  });

  if (!authHazir) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#0A192F]" size={40} /></div>;

  // GİRİŞ YAPILMAMIŞSA SADECE GİRİŞ KUTUSU GÖRÜNSÜN
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

  // GİRİŞ YAPILMIŞSA TÜM PANEL GÖRÜNSÜN
  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col gap-6 bg-white p-6 rounded-[32px] shadow-sm border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
              <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-[#0A192F]">EMLAK61</h2>
                  {isAdmin && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-black">YÖNETİCİ</span>}
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">{kullaniciBilgi?.ad}</span>
          </div>
          <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
            <button onClick={() => setGorunum("OFIS")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] transition-all ${gorunum === "OFIS" ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
              <LayoutGrid size={16} /> OFİS İLANLARI
            </button>
            <button onClick={() => setGorunum("ILANLARIM")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] transition-all ${gorunum === "ILANLARIM" ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>
              <Briefcase size={16} /> İLANLARIM
            </button>
          </div>
          <div className="flex items-center gap-3">
              <button onClick={() => setFormAcik(true)} className="bg-[#0A192F] text-[#FFD700] px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-black transition-all uppercase text-xs flex items-center gap-2">
                <Plus size={16}/> YENİ İLAN
              </button>

          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Ara..." className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-amber-500 focus:bg-white transition-all font-bold text-sm" onChange={(e) => setAramaTerimi(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {yukleniyor ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></div>
        ) : filtrelenmisIlanlar.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-[40px] border">İlan bulunamadı</div>
        ) : (
          filtrelenmisIlanlar.map((i) => (
            <div key={i.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all relative flex flex-col group">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                  {(isAdmin || i.ekleyen === kullaniciBilgi?.eposta) && (
                    <>
                      <button onClick={() => { setDuzenlenenId(i.id); setYeniIlan(i); setFormAcik(true); }} className="p-2 bg-white/90 backdrop-blur text-blue-600 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => ilanSil(i.id)} className="p-2 bg-white/90 backdrop-blur text-red-600 rounded-xl shadow-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                    </>
                  )}
              </div>
              <div className="h-56 cursor-pointer relative overflow-hidden" onClick={() => { setDetayIlan(i); setAktifResimIdx(0); }}>
                 {i.resimler?.[0] ? <img src={i.resimler[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" /> : <div className="h-full bg-gray-50 flex items-center justify-center text-gray-300 font-bold uppercase">Resim Yok</div>}
                 <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase shadow-lg">{i.islemTuru}</div>
              </div>
              <div className="p-6 flex-1 flex flex-col text-sm">
                <div className="text-2xl font-black text-[#0A192F] mb-1">{formatPara(i.fiyat)} ₺</div>
                <h3 className="font-bold text-gray-700 uppercase line-clamp-1 mb-3">{i.baslik}</h3>
                <div className="flex items-start gap-2 mb-4 text-gray-500">
                  <MapPin size={14} className="mt-0.5 text-blue-500 shrink-0" />
                  <span className="text-[11px] font-bold uppercase">{i.ilce} / {i.mahalle}</span>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 mb-4">
                  <div className="flex items-center gap-2 bg-blue-50/50 p-1.5 pr-3 rounded-2xl border border-blue-50">
                    <div className="w-9 h-9 bg-[#0A192F] rounded-full flex items-center justify-center text-white text-[10px] font-black">{i.ekleyenAd?.charAt(0) || "E"}</div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none mb-0.5">SORUMLU</span>
                      <span className="text-[10px] font-black text-[#0A192F] uppercase tracking-tighter truncate max-w-[80px]">{i.ekleyenAd || "Sistem"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{tarihFormatla(i.tarih)}</div>
                    <span className={`text-[8px] font-black uppercase ${i.durum === "SATILDI" ? "text-green-600" : i.durum === "PASİF" ? "text-red-600" : "text-amber-500"}`}>{i.durum || "AKTİF"}</span>
                  </div>
                </div>
                {(isAdmin || i.ekleyen === kullaniciBilgi?.eposta) && (
                  <div className="flex gap-2">
                    <button onClick={() => updateDoc(doc(veritabani, "ilanlar", i.id), { durum: "SATILDI" })} className={`flex-1 py-3 rounded-xl font-black text-[9px] transition-all ${i.durum === "SATILDI" ? "bg-green-600 text-white shadow-md" : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"}`}>SATILDI</button>
                    <button onClick={() => updateDoc(doc(veritabani, "ilanlar", i.id), { durum: "PASİF" })} className={`flex-1 py-3 rounded-xl font-black text-[9px] transition-all ${i.durum === "PASİF" ? "bg-red-600 text-white shadow-md" : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"}`}>PASİF</button>
                    <button onClick={() => updateDoc(doc(veritabani, "ilanlar", i.id), { durum: "AKTİF" })} className={`flex-1 py-3 rounded-xl font-black text-[9px] transition-all ${i.durum === "AKTİF" || !i.durum ? "bg-amber-500 text-white shadow-md" : "bg-gray-100 text-gray-400 hover:bg-amber-500 hover:text-white"}`}>AKTİF</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {danismanPanelAcik && isAdmin && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[900] p-4" onClick={() => setDanismanPanelAcik(false)}>
            <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-[#0A192F]">DANIŞMANLAR</h3>
                    <button onClick={() => setDanismanPanelAcik(false)}><X size={24}/></button>
                </div>
                <div className="flex gap-2 mb-6">
                    <input type="text" className="flex-1 p-3 bg-gray-50 border rounded-xl font-bold uppercase" placeholder="E-POSTA" value={yeniDanismanIsmi} onChange={e => setYeniDanismanIsmi(e.target.value.toLowerCase())} />
                    <button onClick={danismanEkle} className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-all"><Plus size={20}/></button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {danismanlar.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border">
                            <span className="font-bold text-[#0A192F] text-sm uppercase">{d.isim}</span>
                            <button onClick={() => danismanSil(d.id)} className="text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {formAcik && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[700] p-4" onClick={formuKapat}>
          <div className="bg-white rounded-[40px] p-8 w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h3 className="text-2xl font-black text-[#0A192F] uppercase">{duzenlenenId ? "GÜNCELLE" : "YENİ KAYIT"}</h3>
              <button onClick={formuKapat}><X size={32} /></button>
            </div>
            <form onSubmit={ilanKaydet} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4 border-2 border-dashed p-8 rounded-[32px] text-center bg-gray-50 relative">
                  <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => resimleriYukle(e.target.files)} />
                  <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="font-black text-gray-400 text-xs uppercase text-center">FOTOĞRAF EKLE</p>
                  <div className="flex gap-2 mt-4 flex-wrap justify-center relative z-20">
                    {yeniIlan.resimler?.map((u, idx) => (
                      <div key={idx} className="relative group">
                        <img src={u} className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-md" alt="" />
                        <button type="button" onClick={() => setYeniIlan({...yeniIlan, resimler: yeniIlan.resimler.filter((_, i) => i !== idx)})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <input type="text" placeholder="İLAN BAŞLIĞI" required className="md:col-span-3 p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 outline-none uppercase" value={yeniIlan.baslik} onChange={e => setYeniIlan({...yeniIlan, baslik: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="FİYAT" required className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 outline-none uppercase" value={yeniIlan.fiyat} onChange={e => setYeniIlan({...yeniIlan, fiyat: formatPara(e.target.value)})} />
                <select className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none" value={yeniIlan.islemTuru} onChange={e => setYeniIlan({...yeniIlan, islemTuru: e.target.value})}>
                  <option value="">İŞLEM TÜRÜ</option>
                  <option value="SATILIK">SATILIK</option>
                  <option value="KİRALIK">KİRALIK</option>
                </select>
                <select className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none" value={yeniIlan.emlakTipi} onChange={e => setYeniIlan({...yeniIlan, emlakTipi: e.target.value})}>
                  <option value="">EMLAK TİPİ</option>
                  <option value="DAİRE">DAİRE</option>
                  <option value="VİLLA">VİLLA</option>
                  <option value="ARSA">ARSA</option>
                  <option value="DÜKKAN">DÜKKAN</option>
                  <option value="BİNA">BİNA</option>
                </select>
                <input type="text" placeholder="ODA SAYISI" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.oda} onChange={e => setYeniIlan({...yeniIlan, oda: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="KAT" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.kat} onChange={e => setYeniIlan({...yeniIlan, kat: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="İLÇE" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.ilce} onChange={e => setYeniIlan({...yeniIlan, ilce: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="MAHALLE" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.mahalle} onChange={e => setYeniIlan({...yeniIlan, mahalle: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="ADA" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.ada} onChange={e => setYeniIlan({...yeniIlan, ada: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="PARSEL" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.parsel} onChange={e => setYeniIlan({...yeniIlan, parsel: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="ISINMA" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.isinma} onChange={e => setYeniIlan({...yeniIlan, isinma: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="BİNA YAŞI" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.binaYasi} onChange={e => setYeniIlan({...yeniIlan, binaYasi: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="CEPHE" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.cephe} onChange={e => setYeniIlan({...yeniIlan, cephe: e.target.value.toUpperCase()})} />
                <input type="text" placeholder="KREDİ" className="p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold outline-none uppercase" value={yeniIlan.kredi} onChange={e => setYeniIlan({...yeniIlan, kredi: e.target.value.toUpperCase()})} />
                <textarea placeholder="DETAYLI AÇIKLAMA" className="md:col-span-4 p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold min-h-[150px] outline-none uppercase" value={yeniIlan.aciklama} onChange={e => setYeniIlan({...yeniIlan, aciklama: e.target.value.toUpperCase()})} />
                <button type="submit" disabled={resimYukleniyor} className="md:col-span-4 bg-[#0A192F] text-[#FFD700] py-5 rounded-3xl font-black text-xl shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest">
                  {resimYukleniyor ? "YÜKLENİYOR..." : "KAYDET"}
                </button>
            </form>
          </div>
        </div>
      )}

      {detayIlan && (
        <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-xl flex items-center justify-center z-[1000] p-4" onClick={() => setDetayIlan(null)}>
            <div className="bg-white rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="md:w-2/3 bg-black relative flex items-center justify-center">
                    <button onClick={() => setDetayIlan(null)} className="absolute top-6 left-6 z-50 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all"><X size={24}/></button>
                    {detayIlan.resimler?.[aktifResimIdx] && <img src={detayIlan.resimler[aktifResimIdx]} className="w-full h-full object-contain" alt="" />}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80%] p-2">
                        {detayIlan.resimler?.map((r, idx) => (
                            <img key={idx} src={r} onClick={() => setAktifResimIdx(idx)} className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition-all ${aktifResimIdx === idx ? "border-amber-500 scale-110" : "border-transparent"}`} alt="" />
                        ))}
                    </div>
                </div>
                <div className="md:w-1/3 p-8 overflow-y-auto bg-white flex flex-col">
                    <div className="mb-6">
                        <span className="bg-blue-600 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase mb-4 inline-block">{detayIlan.islemTuru}</span>
                        <h2 className="text-3xl font-black text-[#0A192F] mb-2">{formatPara(detayIlan.fiyat)} ₺</h2>
                        <h3 className="text-lg font-bold text-gray-700 uppercase leading-tight">{detayIlan.baslik}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><span className="text-[10px] font-black text-gray-400 block mb-1 uppercase">KONUM</span><span className="text-xs font-black text-[#0A192F] uppercase">{detayIlan.ilce}/{detayIlan.mahalle}</span></div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><span className="text-[10px] font-black text-gray-400 block mb-1 uppercase">TİP</span><span className="text-xs font-black text-[#0A192F] uppercase">{detayIlan.emlakTipi}</span></div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><span className="text-[10px] font-black text-gray-400 block mb-1 uppercase">ODA</span><span className="text-xs font-black text-[#0A192F] uppercase">{detayIlan.oda || "-"}</span></div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100"><span className="text-[10px] font-black text-gray-400 block mb-1 uppercase">ADA/PARSEL</span><span className="text-xs font-black text-[#0A192F] uppercase">{detayIlan.ada || "-"}/{detayIlan.parsel || "-"}</span></div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-[#0A192F] mb-3 uppercase text-sm border-b pb-2">AÇIKLAMA</h4>
                        <p className="text-sm text-gray-600 font-bold whitespace-pre-wrap leading-relaxed uppercase">{detayIlan.aciklama}</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default IlanYonetimi;
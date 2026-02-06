import React, { useState, useEffect } from 'react';
import { veritabani, depolama } from '../firebaseYapilandirma';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Search, Image as ImageIcon, Loader2, Edit3, Trash2, MapPin, UserPlus, ShieldCheck, LogOut, LayoutGrid, Briefcase, Plus, Archive, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import GenelForm from '../bilesenler/GenelForm';

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

  const resimleriYukle = async (files) => {
    if (!files || files.length === 0) return;
    setResimYukleniyor(true);
    try {
      const yuklemeIslemleri = Array.from(files).map(async (file) => {
        const storageRef = ref(depolama, `ilanlar/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });
      
      const yuklenenURLler = await Promise.all(yuklemeIslemleri);
      setYeniIlan(prev => ({ 
        ...prev, 
        resimler: [...(prev.resimler || []), ...yuklenenURLler] 
      }));
    } catch (error) {
      alert("Resim yükleme hatası!");
      console.error(error);
    } finally {
      setResimYukleniyor(false);
    }
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
    <div className="min-h-screen bg-[#E6EAEF] p-4 pb-20 font-sans text-[#0A192F]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border space-y-6">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A192F] flex items-center justify-center text-white font-black text-sm">{kullaniciBilgi?.ad?.charAt(0)}</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">HOŞ GELDİN</span>
                  <span className="text-xs font-black uppercase">{kullaniciBilgi?.ad}</span>
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

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black italic tracking-tighter">EMLAK61</h2>
                {isAdmin && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-black">YÖNETİCİ</span>}
            </div>
            
            <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 overflow-x-auto w-full md:w-auto">
              {[
                { id: "OFIS", icon: <LayoutGrid size={14}/>, label: "OFİS İLANLARI" },
                { id: "ILANLARIM", icon: <Briefcase size={14}/>, label: "İLANLARIM" },
                { id: "ARSIV", icon: <Archive size={14}/>, label: "ARŞİV" }
              ].map(tab => (
                <button key={tab.id} onClick={() => setGorunum(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] transition-all whitespace-nowrap ${gorunum === tab.id ? "bg-white text-[#0A192F] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
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

        {/* ILAN LISTESI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yukleniyor ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-[#0A192F]" size={48} />
              <span className="font-black text-xs uppercase tracking-widest">Veriler Yükleniyor...</span>
            </div>
          ) : filtrelenmisIlanlar.length === 0 ? (
            <div className="col-span-full py-24 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-[40px] border-2 border-dashed">Gösterilecek ilan bulunamadı</div>
          ) : (
            filtrelenmisIlanlar.map((i) => (
              <div key={i.id} onClick={() => { setDetayIlan(i); setAktifResimIdx(0); }} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all relative flex flex-col group cursor-pointer">
                <div className="h-64 relative overflow-hidden">
                   {i.resimler?.[0] ? <img src={i.resimler[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" /> : <div className="h-full bg-gray-50 flex items-center justify-center text-gray-300 font-bold uppercase text-[10px]">Resim Yok</div>}
                   <div className="absolute top-4 left-4 bg-[#0A192F] text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase shadow-lg border border-white/10">{i.emlakTipi}</div>
                   {i.durum !== "AKTİF" && <div className="absolute top-4 right-4 bg-red-600 text-white text-[9px] px-4 py-1.5 rounded-full font-black uppercase shadow-lg border border-white/10">{i.durum}</div>}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-2xl font-black mb-1">{formatPara(i.fiyat)} ₺</div>
                  <h3 className="font-bold text-gray-700 uppercase line-clamp-1 mb-3 text-xs">{i.baslik}</h3>
                  <div className="flex items-center gap-1.5 mb-6 text-gray-500">
                    <MapPin size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase">{i.ilce} / {i.mahalle}</span>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black">{i.ekleyenAd?.charAt(0)}</div>
                      <span className="text-[10px] font-black uppercase">{i.ekleyenAd}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{tarihFormatla(i.tarih)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAY MODAL */}
      {detayIlan && (
        <div className="fixed inset-0 bg-[#0A192F]/98 z-[1000] overflow-y-auto" onClick={() => setDetayIlan(null)}>
            <div className="min-h-screen flex items-center justify-center p-4 md:p-10">
              <div className="bg-white rounded-[50px] w-full max-w-7xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative" onClick={e => e.stopPropagation()}>
                
                {/* SOL: GÖRSEL ALANI */}
                <div className="md:w-3/5 bg-gray-50 relative flex items-center justify-center h-[400px] md:h-auto">
                    <button onClick={() => setDetayIlan(null)} className="absolute top-8 left-8 z-50 bg-[#0A192F] text-white p-4 rounded-full hover:scale-110 transition-all shadow-xl"><X size={24}/></button>
                    
                    {detayIlan.resimler?.[aktifResimIdx] && (
                      <img src={detayIlan.resimler[aktifResimIdx]} className="w-full h-full object-contain" alt="" />
                    )}

                    {detayIlan.resimler?.length > 1 && (
                      <div className="absolute bottom-10 left-10 right-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                         {detayIlan.resimler.map((img, idx) => (
                           <button key={idx} onClick={() => setAktifResimIdx(idx)} className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all ${aktifResimIdx === idx ? 'border-blue-500 scale-105' : 'border-white/50 opacity-60'}`}>
                             <img src={img} className="w-full h-full object-cover" />
                           </button>
                         ))}
                      </div>
                    )}
                </div>

                {/* SAĞ: BİLGİ ALANI */}
                <div className="md:w-2/5 p-8 md:p-12 overflow-y-auto bg-white flex flex-col max-h-[90vh]">
                    <div className="mb-10 flex justify-between items-start">
                      <div>
                        <div className="text-5xl font-black tracking-tighter mb-2">{formatPara(detayIlan.fiyat)} <span className="text-2xl font-bold">₺</span></div>
                        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{detayIlan.islemTuru} / {detayIlan.emlakTipi}</span>
                      </div>
                      
                      {(isAdmin || detayIlan.ekleyen === kullaniciBilgi?.eposta) && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { 
                                setDuzenlenenId(detayIlan.id); 
                                setYeniIlan(detayIlan); 
                                setFormAcik(true); 
                                setDetayIlan(null); 
                            }} 
                            className="p-4 bg-gray-50 text-blue-600 rounded-3xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <Edit3 size={20}/>
                          </button>
                          <button onClick={() => ilanSil(detayIlan.id)} className="p-4 bg-gray-50 text-red-600 rounded-3xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={20}/></button>
                        </div>
                      )}
                    </div>

                    <h1 className="text-xl font-black uppercase mb-10 leading-tight">{detayIlan.baslik}</h1>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        {/* ARSA/TARLA İSE SADECE ADA-PARSEL VE M2 GÖSTER */}
                        {detayIlan.emlakTipi === "Arsa" || detayIlan.emlakTipi === "Tarla" ? (
                          <>
                            <div className="bg-blue-50 p-5 rounded-[25px] border border-blue-100 col-span-2 flex gap-4">
                              <div className="flex-1">
                                <div className="text-[9px] font-black text-blue-400 mb-1 uppercase">ADA</div>
                                <div className="text-xs font-black uppercase">{detayIlan.ada || '-'}</div>
                              </div>
                              <div className="flex-1">
                                <div className="text-[9px] font-black text-blue-400 mb-1 uppercase">PARSEL</div>
                                <div className="text-xs font-black uppercase">{detayIlan.parsel || '-'}</div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-[25px] border border-gray-100">
                                <div className="text-[9px] font-black text-gray-400 mb-1 uppercase">M²</div>
                                <div className="text-xs font-black uppercase">{detayIlan.m2 || '-'}</div>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-[25px] border border-gray-100">
                                <div className="text-[9px] font-black text-gray-400 mb-1 uppercase">KONUM</div>
                                <div className="text-xs font-black uppercase">{detayIlan.ilce || '-'}</div>
                            </div>
                          </>
                        ) : (
                          /* DİĞER EMLAK TİPLERİ İÇİN STANDART ALANLAR */
                          <>
                            {[
                              { l: "ODA", v: detayIlan.odaSayisi },
                              { l: "M²", v: detayIlan.m2 },
                              { l: "KAT", v: detayIlan.kat },
                              { l: "ISITMA", v: detayIlan.isitma },
                              { l: "KONUM", v: detayIlan.ilce },
                              { l: "MUTFAK", v: detayIlan.mutfak }
                            ].map((item, idx) => (
                              <div key={idx} className="bg-gray-50 p-5 rounded-[25px] border border-gray-100">
                                <div className="text-[9px] font-black text-gray-400 mb-1 uppercase">{item.l}</div>
                                <div className="text-xs font-black uppercase">{item.v || '-'}</div>
                              </div>
                            ))}
                          </>
                        )}
                    </div>

                    <div className="space-y-4 mb-10">
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">İlan Açıklaması</h4>
                       <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase whitespace-pre-wrap">{detayIlan.aciklama}</p>
                    </div>

                    <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-[#0A192F] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">{detayIlan.ekleyenAd?.charAt(0)}</div>
                         <div>
                           <div className="text-[9px] font-black text-gray-400 uppercase">DANIŞMAN</div>
                           <div className="text-xs font-black uppercase">{detayIlan.ekleyenAd}</div>
                         </div>
                       </div>
                       <div className="text-right">
                          <div className="text-[9px] font-black text-gray-400 uppercase">İLAN TARİHİ</div>
                          <div className="text-xs font-black">{tarihFormatla(detayIlan.tarih)}</div>
                       </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                       <button onClick={() => durumuGuncelle(detayIlan.id, detayIlan.durum === "SATILDI" ? "AKTİF" : "SATILDI")} className={`py-4 rounded-2xl font-black text-[10px] transition-all ${detayIlan.durum === "SATILDI" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>SATILDI OLARAK İŞARETLE</button>
                       <button onClick={() => durumuGuncelle(detayIlan.id, detayIlan.durum === "PASİF" ? "AKTİF" : "PASİF")} className={`py-4 rounded-2xl font-black text-[10px] transition-all ${detayIlan.durum === "PASİF" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>PASİFE AL / ARŞİVLE</button>
                    </div>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* GENEL FORM MODÜLÜ */}
      {formAcik && (
        <GenelForm 
          tip="ilan"
          baslik={duzenlenenId ? "İLAN GÜNCELLE" : "YENİ İLAN EKLE"}
          veri={yeniIlan}
          setVeri={setYeniIlan}
          kapat={formuKapat}
          kaydet={ilanKaydet}
          resimYukle={resimleriYukle}
          resimYukleniyor={resimYukleniyor}
        />
      )}

      {/* DANIŞMAN PANELİ */}
      {danismanPanelAcik && isAdmin && (
        <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[900] p-4">
            <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black italic tracking-tighter">DANIŞMAN YÖNETİMİ</h3>
                    <button onClick={() => setDanismanPanelAcik(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex gap-2 mb-8">
                    <input type="text" className="flex-1 p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all text-xs" placeholder="E-POSTA ADRESİ" value={yeniDanismanIsmi} onChange={e => setYeniDanismanIsmi(e.target.value)} />
                    <button onClick={danismanEkle} className="bg-[#0A192F] text-white px-6 rounded-2xl hover:bg-black transition-all shadow-lg"><Plus size={20}/></button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {danismanlar.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                            <span className="font-black text-[10px] uppercase tracking-wider">{d.isim}</span>
                            <button onClick={() => danismanSil(d.id)} className="text-red-400 hover:text-red-600 transition-all p-2"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default IlanYonetimi;

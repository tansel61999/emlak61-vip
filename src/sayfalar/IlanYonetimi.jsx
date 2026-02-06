import React, { useState, useEffect } from 'react';
import { veritabani, depolama } from '../firebaseYapilandirma';
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, getDocs, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Search, Loader2, Edit3, Trash2, MapPin, UserPlus, ShieldCheck, LogOut, Plus, CheckCircle2 } from 'lucide-react';
import GenelForm from '../bilesenler/GenelForm';

const IlanYonetimi = () => {
  const [ilanlar, setIlanlar] = useState([]);
  const [aramaTerimi, setAramaTerimi] = useState("");
  const [formAcik, setFormAcik] = useState(false);
  const [detayIlan, setDetayIlan] = useState(null);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [kullaniciBilgi, setKullaniciBilgi] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authHazir, setAuthHazir] = useState(false);
  const [resimYukleniyor, setResimYukleniyor] = useState(false);
  
  const auth = getAuth();
  const YONETICI_EPOSTA = "tansel6199@gmail.com";

  const bosForm = {
    islemTuru: "", baslik: "", fiyat: "", il: "Aydın", ilce: "", mahalle: "",
    emlakTipi: "", konutTipi: "", odaSayisi: "", kat: "", durum: "SATILIK", isitma: "", 
    banyo: "1", siteIci: "Hayır", m2: "", aciklama: "", resimler: [], ada: "", parsel: "",
    ekleyen: "", ekleyenAd: "", ekleyenFoto: ""
  };

  const [yeniIlan, setYeniIlan] = useState(bosForm);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdmin(user.email.toLowerCase() === YONETICI_EPOSTA.toLowerCase());
        setKullaniciBilgi(user);
      }
      setAuthHazir(true);
    });

    const q = query(collection(veritabani, "ilanlar"), orderBy("tarih", "desc"));
    const unsubSnap = onSnapshot(q, (snap) => {
      setIlanlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubAuth(); unsubSnap(); };
  }, []);

  const durumuDegistir = async (id, mevcutDurum) => {
    const yeniDurum = mevcutDurum === "SATILDI" ? "SATILIK" : "SATILDI";
    await updateDoc(doc(veritabani, "ilanlar", id), { durum: yeniDurum });
  };

  const resimleriYukle = async (files) => {
    setResimYukleniyor(true);
    const yuklenenler = await Promise.all(Array.from(files).map(async (file) => {
      const sRef = ref(depolama, `ilanlar/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(sRef, file);
      return await getDownloadURL(snap.ref);
    }));
    setYeniIlan(prev => ({ ...prev, resimler: [...(prev.resimler || []), ...yuklenenler] }));
    setResimYukleniyor(false);
  };

  const ilanKaydet = async (e) => {
    e.preventDefault();
    const veri = { ...yeniIlan, fiyat: yeniIlan.fiyat.toString().replace(/\D/g, ""), ekleyen: kullaniciBilgi.email, ekleyenAd: kullaniciBilgi.displayName };
    if (duzenlenenId) await updateDoc(doc(veritabani, "ilanlar", duzenlenenId), { ...veri, guncellemeTarihi: serverTimestamp() });
    else await addDoc(collection(veritabani, "ilanlar"), { ...veri, tarih: serverTimestamp(), durum: "SATILIK" });
    setFormAcik(false); setDuzenlenenId(null); setYeniIlan(bosForm);
  };

  const filtrelenmis = ilanlar.filter(i => (i.baslik || "").toLowerCase().includes(aramaTerimi.toLowerCase()));

  if (!authHazir) return null;

  return (
    <div className="min-h-screen bg-[#E6EAEF] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black italic">EMLAK61</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input type="text" placeholder="İlanlarda ara..." className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none font-bold" onChange={(e) => setAramaTerimi(e.target.value)} />
          </div>
          <button onClick={() => { setDuzenlenenId(null); setYeniIlan(bosForm); setFormAcik(true); }} className="bg-[#0A192F] text-[#FFD700] px-8 py-4 rounded-2xl font-black">+ YENİ İLAN</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrelenmis.map((i) => (
            <div key={i.id} onClick={() => setDetayIlan(i)} className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group relative border border-gray-100">
              <div className="h-64 relative">
                {i.resimler?.[0] ? <img src={i.resimler[0]} className="w-full h-full object-cover" /> : <div className="h-full bg-gray-100 flex items-center justify-center font-black">RESİM YOK</div>}
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase ${i.durum === "SATILDI" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                    {i.durum === "SATILDI" ? "SATILDI" : "SATILIK"}
                  </span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); durumuDegistir(i.id, i.durum); }} className="absolute top-4 right-4 p-2 bg-white rounded-xl text-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                  <CheckCircle2 size={20}/>
                </button>
              </div>
              <div className="p-6">
                <div className="text-2xl font-black mb-1">{new Intl.NumberFormat('tr-TR').format(i.fiyat)} ₺</div>
                <h3 className="font-bold text-gray-500 uppercase text-[10px] line-clamp-1">{i.baslik}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {formAcik && <GenelForm tip="ilan" baslik={duzenlenenId ? "GÜNCELLE" : "YENİ"} veri={yeniIlan} setVeri={setYeniIlan} kapat={() => setFormAcik(false)} kaydet={ilanKaydet} resimYukle={resimleriYukle} resimYukleniyor={resimYukleniyor} />}
    </div>
  );
};

export default IlanYonetimi;

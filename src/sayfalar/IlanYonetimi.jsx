import React, { useState, useEffect } from 'react';
import { veritabani, depolama } from '../firebaseYapilandirma';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X, Save, Search, Image as ImageIcon, Loader2, Edit3, Trash2, MapPin, Building2, Wind, Compass, Calendar, CreditCard, Layers, Hash, User, Send, Clock, Settings, UserPlus, ShieldCheck } from 'lucide-react';

const IlanYonetimi = () => {
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
  const [aktarimModali, setAktarimModali] = useState({ acik: false, ilanId: null, mevcutDanisman: "" });
  
  // YÖNETİCİ KONTROLÜ İÇİN STATE
  const [mevcutKullaniciEposta, setMevcutKullaniciEposta] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const YONETICI_EPOSTA = "tansel6199@gmail.com";

  const auth = getAuth();

  useEffect(() => {
    // Kullanıcı oturum durumunu izle
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const eposta = user.email.toLowerCase();
        setMevcutKullaniciEposta(eposta);
        setIsAdmin(eposta === YONETICI_EPOSTA.toLowerCase());
      }
    });

    const qIlanlar = query(collection(veritabani, "ilanlar"), orderBy("tarih", "desc"));
    const unsubIlanlar = onSnapshot(qIlanlar, (snap) => {
      setIlanlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setYukleniyor(false);
    });

    const qDanismanlar = query(collection(veritabani, "danismanlar"), orderBy("isim", "asc"));
    const unsubDanismanlar = onSnapshot(qDanismanlar, (snap) => {
      setDanismanlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubAuth(); unsubIlanlar(); unsubDanismanlar(); };
  }, []);

  const danismanEkle = async () => {
    if (!isAdmin || !yeniDanismanIsmi.trim()) return;
    try {
      await addDoc(collection(veritabani, "danismanlar"), { isim: yeniDanismanIsmi.toLowerCase().trim() });
      setYeniDanismanIsmi("");
    } catch (h) { alert("Yetki hatası veya bağlantı sorunu."); }
  };

  const danismanSil = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("Bu danışmanı silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(veritabani, "danismanlar", id));
    }
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
        ekleyen: isAdmin ? (yeniIlan.ekleyen || "ADMİN") : mevcutKullaniciEposta
      };

      if (duzenlenenId) {
        await updateDoc(doc(veritabani, "ilanlar", duzenlenenId), { ...kaydedilecekVeri, guncellemeTarihi: serverTimestamp() });
      } else {
        await addDoc(collection(veritabani, "ilanlar"), { ...kaydedilecekVeri, tarih: serverTimestamp() });
      }
      formuKapat();
    } catch (h) { alert("Kaydetme hatası!"); }
  };

  const ilanAktar = async (yeniDanisman) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(veritabani, "ilanlar", aktarimModali.ilanId), { ekleyen: yeniDanisman });
      setAktarimModali({ acik: false, ilanId: null, mevcutDanisman: "" });
    } catch (h) { alert("Aktarım hatası!"); }
  };

  const ilanSil = async (id) => {
    if (!isAdmin) {
      alert("İlan silme yetkisi sadece yöneticidedir.");
      return;
    }
    if (window.confirm("Bu ilanı silmek üzeresiniz?")) {
      await deleteDoc(doc(veritabani, "ilanlar", id));
      setDetayIlan(null);
    }
  };

  const formuKapat = () => {
    setFormAcik(false);
    setDuzenlenenId(null);
    setYeniIlan(bosForm);
  };

  const tarihFormatla = (ts) => {
    if (!ts) return "";
    const d = ts.toDate();
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const bosForm = {
    islemTuru: "", baslik: "", fiyat: "", il: "Aydın", ilce: "", mahalle: "",
    emlakTipi: "", oda: "", kat: "", durum: "AKTİF", isinma: "", binaYasi: "",
    cephe: "", kredi: "", aciklama: "", resimler: [], ada: "", parsel: "", ekleyen: ""
  };

  const [yeniIlan, setYeniIlan] = useState(bosForm);

  const konumVerisi = {
    "Aydın": { "Kuşadası": ["Alacamescit", "Bayraklıdede", "Caferli", "Camiatik", "Camikebir", "Cumhuriyet", "Davutlar", "Güzelçamlı", "Hacıfeyzullah", "İkiçeşmelik", "Kadınlar Denizi", "Türkmen", "Yavansu"], "Söke": ["Atburgazı", "Bağarası", "Güllübahçe", "Yenidoğan", "Savuca"], "Didim": ["Altınkum", "Efeler", "Hisar", "Mavişehir"] },
    "İzmir": { "Selçuk": ["Atatürk", "Cumhuriyet", "İsabey"], "Menderes": ["Özdere", "Gümüldür"] }
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[32px] shadow-sm border">
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-[#0A192F]">EMLAK61</h2>
                {isAdmin ? (
                  <span className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-md font-black">YÖNETİCİ AKTİF</span>
                ) : (
                  <span className="bg-gray-100 text-gray-400 text-[10px] px-2 py-1 rounded-md font-black">DANIŞMAN MODU</span>
                )}
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded mt-1 font-bold">{mevcutK

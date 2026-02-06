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

  // OTOMATİK EŞLEŞME MANTIĞI (Matchmaking)
  const eslesenIlanlariGetir = (talep) => {
    if (!talep) return [];
    return ilanlar.filter(ilan => {
      const katUyumu = ilan.kategori === talep.kategori;
      const islemUyumu = ilan.islemTipi === talep.islemTipi;
      const fiyatUyumu = (!talep.fiyatMax || Number(ilan.fiyat) <= Number(talep.fiyatMax)) &&
                         (!talep.fiyatMin || Number(ilan.fiyat) >= Number(talep.fiyatMin));
      // Konum kontrolü (Basit metin eşleşmesi)
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
    setIsTalebi({ islemTipi: "Satılık", kategori: "Daire", fiyatMin: "", fiyatMax: "", konum: "", mutfak: "Fark Et

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const IlanYonetimi = () => {
  const [ilanlar, setIlanlar] = useState([]);
  const [yeniIlan, setYeniIlan] = useState({ baslik: '', fiyat: '', durum: 'Aktif' });
  const db = getFirestore();

  // Aktif İlanları Getir
  const ilanlariGetir = async () => {
    const q = query(collection(db, "ilanlar"), where("durum", "==", "Aktif"));
    const querySnapshot = await getDocs(q);
    const liste = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setIlanlar(liste);
  };

  useEffect(() => { ilanlariGetir(); }, []);

  // İlan Ekle
  const ilanEkle = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "ilanlar"), { ...yeniIlan, tarih: new Date().toISOString() });
    setYeniIlan({ baslik: '', fiyat: '', durum: 'Aktif' });
    ilanlariGetir();
  };

  // İlanı Arşivle (Satıldı veya Pasif Yap)
  const arsivle = async (id, yeniDurum) => {
    const ilanRef = doc(db, "ilanlar", id);
    await updateDoc(ilanRef, { durum: yeniDurum });
    ilanlariGetir();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0A192F]">İLAN YÖNETİMİ</h2>
      
      {/* İlan Ekleme Formu */}
      <form onSubmit={ilanEkle} className="bg-white p-4 rounded shadow flex gap-4">
        <input 
          value={yeniIlan.baslik} 
          onChange={(e) => setYeniIlan({...yeniIlan, baslik: e.target.value})}
          placeholder="İlan Başlığı (Örn: Kuşadası Satılık Villa)" 
          className="border p-2 flex-1 rounded" 
          required 
        />
        <input 
          value={yeniIlan.fiyat} 
          onChange={(e) => setYeniIlan({...yeniIlan, fiyat: e.target.value})}
          placeholder="Fiyat" 
          className="border p-2 w-32 rounded" 
          required 
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">EKLE</button>
      </form>

      {/* Aktif İlan Listesi */}
      <div className="grid gap-4">
        {ilanlar.map(ilan => (
          <div key={ilan.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <span className="font-bold">{ilan.baslik}</span> - {ilan.fiyat} TL
            </div>
            <div className="flex gap-2">
              <button onClick={() => arsivle(ilan.id, 'Satıldı')} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">SATILDI</button>
              <button onClick={() => arsivle(ilan.id, 'Pasif')} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">PASİF YAP</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IlanYonetimi;

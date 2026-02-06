import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const IlanYonetimi = () => {
  const [ilanlar, setIlanlar] = useState([]);
  const [yeniIlan, setYeniIlan] = useState({ baslik: '', fiyat: '', durum: 'Aktif' });
  const db = getFirestore();

  const ilanlariGetir = async () => {
    const q = query(collection(db, "ilanlar"), where("durum", "==", "Aktif"));
    const querySnapshot = await getDocs(q);
    const liste = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setIlanlar(liste);
  };

  useEffect(() => { ilanlariGetir(); }, []);

  const ilanEkle = async (e) => {
    e.preventDefault();
    if(!yeniIlan.baslik || !yeniIlan.fiyat) return;
    await addDoc(collection(db, "ilanlar"), { ...yeniIlan, tarih: new Date().toISOString() });
    setYeniIlan({ baslik: '', fiyat: '', durum: 'Aktif' });
    ilanlariGetir();
  };

  const arsivle = async (id, yeniDurum) => {
    const ilanRef = doc(db, "ilanlar", id);
    await updateDoc(ilanRef, { durum: yeniDurum });
    ilanlariGetir();
  };

  return (
    <div className="min-h-screen bg-[#0A192F] p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-[#FFD700] text-3xl font-black mb-8 tracking-tighter border-b-2 border-[#FFD700] pb-2 inline-block">
          İLAN YÖNETİMİ
        </h2>
        
        {/* Şık Form Tasarımı */}
        <form onSubmit={ilanEkle} className="bg-[#112240] p-6 rounded-xl shadow-2xl mb-10 border border-[#233554] flex flex-col md:flex-row gap-4">
          <input 
            value={yeniIlan.baslik} 
            onChange={(e) => setYeniIlan({...yeniIlan, baslik: e.target.value})}
            placeholder="İlan Başlığı..." 
            className="flex-1 bg-[#0A192F] border border-[#233554] text-white p-3 rounded-lg focus:outline-none focus:border-[#FFD700] transition-colors"
          />
          <input 
            value={yeniIlan.fiyat} 
            onChange={(e) => setYeniIlan({...yeniIlan, fiyat: e.target.value})}
            placeholder="Fiyat" 
            className="md:w-40 bg-[#0A192F] border border-[#233554] text-white p-3 rounded-lg focus:outline-none focus:border-[#FFD700]"
          />
          <button type="submit" className="bg-[#FFD700] text-[#0A192F] font-bold px-8 py-3 rounded-lg hover:bg-yellow-500 transition-all transform hover:scale-105">
            EKLE
          </button>
        </form>

        {/* İlan Kartları */}
        <div className="grid gap-4">
          {ilanlar.map(ilan => (
            <div key={ilan.id} className="bg-[#112240] p-5 rounded-lg border border-[#233554] flex justify-between items-center hover:border-[#FFD700] transition-all group">
              <div>
                <h3 className="text-white font-bold text-lg group-hover:text-[#FFD700] transition-colors">{ilan.baslik}</h3>
                <p className="text-gray-400 font-mono">{Number(ilan.fiyat).toLocaleString()} TL</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => arsivle(ilan.id, 'Satıldı')} 
                  className="bg-blue-600/20 text-blue-400 border border-blue-600/50 px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-all text-xs font-bold"
                >
                  SATILDI
                </button>
                <button 
                  onClick={() => arsivle(ilan.id, 'Pasif')} 
                  className="bg-gray-600/20 text-gray-400 border border-gray-600/50 px-4 py-2 rounded hover:bg-gray-600 hover:text-white transition-all text-xs font-bold"
                >
                  PASİF YAP
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IlanYonetimi;

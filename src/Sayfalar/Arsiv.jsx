import React, { useState, useEffect } from 'react';
import { veritabani } from '../firebaseYapilandirma';
import { collection, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Archive, Trash2, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

const Arsiv = () => {
  const [arsivlenmisIlanlar, setArsivlenmisIlanlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const q = query(collection(veritabani, "ilanlar"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const veriler = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sadece Durumu 'SATILDI' veya 'PASİF' olanları filtrele
      setArsivlenmisIlanlar(veriler.filter(i => i.durum === "SATILDI" || i.durum === "PASİF"));
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, []);

  // İlanı Tekrar Yayına Al (Aktif Yap)
  const yayinaAl = async (id) => {
    const ilanRef = doc(veritabani, "ilanlar", id);
    await updateDoc(ilanRef, { durum: "Aktif" });
    alert("İlan tekrar aktif ilanlar listesine taşındı.");
  };

  // İlanı Tamamen Sil
  const ilanıSil = async (id) => {
    if (window.confirm("Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(veritabani, "ilanlar", id));
    }
  };

  if (yukleniyor) return <div className="p-10 text-center font-bold">Arşiv Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-[#0A192F] flex items-center gap-2">
          <Archive className="text-amber-500" /> İLAN ARŞİVİ
        </h2>
        <p className="text-gray-400 text-sm">Satılmış veya pasife alınmış ilanlar burada tutulur.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {arsivlenmisIlanlar.map((i) => (
          <div key={i.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden opacity-90 hover:opacity-100 transition-all">
            <div className={`p-4 text-center font-black text-xs tracking-widest ${i.durum === 'SATILDI' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {i.durum === 'SATILDI' ? (
                <span className="flex items-center justify-center gap-1"><CheckCircle2 size={14}/> SATILDI</span>
              ) : (
                <span className="flex items-center justify-center gap-1"><AlertCircle size={14}/> PASİF</span>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-1 uppercase line-clamp-1">{i.baslik}</h3>
              <p className="text-[#0A192F] font-black text-lg mb-4">{i.fiyat} ₺</p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => yayinaAl(i.id)}
                  className="w-full flex items-center justify-center gap-2 bg-[#0A192F] text-[#FFD700] py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all"
                >
                  <RotateCcw size={16} /> TEKRAR YAYINA AL
                </button>

                <button
                  onClick={() => ilanıSil(i.id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3 rounded-xl font-bold text-xs hover:bg-red-100 transition-all"
                >
                  <Trash2 size={16} /> TAMAMEN SİL
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {arsivlenmisIlanlar.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <Archive size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Arşivde henüz ilan bulunmuyor.</p>
        </div>
      )}
    </div>
  );
};

export default Arsiv;
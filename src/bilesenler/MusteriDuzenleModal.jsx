import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { veritabani } from '../firebaseYapilandirma';
import { X, Save, User, Phone, Tag, DollarSign, MapPin, MessageSquare } from 'lucide-react';

const MusteriDuzenleModal = ({ seciliKayit, setSeciliKayit }) => {
  const aktifKullanici = localStorage.getItem("kullaniciAd") || "Yönetici";

  const [formData, setFormData] = useState({
    ad: seciliKayit.ad || "",
    telefon: seciliKayit.telefon || "",
    not: seciliKayit.not || "",
    kategori: seciliKayit.talepDetay?.kategori || seciliKayit.kategori || "",
    fiyat: seciliKayit.talepDetay?.fiyatMax || seciliKayit.fiyat || "",
    konum: seciliKayit.talepDetay?.konum || seciliKayit.konum || ""
  });

  const guncelle = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(veritabani, "musteriler", seciliKayit.id);
      await updateDoc(ref, {
        ad: formData.ad.toUpperCase(),
        telefon: formData.telefon,
        not: formData.not,
        talepDetay: {
          kategori: formData.kategori.toUpperCase(),
          fiyatMax: formData.fiyat,
          konum: formData.konum.toUpperCase()
        },
        // Eski yapı uyumluluğu için
        kategori: formData.kategori.toUpperCase(),
        fiyat: formData.fiyat,
        konum: formData.konum.toUpperCase(),
        sonGuncelleyen: aktifKullanici,
        sonIslemTarihi: serverTimestamp()
      });
      setSeciliKayit(null);
    } catch (hata) {
      console.error("Hata:", hata);
      alert("Güncellenirken bir sorun oluştu!");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md flex items-center justify-center z-[999] p-4 text-[#0A192F]">
      <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl border-4 border-[#FFD700]">
        <div className="bg-[#0A192F] p-6 text-white flex justify-between items-center border-b-4 border-[#FFD700]">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Müşteri Düzenle</h3>
          <button onClick={() => setSeciliKayit(null)} className="p-2 hover:bg-red-500 rounded-xl"><X size={24} /></button>
        </div>

        <form onSubmit={guncelle} className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 ml-2">İSİM SOYİSİM</label>
              <input value={formData.ad} onChange={e => setFormData({...formData, ad: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold uppercase border" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 ml-2">TELEFON</label>
              <input value={formData.telefon} onChange={e => setFormData({...formData, telefon: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 ml-2">KATEGORİ</label>
              <input value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold uppercase border" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 ml-2">BÜTÇE</label>
              <input value={formData.fiyat} onChange={e => setFormData({...formData, fiyat: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 ml-2">KONUM / MAHALLE</label>
            <input value={formData.konum} onChange={e => setFormData({...formData, konum: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold uppercase border" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 ml-2">NOTLAR</label>
            <textarea value={formData.not} onChange={e => setFormData({...formData, not: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl h-24 border font-medium italic" />
          </div>
          <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><Save size={24}/> DEĞİŞİKLİKLERİ KAYDET</button>
        </form>
      </div>
    </div>
  );
};

export default MusteriDuzenleModal;

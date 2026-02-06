import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { veritabani } from '../firebaseYapilandirma';
import { Save, X, User, Phone, MapPin, Tag, MessageSquare, DollarSign, UserCheck } from 'lucide-react';

const DuzenleModal = ({ seciliKayit, setSeciliKayit }) => {
  // 1. GÜVENLİK KONTROLÜ: Eğer kayıt yoksa beyaz ekran vermesini engelle
  if (!seciliKayit) return null;

  const aktifKullanici = localStorage.getItem("kullaniciAd") || "Yönetici";

  const [formData, setFormData] = useState({
    ad: seciliKayit.ad || "",
    telefon: seciliKayit.telefon || "",
    not: seciliKayit.not || "",
    kategori: seciliKayit.talepDetay?.kategori || seciliKayit.kategori || "",
    fiyatMax: seciliKayit.talepDetay?.fiyatMax || seciliKayit.fiyat || "",
    konum: seciliKayit.talepDetay?.konum || seciliKayit.konum || ""
  });

  const guncelle = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(veritabani, "musteriler", seciliKayit.id);
      await updateDoc(ref, {
        ad: formData.ad,
        telefon: formData.telefon,
        not: formData.not,
        talepDetay: {
          kategori: formData.kategori,
          fiyatMax: formData.fiyatMax,
          konum: formData.konum
        },
        kategori: formData.kategori,
        fiyat: formData.fiyatMax,
        konum: formData.konum,
        sonGuncelleyen: aktifKullanici,
        sonIslemTarihi: serverTimestamp()
      });
      setSeciliKayit(null);
    } catch (hata) {
      console.error("Hata:", hata);
      alert("Güncellenemedi!");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-md flex items-center justify-center z-[999] p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border-4 border-[#FFD700]">
        
        <div className="bg-[#0A192F] p-8 text-white flex justify-between items-center border-b-4 border-[#FFD700]">
          <div className="flex items-center gap-4">
            <div className="bg-[#FFD700] p-3 rounded-2xl text-[#0A192F]"><UserCheck size={28}/></div>
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Kayıt Düzenle</h3>
              <p className="text-[#FFD700] text-[10px] font-bold uppercase tracking-widest italic">GÜNCELLEYEN: {aktifKullanici}</p>
            </div>
          </div>
          <button onClick={() => setSeciliKayit(null)} className="bg-white/10 p-3 rounded-2xl hover:bg-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={guncelle} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[85vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Müşteri İsmi</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <User size={18} className="text-[#FFD700] mr-2"/>
                <input value={formData.ad} onChange={(e) => setFormData({...formData, ad: e.target.value})} className="bg-transparent outline-none w-full font-black uppercase text-sm"/>
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Telefon</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <Phone size={18} className="text-[#FFD700] mr-2"/>
                <input value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} className="bg-transparent outline-none w-full font-black text-sm"/>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Kategori</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <Tag size={18} className="text-[#FFD700] mr-2"/>
                <input value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="bg-transparent outline-none w-full font-black uppercase text-sm"/>
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Bütçe</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <DollarSign size={18} className="text-green-600 mr-2"/>
                <input value={formData.fiyatMax} onChange={(e) => setFormData({...formData, fiyatMax: e.target.value})} className="bg-transparent outline-none w-full font-black text-sm"/>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Konum</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <MapPin size={18} className="text-blue-500 mr-2"/>
                <input value={formData.konum} onChange={(e) => setFormData({...formData, konum: e.target.value})} className="bg-transparent outline-none w-full font-black uppercase text-sm"/>
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Not</label>
              <div className="flex items-start bg-gray-50 rounded-3xl p-5 border border-gray-100">
                <MessageSquare size={18} className="text-[#FFD700] mr-2 mt-1"/>
                <textarea rows="3" value={formData.not} onChange={(e) => setFormData({...formData, not: e.target.value})} className="bg-transparent outline-none w-full font-bold text-sm italic"/>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all">
              <Save size={28}/> GÜNCELLE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DuzenleModal;

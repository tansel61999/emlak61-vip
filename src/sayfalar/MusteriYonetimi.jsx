import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { veritabani } from '../firebaseYapilandirma';
import { Save, X, User, Phone, MapPin, Tag, MessageSquare, DollarSign, UserCheck } from 'lucide-react';

const DuzenleModal = ({ seciliKayit, setSeciliKayit }) => {
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
    const ref = doc(veritabani, "musteriler", seciliKayit.id);

    try {
      await updateDoc(ref, {
        ad: formData.ad,
        telefon: formData.telefon,
        not: formData.not,
        // Arşiv ve CRM ile tam uyumlu talep detayları
        talepDetay: {
          kategori: formData.kategori,
          fiyatMax: formData.fiyatMax,
          konum: formData.konum
        },
        // Alt anahtarları da güncelle (Geriye dönük uyumluluk için)
        kategori: formData.kategori,
        fiyat: formData.fiyatMax,
        konum: formData.konum,
        // Takip Bilgileri
        sonGuncelleyen: aktifKullanici,
        sonIslemTarihi: serverTimestamp()
      });
      alert("Kayıt başarıyla güncellendi!");
      setSeciliKayit(null);
    } catch (hata) {
      console.error("Güncelleme hatası:", hata);
      alert("Hata oluştu, tekrar dene!");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-xl flex items-center justify-center z-[999] p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border-4 border-[#FFD700]">
        
        {/* Başlık Paneli */}
        <div className="bg-[#0A192F] p-8 text-white flex justify-between items-center border-b-4 border-[#FFD700]">
          <div className="flex items-center gap-4">
            <div className="bg-[#FFD700] p-3 rounded-2xl text-[#0A192F]"><UserCheck size={28}/></div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Kayıt Düzenle</h3>
              <p className="text-[#FFD700] text-[10px] font-bold uppercase tracking-widest">GÜNCELLEYEN: {aktifKullanici}</p>
            </div>
          </div>
          <button onClick={() => setSeciliKayit(null)} className="bg-white/10 p-3 rounded-2xl hover:bg-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={guncelle} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          
          {/* Kişisel Bilgiler */}
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Müşteri İsmi</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <User size={18} className="text-[#FFD700] mr-2"/>
                <input value={formData.ad} onChange={(e) => setFormData({...formData, ad: e.target.value})} className="bg-transparent outline-none w-full font-black uppercase text-sm" placeholder="İSİM SOYİSİM"/>
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">İletişim Hattı</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <Phone size={18} className="text-[#FFD700] mr-2"/>
                <input value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} className="bg-transparent outline-none w-full font-black text-sm" placeholder="5XX XXX XX XX"/>
              </div>
            </div>
          </div>

          {/* Talep Detayları */}
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Kategori / Talep</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
                <Tag size={18} className="text-[#FFD700] mr-2"/>
                <input value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="bg-transparent outline-none w-full font-black uppercase text-sm" placeholder="DAİRE, ARSA VB."/>
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Maksimum Bütçe</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
                <DollarSign size={18} className="text-green-600 mr-2"/>
                <input value={formData.fiyatMax} onChange={(e) => setFormData({...formData, fiyatMax: e.target.value})} className="bg-transparent outline-none w-full font-black text-sm text-green-700" placeholder="FİYAT GİRİNİZ"/>
              </div>
            </div>
          </div>

          {/* Konum ve Geniş Not Alanı */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Hedef Konum / Mahalle</label>
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner">
                <MapPin size={18} className="text-blue-500 mr-2"/>
                <input value={formData.konum} onChange={(e) => setFormData({...formData, konum: e.target.value})} className="bg-transparent outline-none w-full font-black uppercase text-sm" placeholder="BÖLGE BELİRTİNİZ"/>
              </div>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Süreç Notları</label>
              <div className="flex items-start bg-gray-50 rounded-[2rem] p-5 border border-gray-100 shadow-inner">
                <MessageSquare size={18} className="text-[#FFD700] mr-2 mt-1"/>
                <textarea rows="4" value={formData.not} onChange={(e) => setFormData({...formData, not: e.target.value})} className="bg-transparent outline-none w-full font-bold text-sm italic text-gray-600" placeholder="Müşteri talebi hakkında detaylı not..."/>
              </div>
            </div>
          </div>

          {/* İşlem Butonu */}
          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:bg-[#FFD700] hover:text-[#0A192F] transition-all transform active:scale-95 border-2 border-[#0A192F]">
              <Save size={28}/> VERİLERİ GÜNCELLE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DuzenleModal;

import React from 'react';
import { X, Camera, MapPin, Home, Layers, Maximize, CreditCard, Thermometer, Droplets, Grid } from 'lucide-react';

const GenelForm = ({ tip, kapat, veri, setVeri, kaydet, baslik }) => {
  // Arsa veya Tarla seçildiğinde teknik alanları gizlemek için kontrol
  const arsaMi = veri.konutTipi === "Arsa" || veri.konutTipi === "Tarla";

  return (
    <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-md flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border-4 border-[#FFD700] my-auto">
        
        {/* Header */}
        <div className="bg-[#0A192F] p-6 text-white flex justify-between items-center border-b-4 border-[#FFD700]">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Home className="text-[#FFD700]" /> {baslik}
          </h2>
          <button onClick={kapat} className="bg-white/10 p-2 rounded-xl hover:bg-red-500 transition-all">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={kaydet} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sol Kolon: Resim ve Başlık */}
          <div className="md:col-span-3 space-y-4">
            <div className="w-full h-32 border-4 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 hover:border-[#FFD700] transition-colors cursor-pointer">
              <Camera size={32} />
              <span className="text-[10px] font-black uppercase mt-2">Çoklu Resim Ekleme Alanı</span>
            </div>
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">İlan Başlığı</label>
              <input 
                required
                value={veri.baslik || ""}
                onChange={(e) => setVeri({...veri, baslik: e.target.value})}
                className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border focus:border-[#FFD700] uppercase" 
                placeholder="Örn: Kuşadası Merkezde Lüks Daire"
              />
            </div>
          </div>

          {/* Orta Alan: Seçimler */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Emlak Tipi</label>
              <select 
                className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border"
                value={veri.emlakTipi || ""}
                onChange={(e) => setVeri({...veri, emlakTipi: e.target.value})}
              >
                <option value="">Seçiniz</option>
                <option value="Satılık">Satılık</option>
                <option value="Kiralık">Kiralık</option>
                <option value="Devremülk">Devremülk</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Konut Tipi</label>
              <select 
                className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border"
                value={veri.konutTipi || ""}
                onChange={(e) => setVeri({...veri, konutTipi: e.target.value})}
              >
                <option value="">Seçiniz</option>
                <option value="Daire">Daire</option>
                <option value="İşyeri">İşyeri</option>
                <option value="Villa">Villa</option>
                <option value="Arsa">Arsa</option>
                <option value="Tarla">Tarla</option>
              </select>
            </div>
          </div>

          {/* Dinamik Alanlar (Arsa değilse Oda/Kat/Banyo göster) */}
          {!arsaMi ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Oda Sayısı</label>
                  <select className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border" value={veri.odaSayisi || ""} onChange={(e) => setVeri({...veri, odaSayisi: e.target.value})}>
                    <option value="">Seçiniz</option>
                    {["1+1","2+1","3+1","4+1","5+1","6+1","7+1","8+1"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Bulunduğu Kat</label>
                  <select className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border" value={veri.kat || ""} onChange={(e) => setVeri({...veri, kat: e.target.value})}>
                    <option value="">Seçiniz</option>
                    {[1,2,3,4,5,6].map(k => <option key={k} value={k}>{k}. Kat</option>)}
                    <option value="Zemin Kat">Zemin Kat</option>
                    <option value="Bahçe Katı">Bahçe Katı</option>
                    <option value="Villa Katı">Villa Katı</option>
                    <option value="Bahçe Dubleksi">Bahçe Dubleksi</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Isıtma</label>
                  <select className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border" value={veri.isitma || ""} onChange={(e) => setVeri({...veri, isitma: e.target.value})}>
                    <option value="">Seçiniz</option>
                    <option value="Doğalgaz">Doğalgaz</option>
                    <option value="Yerden Isıtma">Yerden Isıtma</option>
                    <option value="Klima">Klima</option>
                    <option value="Sobalı">Sobalı</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Banyo</label>
                    <select className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border" value={veri.banyo || ""} onChange={(e) => setVeri({...veri, banyo: e.target.value})}>
                      {[1,2,3,4,5].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Site İçi</label>
                    <select className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border" value={veri.siteIci || ""} onChange={(e) => setVeri({...veri, siteIci: e.target.value})}>
                      <option value="Hayır">Hayır</option>
                      <option value="Evet">Evet</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Arsa veya Tarla seçiliyse Ada/Parsel göster */
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Ada</label>
                <input 
                  placeholder="ADA NO"
                  value={veri.ada || ""}
                  onChange={(e) => setVeri({...veri, ada: e.target.value})}
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold border outline-none" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Parsel</label>
                <input 
                  placeholder="PARSEL NO"
                  value={veri.parsel || ""}
                  onChange={(e) => setVeri({...veri, parsel: e.target.value})}
                  className="w-full bg-gray-50 p-4 rounded-2xl font-bold border outline-none" 
                />
              </div>
            </div>
          )}

          {/* Genel Bilgiler: m2, Fiyat, Konum */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Metrekare (m²)</label>
              <input type="number" value={veri.m2 || ""} onChange={(e) => setVeri({...veri, m2: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold border outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">Fiyat (TL)</label>
              <input 
                placeholder="5.000.000"
                value={veri.fiyat || ""}
                onChange={(e) => setVeri({...veri, fiyat: e.target.value})}
                className="w-full bg-gray-50 p-4 rounded-2xl font-bold border outline-none text-green-600" 
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-3 gap-2">
              <select className="bg-gray-50 p-4 rounded-2xl font-bold border outline-none text-xs"><option>İL (AYDIN)</option></select>
              <select className="bg-gray-50 p-4 rounded-2xl font-bold border outline-none text-xs"><option>İLÇE SEÇ</option></select>
              <select className="bg-gray-50 p-4 rounded-2xl font-bold border outline-none text-xs"><option>MAHALLE SEÇ</option></select>
            </div>
          </div>

          {/* Açıklama */}
          <div className="md:col-span-3">
            <label className="text-[10px] font-black text-gray-400 ml-4 uppercase">İlan Açıklaması</label>
            <textarea 
              rows="3"
              value={veri.aciklama || ""}
              onChange={(e) => setVeri({...veri, aciklama: e.target.value})}
              className="w-full bg-gray-50 p-4 rounded-[2rem] font-medium border outline-none italic"
              placeholder="İlan detaylarını buraya yazınız..."
            />
          </div>

          {/* Buton */}
          <div className="md:col-span-3">
            <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-5 rounded-[2rem] font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
              <CreditCard /> İLANI YAYINA AL / GÜNCELLE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenelForm;

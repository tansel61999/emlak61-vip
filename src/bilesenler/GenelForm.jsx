import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2, Save, Trash2 } from 'lucide-react';

const GenelForm = ({ tip, baslik, veri, setVeri, kapat, kaydet, resimYukle, resimYukleniyor }) => {
  // Lokasyon Verileri
  const lokasyonVerisi = {
    "Aydın": {
      "Kuşadası": ["Kadınlar Denizi", "Soğucak", "Ege", "İkiçeşmelik", "Yavansu", "Güzelçamlı", "Davutlar"],
      "Didim": ["Altınkum", "Efeler", "Cumhuriyet", "Mavişehir"],
      "Efeler": ["Mimar Sinan", "Yedi Eylül", "Zeybek"]
    },
    "İzmir": {
      "Çeşme": ["Alaçatı", "Ilıca", "Boyalık", "Reisdere"],
      "Urla": ["İskele", "Zeytinalanı", "Gülbahçe"],
      "Seferihisar": ["Sığacık", "Akarca", "Camikebir"]
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "fiyat") {
      const sadeceSayi = value.replace(/\D/g, "");
      const formatli = new Intl.NumberFormat('tr-TR').format(sadeceSayi);
      setVeri({ ...veri, [name]: formatli });
    } else {
      setVeri({ ...veri, [name]: value });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A192F]/95 backdrop-blur-xl z-[2000] overflow-y-auto font-sans text-[#0A192F]">
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden relative">
          
          {/* HEADER */}
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">{baslik}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">İlan Detaylarını Eksiksiz Doldurunuz</p>
            </div>
            <button onClick={kapat} className="p-3 bg-white text-red-500 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white transition-all">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={kaydet} className="p-8 space-y-8">
            
            {/* RESİM YÜKLEME ALANI */}
            <div className="space-y-4">
              <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} /> Çoklu Resim Ekleme
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="aspect-square rounded-[30px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <input type="file" multiple className="hidden" onChange={(e) => resimYukle(e.target.files)} />
                  {resimYukleniyor ? <Loader2 className="animate-spin text-blue-500" /> : <Plus className="text-gray-300 group-hover:text-blue-500" size={32} />}
                  <span className="text-[9px] font-black text-gray-400 mt-2 uppercase">Görsel Seç</span>
                </label>
                {veri.resimler?.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-[30px] overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setVeri({...veri, resimler: veri.resimler.filter((_, i) => i !== idx)})}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* BAŞLIK VE FİYAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">İlan Başlığı</label>
                <input required name="baslik" value={veri.baslik} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all uppercase placeholder:text-gray-300" placeholder="Örn: Deniz Manzaralı Lüks Daire" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Fiyat (₺)</label>
                <input required name="fiyat" value={veri.fiyat} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-black text-blue-600 text-xl transition-all placeholder:text-gray-300" placeholder="5.000.000" />
              </div>
            </div>

            {/* SEÇİMLİ ALANLAR - SATIR 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Emlak Tipi</label>
                <select name="islemTuru" value={veri.islemTuru} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                  <option value="">Seçiniz</option>
                  <option value="Satılık">Satılık</option>
                  <option value="Kiralık">Kiralık</option>
                  <option value="Devremülk">Devremülk</option>
                  <option value="Arsa">Arsa</option>
                  <option value="Tarla">Tarla</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Konut Tipi</label>
                <select name="emlakTipi" value={veri.emlakTipi} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                  <option value="">Seçiniz</option>
                  <option value="Daire">Daire</option>
                  <option value="İşyeri">İşyeri</option>
                  <option value="Villa">Villa</option>
                  <option value="Müstakil">Müstakil</option>
                  <option value="Arsa">Arsa</option>
                  <option value="Tarla">Tarla</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Oda Sayısı</label>
                <select name="odaSayisi" value={veri.odaSayisi} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                  <option value="">Seçiniz</option>
                  {["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1", "7+1", "8+1"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">M² Alanı</label>
                <input name="m2" value={veri.m2} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase" placeholder="Örn: 150" />
              </div>
            </div>

            {/* SEÇİMLİ ALANLAR - SATIR 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Bulunduğu Kat</label>
                <select name="kat" value={veri.kat} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                  <option value="">Seçiniz</option>
                  {["Zemin Kat", "1", "2", "3", "4", "5", "6", "Bahçe Katı", "Villa Katı", "Bahçe Dubleksi", "Çatı Dubleksi"].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Isıtma</label>
                <select name="isitma" value={veri.isitma} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                  <option value="">Seçiniz</option>
                  <option value="Doğalgaz">Doğalgaz</option>
                  <option value="Yerden Isıtma">Yerden Isıtma</option>
                  <option value="Klima">Klima</option>
                  <option value="Sobalı">Sobalı</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Banyo Sayısı</label>
                <select name="banyo" value={veri.banyo} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                  <option value="">Seçiniz</option>
                  {[1, 2, 3, 4, 5].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Site İçerisinde</label>
                <select name="siteIci" value={veri.siteIci} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                  <option value="">Seçiniz</option>
                  <option value="Evet">Evet</option>
                  <option value="Hayır">Hayır</option>
                </select>
              </div>
            </div>

            {/* LOKASYON ALANI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-blue-50/50 rounded-[30px] border border-blue-100">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 text-blue-400">İl</label>
                  <select name="il" value={veri.il} onChange={handleInputChange} className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                    <option value="">Seçiniz</option>
                    <option value="Aydın">Aydın</option>
                    <option value="İzmir">İzmir</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 text-blue-400">İlçe</label>
                  <select name="ilce" value={veri.ilce} onChange={handleInputChange} className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                    <option value="">Seçiniz</option>
                    {veri.il && Object.keys(lokasyonVerisi[veri.il]).map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 text-blue-400">Mahalle</label>
                  <select name="mahalle" value={veri.mahalle} onChange={handleInputChange} className="w-full p-4 bg-white rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase cursor-pointer">
                    <option value="">Seçiniz</option>
                    {veri.il && veri.ilce && lokasyonVerisi[veri.il][veri.ilce].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
            </div>

            {/* ADA / PARSEL */}
            <div className="grid grid-cols-2 gap-4">
              <input name="ada" value={veri.ada} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase" placeholder="ADA NO" />
              <input name="parsel" value={veri.parsel} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase" placeholder="PARSEL NO" />
            </div>

            {/* AÇIKLAMA */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase ml-2 text-gray-400">İlan Açıklaması</label>
                <textarea name="aciklama" value={veri.aciklama} onChange={handleInputChange} rows={5} className="w-full p-6 bg-gray-50 rounded-[30px] border-2 border-transparent focus:border-blue-500 outline-none font-bold text-xs uppercase transition-all resize-none placeholder:text-gray-300" placeholder="İlan hakkında detaylı bilgi giriniz..."></textarea>
            </div>

            {/* KAYDET BUTONU */}
            <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-6 rounded-[30px] font-black text-sm uppercase tracking-[4px] shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              <Save size={20} /> İLANI YAYINLA / GÜNCELLE
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default GenelForm;

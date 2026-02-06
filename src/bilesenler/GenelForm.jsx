import React from 'react';
import { X, Camera, Loader2 } from 'lucide-react';

const YerelVeri = {
  "Aydın": {
    "Efeler": ["Adnan Menderes", "Mimar Sinan", "Girne", "Cumhuriyet", "Yedi Eylül", "Zeybek"],
    "Kuşadası": ["Türkmen", "İkiçeşmelik", "Kadınlar Denizi", "Soğucak", "Güzelçamlı", "Davutlar", "Ege", "Yavusu Sultan Selim"],
    "Didim": ["Altınkum", "Efeler", "Cumhuriyet", "Mavişehir", "Hisar", "Akyeniköy"],
    "Söke": ["Yenikent", "Atatürk", "Konak", "Cumhuriyet", "Çeltikçi"],
    "Nazilli": ["Altıntaş", "İsabeyli", "Yıldıztepe", "Cumhuriyet", "Turan"]
  },
  "İzmir": {
    "Çeşme": ["Alaçatı", "Ilıca", "Reisdere", "Musalla", "Sakarya"],
    "Bornova": ["Erzene", "Kazımdirik", "Mevlana", "Doğanlar", "Işıklar"],
    "Karşıyaka": ["Bostanlı", "Mavişehir", "Bahçelievler", "Aksoy", "Alaybey"],
    "Konak": ["Güzelyalı", "Alsancak", "Hatay", "Köztepe", "Kahramanlar"],
    "Urla": ["İskele", "Zeytinalanı", "Yelaltı", "Güvendik", "Altıntaş"]
  }
};

const GenelForm = ({ tip, kapat, veri, setVeri, kaydet, baslik, resimYukle, resimYukleniyor }) => {
  
  const fiyatDegis = (e) => {
    const hamDeger = e.target.value.replace(/\D/g, "");
    const formatli = new Intl.NumberFormat('tr-TR').format(hamDeger);
    setVeri({ ...veri, fiyat: formatli });
  };

  const arsaMi = veri.konutTipi === "Arsa" || veri.konutTipi === "Tarla";

  return (
    <div className="fixed inset-0 bg-[#0A192F]/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-white p-8 border-b z-20 flex justify-between items-center">
          <h2 className="text-2xl font-black text-[#0A192F] uppercase">{baslik}</h2>
          <button onClick={kapat} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
        </div>

        <form onSubmit={kaydet} className="p-8 space-y-6">
          
          {/* Resim Yükleme Alanı */}
          <div className="group relative w-full h-40 border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center hover:border-[#FFD700] transition-all cursor-pointer overflow-hidden">
            <input 
              type="file" 
              multiple 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-50" 
              onChange={(e) => {
                if(e.target.files.length > 0) resimYukle(e.target.files);
              }} 
            />
            {resimYukleniyor ? (
              <Loader2 className="animate-spin text-blue-600" size={40} />
            ) : (
              <>
                <Camera size={40} className="text-gray-300 group-hover:text-[#FFD700]" />
                <span className="text-[10px] font-black text-gray-400 mt-2 uppercase">RESİMLERİ SEÇ VEYA SÜRÜKLE</span>
              </>
            )}
          </div>

          {/* Resim Önizleme */}
          <div className="flex gap-2 flex-wrap">
            {veri.resimler?.map((url, index) => (
              <div key={index} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
                <img src={url} className="w-full h-full object-cover" alt="" />
                <button 
                  type="button"
                  onClick={() => setVeri({...veri, resimler: veri.resimler.filter((_, i) => i !== index)})}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select className="p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none"
              value={veri.islemTuru} onChange={e => setVeri({...veri, islemTuru: e.target.value})} required>
              <option value="">İŞLEM TÜRÜ</option>
              <option value="Satılık">SATILIK</option>
              <option value="Kiralık">KİRALIK</option>
            </select>

            <input type="text" placeholder="FİYAT" className="p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
              value={veri.fiyat} onChange={fiyatDegis} required />
          </div>

          <input type="text" placeholder="İLAN BAŞLIĞI" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
            value={veri.baslik} onChange={e => setVeri({...veri, baslik: e.target.value.toUpperCase()})} required />

          {/* Konum Seçimi (İl / İlçe / Mahalle) */}
          <div className="grid grid-cols-3 gap-4">
            <select className="p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
              value={veri.il} onChange={e => setVeri({...veri, il: e.target.value, ilce: "", mahalle: ""})} required>
              <option value="">İL SEÇ</option>
              <option value="Aydın">AYDIN</option>
              <option value="İzmir">İZMİR</option>
            </select>

            <select className="p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
              value={veri.ilce} onChange={e => setVeri({...veri, ilce: e.target.value, mahalle: ""})} disabled={!veri.il} required>
              <option value="">İLÇE SEÇ</option>
              {veri.il && Object.keys(YerelVeri[veri.il]).map(ilce => (
                <option key={ilce} value={ilce}>{ilce.toUpperCase()}</option>
              ))}
            </select>

            <select className="p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
              value={veri.mahalle} onChange={e => setVeri({...veri, mahalle: e.target.value})} disabled={!veri.ilce} required>
              <option value="">MAHALLE SEÇ</option>
              {veri.ilce && YerelVeri[veri.il][veri.ilce].map(mah => (
                <option key={mah} value={mah}>{mah.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select className="p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
              value={veri.konutTipi} onChange={e => setVeri({...veri, konutTipi: e.target.value})} required>
              <option value="">KONUT TİPİ</option>
              <option value="Daire">DAİRE</option>
              <option value="Villa">VİLLA</option>
              <option value="Arsa">ARSA</option>
              <option value="Tarla">TARLA</option>
            </select>
            <input type="text" placeholder="M²" className="p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
              value={veri.m2} onChange={e => setVeri({...veri, m2: e.target.value})} required />
          </div>

          {arsaMi && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <input type="text" placeholder="ADA" className="p-4 bg-yellow-50 rounded-2xl font-bold outline-none border-2 border-yellow-200"
                value={veri.ada} onChange={e => setVeri({...veri, ada: e.target.value})} />
              <input type="text" placeholder="PARSEL" className="p-4 bg-yellow-50 rounded-2xl font-bold outline-none border-2 border-yellow-200"
                value={veri.parsel} onChange={e => setVeri({...veri, parsel: e.target.value})} />
            </div>
          )}

          <textarea placeholder="İLAN AÇIKLAMASI" rows="4" className="w-full p-4 bg-gray-50 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
            value={veri.aciklama} onChange={e => setVeri({...veri, aciklama: e.target.value.toUpperCase()})} required />

          <button type="submit" className="w-full bg-[#0A192F] text-[#FFD700] py-5 rounded-3xl font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all uppercase">
            {resimYukleniyor ? "RESİMLER YÜKLENİYOR..." : "İLANLARI KAYDET VE YAYINLA"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GenelForm;

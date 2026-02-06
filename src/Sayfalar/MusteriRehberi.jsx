import React, { useState } from 'react';
import { UserPlus, Phone, MessageCircle, Search, Filter } from 'lucide-react';

const MusteriRehberi = () => {
  const [arama, setArama] = useState("");

  // Örnek Veri
  const musteriler = [
    { id: 1, ad: "Örnek Müşteri", tel: "5051234567", not: "Kuşadası merkezde 2+1 bakıyor." }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="İsim veya numara ile ara..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
            onChange={(e) => setArama(e.target.value)}
          />
        </div>
        <button className="ml-4 bg-[#0A192F] text-[#FFD700] px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition">
          <UserPlus size={20} /> Yeni Müşteri
        </button>
      </div>

      <div className="grid gap-3">
        {musteriler.map((m) => (
          <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-[#0A192F] font-bold text-xl">
                {m.ad[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{m.ad}</h3>
                <p className="text-gray-500 text-sm">{m.not}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href={`tel:${m.tel}`} className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition">
                <Phone size={20} />
              </a>
              <a href={`https://wa.me/90${m.tel}`} target="_blank" className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusteriRehberi;
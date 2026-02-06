import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Arsiv = () => {
  const [arsivIlanlar, setArsivIlanlar] = useState([]);
  const db = getFirestore();

  const arsivGetir = async () => {
    const q = query(collection(db, "ilanlar"), where("durum", "in", ["Satıldı", "Pasif"]));
    const querySnapshot = await getDocs(q);
    setArsivIlanlar(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { arsivGetir(); }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0A192F]">İLAN ARŞİVİ</h2>
      <div className="grid gap-4">
        {arsivIlanlar.map(ilan => (
          <div key={ilan.id} className="bg-white p-4 rounded shadow flex justify-between border-l-4 border-orange-500">
            <span>{ilan.baslik}</span>
            <span className={`font-bold ${ilan.durum === 'Satıldı' ? 'text-green-600' : 'text-red-600'}`}>
              {ilan.durum.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Arsiv;

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Giris from './Sayfalar/Giris'; 
// AnaPanel yerine Navigasyon'u doğru klasörden çağırıyoruz:
import Navigasyon from './Bilesenler/Navigasyon';

const App = () => {
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const abonelik = onAuthStateChanged(auth, (user) => {
      setKullanici(user);
      setYukleniyor(false);
    });
    return () => abonelik();
  }, [auth]);

  if (yukleniyor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <div className="text-[#FFD700] font-black animate-pulse text-2xl tracking-tighter">
          EMLAK61 YÜKLENİYOR...
        </div>
      </div>
    );
  }

  // Kullanıcı varsa Navigasyon'u, yoksa Giriş sayfasını göster
  return kullanici ? <Navigasyon /> : <Giris />;
};

export default App;

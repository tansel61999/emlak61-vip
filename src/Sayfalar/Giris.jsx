import React from 'react';
// Dosya yolunun ve isminin tam eşleştiğinden emin oluyoruz
import { yetki } from '../firebaseYapilandirma';
import Giris from './sayfalar/Giris';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const Giris = () => {
  const googleIleGiris = async () => {
    try {
      // Oturumu temizle
      await signOut(yetki);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await signInWithPopup(yetki, provider);
    } catch (hata) {
      console.error("Giriş hatası:", hata);
      if (hata.code !== 'auth/cancelled-popup-request') {
        alert("Giriş başarısız!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center p-4">
      {/* VERCEL CANLI TEST LOGOSU */}
      <div className="mb-6 bg-red-600 text-white px-8 py-3 rounded-full font-black animate-bounce shadow-2xl border-4 border-white">
        EMLAK61 VIP: VERCEL AKTİF ✅
      </div>

      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md text-center border-[8px] border-white/10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#0A192F] mb-2 tracking-tighter italic">
            EMLAK61 <span className="text-amber-500 italic">VIP</span>
          </h1>
          <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-400 font-bold text-xs uppercase tracking-widest">Danışman Yönetim Paneli</p>
        </div>

        <button
          onClick={googleIleGiris}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 p-5 rounded-[24px] font-black text-gray-700 hover:bg-gray-50 hover:border-amber-500 transition-all shadow-sm group"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
            className="w-6 h-6 group-hover:scale-110 transition-transform"
          />
          GOOGLE İLE GİRİŞ YAP
        </button>

        <p className="mt-8 text-[10px] text-gray-300 font-bold uppercase tracking-tighter leading-relaxed">
          Sadece yetkilendirilmiş kurumsal e-posta adresleri <br /> ile giriş yapılabilir.
        </p>
      </div>
    </div>
  );
};

export default Giris;

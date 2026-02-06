import React from 'react';
import { yetki } from '../firebaseYapilandirma';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const Giris = () => {
  const googleIleGiris = async () => {
    try {
      // Önce mevcut oturum kalıntılarını temizle (Zorunlu)
      await signOut(yetki);

      const googleSaglayici = new GoogleAuthProvider();
      
      // Her seferinde hesap seçme penceresini zorunlu hale getirir
      googleSaglayici.setCustomParameters({
        prompt: 'select_account',
        // Ekstra güvenlik: Tarayıcıya bu girişin "taze" olduğunu söyler
        auth_type: 'reauthenticate'
      });

      await signInWithPopup(yetki, googleSaglayici);
    } catch (hata) {
      console.error("Giriş hatası:", hata);
      // Kullanıcı pencereyi kapatırsa hata vermemesi için kontrol
      if (hata.code !== 'auth/cancelled-popup-request') {
        alert("Giriş başarısız!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center p-4">
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

import { useState } from 'react';
import { Heart, Coffee, Globe, Check } from 'lucide-react';

export default function Support() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('apineu.live');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-border p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart size={40} className="text-pink-500 fill-current" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-main mb-4 tracking-tight">
          關於我們與聯絡
        </h1>
        <p className="text-lg text-text-sub mb-8 leading-relaxed">
          您可以透過這個網站，更方便地探索桃園的美。
          如果您喜歡我們的服務，歡迎透過以下方式支持我們處理伺服器與資料庫的營運成本。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <a
            href="https://apineu.lemonsqueezy.com/checkout/buy/eb1274d9-a71a-4cb3-8aa9-b08a0b6fb998"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-[#FFDD00] text-gray-900 px-6 py-4 rounded-xl font-bold hover:bg-[#ffc800] transition-colors shadow-sm"
          >
            <Coffee size={24} />
            Buy Me A Coffee
          </a>
          
          <button 
            onClick={handleCopy}
            className="flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm"
          >
            {copied ? <Check size={24} className="text-green-400" /> : <Globe size={24} />}
            {copied ? '已複製 apineu.live' : '分享給好朋友'}
          </button>
        </div>

        <div className="text-left bg-blue-50 border border-blue-100 p-6 rounded-2xl">
           <h3 className="text-lg font-bold text-blue-900 mb-2">🤝 商業合作與聯繫</h3>
           <p className="text-blue-800 text-sm mb-4">
             如果您是桃園在地的店家、觀光工廠或是民宿業者，想要將您的資訊收錄至「桃園趣哪玩」，或是探討網站廣告版位合作，歡迎與我們聯繫。
           </p>
           <a href="mailto:cvhh57466@gmail.com" className="text-blue-600 font-bold hover:underline">cvhh57466@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

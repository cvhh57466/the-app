import { Link } from 'react-router-dom';
import { Map, MapPin } from 'lucide-react';
import AdBanner from '../components/AdBanner';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "桃園趣哪玩 | Taoyuan Explorer",
    "url": "https://apineu.live/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://apineu.live/explore?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "description": "收錄桃園超過 400 個精彩景點，包含踏青、親子、美食、夜景與歷史古蹟。為您量身打造最佳的桃園旅遊行程。"
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Helmet>
        <title>桃園趣哪玩 | 桃園最齊全在地旅遊指南</title>
        <meta name="description" content="桃園趣哪玩收錄了桃園超過 400 個精彩景點。不用做功課，我們根據您的偏好，推薦桃園秘境、美食、踏青與住宿行程，馬上說走就走！" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center bg-slate-900 border-b border-border">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 opacity-40 bg-center bg-cover"
          style={{ backgroundImage: 'url(https://travel.tycg.gov.tw/content/images/static/pic-search-cover.jpg)' }}
        ></div>
        <div className="relative z-10 text-center px-4 flex flex-col items-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            桃園，說走就走
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">
            不想做功課？讓我們為你挑選桃園最棒的秘境、美食與住宿，打開地圖，立刻找到好去處。
          </p>
          <Link 
            to="/explore" 
            className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary-dark transition-all transform hover:-translate-y-1 shadow-lg"
          >
            <Map size={24} />
            馬上開始探索
          </Link>
        </div>
      </section>

      {/* Recommended Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-text-main mb-8 text-center">熱門主題推薦</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           <div className="bg-white rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🌲</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">週末爬山去</h3>
              <p className="text-text-sub mb-4 text-sm leading-relaxed">桃園有豐富的復興鄉山林步道與觀音山系，適合全家大小一起親近大自然。</p>
              <Link to="/explore" className="text-primary font-bold text-sm hover:underline">查看景點 →</Link>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">👪</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">親子大放電</h3>
              <p className="text-text-sub mb-4 text-sm leading-relaxed">特色公園、室內觀光工廠、農場體驗，假日不知道帶小孩去哪？看這裡就對了。</p>
              <Link to="/explore" className="text-primary font-bold text-sm hover:underline">查看景點 →</Link>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🍜</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">在地老饕必吃</h3>
              <p className="text-text-sub mb-4 text-sm leading-relaxed">從中壢夜市到大溪老街，收錄超過 50 間桃園在地人狂推的隱藏版美食。</p>
              <Link to="/explore" className="text-primary font-bold text-sm hover:underline">查看景點 →</Link>
           </div>

        </div>
      </section>

      {/* AdSense Placement: Home Bottom */}
      <section className="pb-16 px-4 max-w-6xl mx-auto">
        <div className="bg-slate-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
          <p className="text-xs text-text-sub mb-2">Google 贊助廣告</p>
          <AdBanner 
            dataAdSlot="6944583842" 
            className="min-h-[100px]"
          />
        </div>
      </section>
    </div>
  );
}

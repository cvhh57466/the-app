import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Compass, RefreshCw, X, Map as MapIcon } from 'lucide-react';
import { attractions, Attraction } from './data';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icons in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// --- 地理距離演算函式 (Haversine formula) ---
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 可選的分類
const CATEGORIES = ["踏青", "美食", "騎車", "藝文", "親子", "購物", "夜景", "歷史"];
const MAX_DISTANCE_OPTIONS = [
  { label: '3 公里', value: 3 },
  { label: '5 公里', value: 5 },
  { label: '10 公里', value: 10 },
  { label: '20 公里', value: 20 },
  { label: '全部範圍', value: Infinity }
];

const TAOYUAN_DISTRICTS = [
  { name: "桃園區", lat: 24.9936, lng: 121.3009 },
  { name: "中壢區", lat: 24.9653, lng: 121.2246 },
  { name: "平鎮區", lat: 24.9458, lng: 121.2183 },
  { name: "八德區", lat: 24.9287, lng: 121.2846 },
  { name: "楊梅區", lat: 24.9046, lng: 121.1456 },
  { name: "蘆竹區", lat: 25.0450, lng: 121.2882 },
  { name: "大溪區", lat: 24.8805, lng: 121.2868 },
  { name: "龍潭區", lat: 24.8638, lng: 121.2118 },
  { name: "龜山區", lat: 24.9859, lng: 121.3384 },
  { name: "大園區", lat: 25.0645, lng: 121.1969 },
  { name: "觀音區", lat: 25.0333, lng: 121.0760 },
  { name: "新屋區", lat: 24.9754, lng: 121.1030 },
  { name: "復興區", lat: 24.8229, lng: 121.3556 }
];

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(Infinity);
  const [userLocation, setUserLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  
  const [results, setResults] = useState<Attraction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // 地圖點擊事件處理
  function LocationPicker() {
    useMapEvents({
      click(e) {
        setUserLocation({
          name: '自訂圖釘位置',
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
        setIsMapModalOpen(false); // 選好就關閉地圖
      },
    });
    return userLocation ? (
      <Marker position={[userLocation.lat, userLocation.lng]} />
    ) : null;
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setResults([]);

    setTimeout(() => {
      let filtered = attractions;

      if (selectedCategories.length > 0) {
        filtered = filtered.filter(item => 
          item.categories.some(cat => selectedCategories.includes(cat))
        );
      }

      if (userLocation && maxDistance !== Infinity) {
        filtered = filtered.filter(item => {
          const dist = getDistanceInKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
          return dist <= maxDistance;
        });
      }

      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      setResults(shuffled.slice(0, 5));
      setIsGenerating(false);
    }, 600);
  }, [selectedCategories, maxDistance, userLocation]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg text-text-main font-sans">
      {/* Header */}
      <header className="h-[70px] bg-white border-b border-border flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Compass size={20} />
          </div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">桃園趣哪玩</h1>
        </div>
        <div className="text-sm text-text-sub hidden sm:block">
          資料庫已載入 {attractions.length} 個精選景點
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-[280px] bg-white border-b md:border-r border-border p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
          {/* Filter Group: Distance */}
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-semibold text-text-sub uppercase tracking-[0.5px]">從哪裡出發？</span>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-3 bg-white border border-border text-text-main text-[13px] font-medium rounded-lg shadow-sm hover:border-primary transition-colors text-left"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MapIcon size={16} className="text-primary shrink-0" />
                  <span className="truncate">
                    {userLocation ? userLocation.name : "全桃園 (不設定起點)"}
                  </span>
                </div>
                <span className="text-primary text-[11px] bg-primary/10 px-2 py-0.5 rounded font-bold shrink-0">
                  打開地圖
                </span>
              </button>
              
              {userLocation && (
                <button 
                  onClick={() => {
                    setUserLocation(null);
                    setMaxDistance(Infinity);
                  }}
                  className="text-[12px] text-text-sub hover:text-red-500 text-left pl-1 transition-colors"
                >
                  清除起點
                </button>
              )}
            </div>

            {userLocation && (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[12px] font-semibold text-text-sub">搜尋範圍</span>
                <div className="flex flex-wrap gap-2">
                  {MAX_DISTANCE_OPTIONS.map(opt => {
                    const isActive = maxDistance === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setMaxDistance(opt.value)}
                        className={`px-3 py-1.5 rounded-[20px] text-[13px] cursor-pointer border transition-all ${
                          isActive
                            ? 'bg-primary border-primary text-white'
                            : 'bg-bg border-transparent hover:border-border text-text-main'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Filter Group: Categories */}
          <div className="flex flex-col gap-3">
             <span className="text-[14px] font-semibold text-text-sub uppercase tracking-[0.5px]">分類篩選</span>
             <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const isActive = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-[20px] text-[13px] cursor-pointer border transition-all ${
                      isActive 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-bg border-transparent hover:border-border text-text-main'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer with Ad */}
          <div className="mt-auto pt-5 mt-4 border-t border-border hidden md:block">
            <div className="w-full h-[180px] bg-bg rounded-lg flex items-center justify-center text-slate-400 text-xs border border-border">
              贊助商廣告空間
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f8fafc] overflow-y-auto">
          {/* Top Banner Ad */}
          <div className="w-full h-[90px] bg-[#e2e8f0] rounded-xl border-2 border-dashed border-[#cbd5e1] flex items-center justify-center text-[#94a3b8] text-sm shrink-0">
            廣告投放區域 (Banner 970x90)
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-text-main">為您推薦 5 個好去處</h2>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-7 py-3.5 bg-primary text-white border-none rounded-xl text-lg font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_10px_15px_-3px_rgba(59,130,246,0.3)] hover:bg-primary-dark transition-colors active:scale-95 whitespace-nowrap"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : '🎲'}
              {isGenerating ? '尋找景點中...' : '隨機生成景點'}
            </button>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 flex-1 content-start">
            <AnimatePresence mode="popLayout">
              {results.length === 0 && !isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="col-span-full h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400"
                >
                  <Compass size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg">點擊產生按鈕開始探索桃園！</p>
                </motion.div>
              ) : results.length === 0 && isGenerating ? (
                <div className="col-span-full h-full min-h-[300px] flex items-center justify-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
              ) : null}

              {results.map((item, index) => {
                const distance = userLocation 
                  ? getDistanceInKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
                  : null;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card-bg rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-border flex flex-col gap-3 relative group"
                  >
                    <div className="w-full h-[120px] bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={`https://picsum.photos/seed/${item.id}/400/300`} 
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-[18px] font-extrabold text-text-main mb-2 leading-tight tracking-wide">{item.name}</h3>
                      <p className="text-[13px] text-text-sub leading-[1.5] line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-2 flex justify-between items-center bg-card-bg">
                      {distance !== null ? (
                        <span className="text-[12px] font-bold text-accent">
                          距離 {distance.toFixed(1)}km
                        </span>
                      ) : (
                        <span className="text-[12px] text-text-sub flex items-center gap-1 font-bold">
                          <MapPin size={12}/> {item.categories[0]}
                        </span>
                      )}
                      
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-primary text-primary text-[12px] font-semibold hover:bg-primary hover:text-white transition-colors text-center"
                      >
                        Google Map
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {isMapModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-white">
                <div>
                  <h3 className="font-bold text-text-main text-lg">選擇出發地</h3>
                  <p className="text-xs text-text-sub">點擊地圖上的任意位置設定大頭針</p>
                </div>
                <button 
                  onClick={() => setIsMapModalOpen(false)}
                  className="p-2 bg-bg hover:bg-slate-200 rounded-full text-text-main transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 w-full bg-slate-100 relative">
                <MapContainer 
                  center={userLocation ? [userLocation.lat, userLocation.lng] : [24.9936, 121.3009]} 
                  zoom={12} 
                  style={{ width: '100%', height: '100%', zIndex: 10 }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker />
                </MapContainer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Compass, RefreshCw, X, Map as MapIcon, Database, Grid, MapPinned, Info, Tag, Clock, Ticket, SlidersHorizontal } from 'lucide-react';
import { Attraction } from '../data';
import { db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import AdBanner from '../components/AdBanner';
import { Helmet } from 'react-helmet-async';

// Fix leaflet default icons in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const isValidCoord = (lat: any, lng: any) => {
  const llat = Number(lat);
  const llng = Number(lng);
  return !isNaN(llat) && !isNaN(llng);
};

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

// 可選的分類 - 恢復原本乾淨、直覺的固定分類選單
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

export default function Explore() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(Infinity);
  const [userLocation, setUserLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  
  const [dbAttractions, setDbAttractions] = useState<Attraction[]>([]);
  const [results, setResults] = useState<Attraction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 取得目前資料庫中所有的情境標籤
  const availableContexts = Array.from(new Set(dbAttractions.flatMap(a => a.contextTags || []))).sort();

  // 一進來網頁先掛載 Firebase 資料庫即時連線
  useEffect(() => {
    const q = query(collection(db, 'attractions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Attraction[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Attraction);
      });
      setDbAttractions(data);
      
      // 如果是最一開始載入，我們從抓到的資料隨機推 5 個
      if (isInitializing && data.length > 0) {
        setResults([...data].sort(() => 0.5 - Math.random()).slice(0, 5));
        setIsInitializing(false);
      }
    }, (error) => {
      console.error("載入 Firebase 資料失敗:", error);
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [isInitializing]);

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
    return userLocation && isValidCoord(userLocation.lat, userLocation.lng) ? (
      <Marker position={[Number(userLocation.lat), Number(userLocation.lng)]} />
    ) : null;
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleContext = (ctx: string) => {
    setSelectedContexts(prev => 
      prev.includes(ctx) ? prev.filter(c => c !== ctx) : [...prev, ctx]
    );
  };

  const handleGenerate = useCallback(() => {
    if (dbAttractions.length === 0) return;
    setIsGenerating(true);
    setResults([]);

    setTimeout(() => {
      let filtered = [...dbAttractions];

      if (selectedCategories.length > 0) {
        filtered = filtered.filter(item => 
          item.categories.some(cat => selectedCategories.includes(cat))
        );
      }

      if (selectedContexts.length > 0) {
        filtered = filtered.filter(item => 
          item.contextTags && item.contextTags.some(ctx => selectedContexts.includes(ctx))
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
  }, [selectedCategories, selectedContexts, maxDistance, userLocation, dbAttractions]);

  function ResultMapBounds({ markers }: { markers: Attraction[] }) {
    const map = useMap();
    useEffect(() => {
      const validMarkers = markers.filter(m => isValidCoord(m.lat, m.lng));
      if (validMarkers.length > 0) {
        const bounds = L.latLngBounds(validMarkers.map(m => [Number(m.lat), Number(m.lng)]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [markers, map]);
    return null;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "探索桃園景點 | 桃園趣哪玩",
    "description": "透過智能篩選，找出桃園在地最適合您的旅遊點。",
    "url": "https://apineu.live/explore"
  };

  return (
    <>
      <Helmet>
        <title>在地景點地圖 - 美食、踏青、打卡名單 | 桃園趣哪玩</title>
        <meta name="description" content="在地最強的桃園景點地圖！無論是踏青、約會、賞夜景還是室內避雨，依照您的距離與偏好立刻產生 5 個熱門或私房行程。馬上安排您的桃園一日遊！" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden bg-white border-b border-border p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-primary" />
            <span className="font-bold text-text-main text-sm">篩選條件 ({(selectedCategories.length + selectedContexts.length) > 0 ? selectedCategories.length + selectedContexts.length : '全部'})</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            {isSidebarOpen ? '隱藏' : '展開'}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'flex max-h-[40vh] border-b border-border' : 'hidden'} md:flex w-full md:w-[280px] md:max-h-none bg-white md:border-b-0 md:border-r border-border p-6 flex-col gap-6 shrink-0 overflow-y-auto`}>
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
                        ? 'bg-primary border-primary text-white shadow-sm' 
                        : 'bg-bg border-transparent hover:border-border text-text-main'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Group: Contexts (Tags) */}
          {availableContexts.length > 0 && (
            <div className="flex flex-col gap-3">
               <span className="text-[14px] font-semibold text-text-sub uppercase tracking-[0.5px]">情境篩選</span>
               <div className="flex flex-wrap gap-2">
                {availableContexts.map(ctx => {
                  const isActive = selectedContexts.includes(ctx);
                  return (
                    <button
                      key={ctx}
                      onClick={() => toggleContext(ctx)}
                      className={`px-3 py-1.5 rounded-[20px] text-[13px] cursor-pointer border transition-all ${
                        isActive 
                          ? 'bg-accent border-accent text-white shadow-sm' 
                          : 'bg-bg border-transparent hover:border-border text-text-main'
                      }`}
                    >
                      # {ctx}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-[#f8fafc] overflow-y-auto">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-text-main">為您推薦 5 個好去處</h2>
                <span className="text-xs bg-accent/10 border border-accent/20 text-accent px-2 py-1 rounded flex items-center gap-1 font-semibold">
                   <Database size={12} />
                   ({dbAttractions.length})
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-border self-start">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-bg text-primary shadow-sm' : 'text-text-sub hover:text-text-main'}`}
                >
                  <Grid size={16} /> 網格模式
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-bg text-primary shadow-sm' : 'text-text-sub hover:text-text-main'}`}
                >
                  <MapPinned size={16} /> 地圖模式
                </button>
              </div>
            </div>
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
              {isInitializing ? (
                <div className="col-span-full h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400">
                   <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                   <p className="text-sm">正在從雲端載入最新景點資料庫...</p>
                </div>
              ) : results.length === 0 && !isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="col-span-full h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400"
                >
                  <Compass size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg">找不到符合條件的景點，請試著放寬篩選條件！</p>
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
                  <React.Fragment key={item.id}>
                    <Helmet>
                      <script type="application/ld+json">
                        {JSON.stringify({
                          "@context": "https://schema.org",
                          "@type": "TouristAttraction",
                          "name": item.name,
                          "description": item.description,
                          "image": item.imageUrl,
                          "geo": {
                            "@type": "GeoCoordinates",
                            "latitude": item.lat,
                            "longitude": item.lng
                          }
                        })}
                      </script>
                    </Helmet>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card-bg rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-border flex flex-col gap-3 relative group"
                    >
                      <div 
                        className="w-full h-[140px] bg-slate-100 rounded-lg overflow-hidden shrink-0 cursor-pointer relative"
                        onClick={() => setSelectedAttraction(item)}
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap pr-2">
                          {item.contextTags?.slice(0,2).map(tag => (
                            <span key={tag} className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-sm">#{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                         <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 
                              className="text-[18px] font-extrabold text-text-main leading-tight tracking-wide cursor-pointer hover:text-primary transition-colors"
                              onClick={() => setSelectedAttraction(item)}
                            >
                              {item.name}
                            </h3>
                         </div>
                        <p className="text-[13px] text-text-sub leading-[1.5] line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-2 flex justify-between items-center bg-card-bg">
                        <div className="flex items-center gap-2">
                          {distance !== null && (
                            <span className="text-[12px] font-bold text-accent bg-accent/10 px-2 py-1 rounded">
                              {distance.toFixed(1)}km
                            </span>
                          )}
                          <span className="text-[12px] text-text-sub flex items-center gap-1 font-bold">
                             {item.categories[0]}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => setSelectedAttraction(item)}
                          className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-[12px] font-semibold hover:bg-primary/10 transition-colors flex items-center gap-1"
                        >
                          <Info size={14}/> 詳情
                        </button>
                      </div>
                    </motion.div>
                    
                    {/* 穿插在景點之間的廣告：放在第2個景點之後 (填補版面) */}
                    {index === 1 && viewMode === 'grid' && (
                      <motion.div
                        key="in-feed-ad"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 + 0.05 }}
                        className="bg-slate-50 rounded-2xl p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden"
                      >
                         <p className="text-[11px] text-text-sub bg-white/80 px-2 py-0.5 rounded-bl-lg absolute top-0 right-0 z-10 backdrop-blur-sm">廣告贊助</p>
                         <div className="w-full h-full min-h-[250px] flex items-center justify-center pt-2">
                           <AdBanner 
                              dataAdSlot="6944583842" 
                              className="w-full h-full"
                              dataAdFormat="fluid"
                           />
                         </div>
                      </motion.div>
                    )}
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Map View Mode */}
          {viewMode === 'map' && results.length > 0 && !isGenerating && (
            <motion.div 
               initial={{opacity: 0, y: 20}}
               animate={{opacity: 1, y: 0}}
               className="w-full h-full min-h-[400px] border border-border rounded-xl overflow-hidden shadow-sm relative z-0"
               style={{ marginTop: '-1.25rem' }} // Pull up slightly over the empty grid
            >
              <MapContainer 
                center={
                  userLocation && isValidCoord(userLocation.lat, userLocation.lng) 
                    ? [Number(userLocation.lat), Number(userLocation.lng)] 
                    : isValidCoord(results[0]?.lat, results[0]?.lng)
                      ? [Number(results[0].lat), Number(results[0].lng)]
                      : [24.9936, 121.3009]
                } 
                zoom={12} 
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <ResultMapBounds markers={results} />
                {userLocation && isValidCoord(userLocation.lat, userLocation.lng) && (
                   <Marker position={[Number(userLocation.lat), Number(userLocation.lng)]}>
                      {/* You can customize user marker icon here if needed */}
                   </Marker>
                )}
                {results.filter(item => isValidCoord(item.lat, item.lng)).map(item => (
                   <Marker 
                     key={item.id} 
                     position={[Number(item.lat), Number(item.lng)]}
                     eventHandlers={{
                       click: () => setSelectedAttraction(item)
                     }}
                   >
                     {/* Popup is removed to trigger detail modal directly */}
                   </Marker>
                ))}
              </MapContainer>
            </motion.div>
          )}
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
                  center={userLocation && isValidCoord(userLocation.lat, userLocation.lng) ? [Number(userLocation.lat), Number(userLocation.lng)] : [24.9936, 121.3009]} 
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAttraction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAttraction(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
            >
              <div className="relative h-64 sm:h-80 shrink-0 bg-slate-100">
                <img 
                  src={selectedAttraction.imageUrl} 
                  alt={selectedAttraction.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedAttraction(null)}
                  className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-md hover:bg-black/50 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
                <div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {selectedAttraction.categories.map(c => <span key={c} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold">{c}</span>)}
                    {selectedAttraction.contextTags?.map(t => <span key={t} className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-md font-bold flex items-center gap-1"><Tag size={12}/>{t}</span>)}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main mb-2 tracking-tight">{selectedAttraction.name}</h2>
                </div>

                <div className="flex flex-col gap-4 bg-bg p-4 rounded-xl border border-border">
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-text-main mb-0.5">營業時間</h4>
                      <p className="text-sm text-text-sub">{selectedAttraction.hours || "依官方公告為主"}</p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-border"></div>
                  <div className="flex items-start gap-3">
                    <Ticket size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-text-main mb-0.5">門票資訊</h4>
                      <p className="text-sm text-text-sub">{selectedAttraction.ticketInfo || "免費或依現場為主"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-text-main mb-2">景點介紹</h4>
                  <p className="text-[15px] text-text-sub leading-relaxed whitespace-pre-wrap">
                    {selectedAttraction.description}
                  </p>
                </div>

                {userLocation && (
                  <div className="bg-accent/5 p-4 rounded-xl border border-accent/20 flex justify-between items-center">
                    <span className="text-sm font-bold text-text-main">距離您目前設定的出發地</span>
                    <span className="text-lg font-extrabold text-accent">
                      {getDistanceInKm(userLocation.lat, userLocation.lng, selectedAttraction.lat, selectedAttraction.lng).toFixed(1)} 公里
                    </span>
                  </div>
                )}
                
                  <div className="pt-4 border-t border-border mt-auto">
                   <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAttraction.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-4 bg-primary text-white rounded-xl text-[15px] font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin size={18} /> 開啟 Google Maps 導航
                    </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


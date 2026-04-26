import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';
import { MapPin, ArrowLeft, Navigation } from 'lucide-react';
import AdBanner from '../components/AdBanner';

interface Attraction {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  lat: number;
  lng: number;
  categories: string[];
}

export default function AttractionDetail() {
  const { id } = useParams<{ id: string }>();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttraction = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'attractions', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAttraction({ id: docSnap.id, ...docSnap.data() } as Attraction);
        }
      } catch (error) {
        console.error("Error fetching attraction:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttraction();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-sub">
        <h1 className="text-2xl font-bold mb-4">找不到此景點</h1>
        <Link to="/explore" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> 返回探索
        </Link>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": attraction.name,
    "description": attraction.description,
    "image": attraction.imageUrl,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Taoyuan City",
      "addressRegion": "TAO",
      "addressCountry": "TW",
      "streetAddress": attraction.address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": attraction.lat,
      "longitude": attraction.lng
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg-main">
      <Helmet>
        <title>{attraction.name} - 桃園景點推薦 | 桃園趣哪玩</title>
        <meta name="description" content={`【${attraction.name}】${attraction.description?.substring(0, 100)}... 快來桃園趣哪玩看看！`} />
        <meta property="og:title" content={`${attraction.name} | 桃園趣哪玩`} />
        <meta property="og:description" content={attraction.description} />
        {attraction.imageUrl && <meta property="og:image" content={attraction.imageUrl} />}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Link to="/explore" className="inline-flex items-center gap-2 text-text-sub hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> 返回探索
        </Link>
        
        <div className="bg-bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          {attraction.imageUrl && (
            <div className="w-full h-64 md:h-96 relative">
              <img 
                src={attraction.imageUrl} 
                alt={attraction.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {attraction.categories?.map(cat => (
                <span key={cat} className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {cat}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-4">{attraction.name}</h1>
            
            <div className="flex items-start gap-2 text-text-sub mb-8">
              <MapPin size={18} className="mt-0.5 flex-shrink-0" />
              <p>{attraction.address || "無詳細地址資訊"}</p>
            </div>
            
            <div className="prose prose-slate max-w-none text-text-main mb-8">
              <p className="whitespace-pre-wrap leading-relaxed text-lg">
                {attraction.description}
              </p>
            </div>
            
            <div className="flex gap-4 border-t border-border pt-6">
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${attraction.lat},${attraction.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-hover font-medium transition-colors"
              >
                <Navigation size={18} />
                導航前往
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <AdBanner className="mt-4" />
        </div>
      </div>
    </div>
  );
}

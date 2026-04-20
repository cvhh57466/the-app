import { useEffect, useRef } from 'react';

interface AdBannerProps {
  dataAdSlot: string;     // 您在 Google AdSense 後台建立的廣告單元 ID
  dataAdFormat?: string;
  dataFullWidthResponsive?: string;
  className?: string;
}

export default function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = 'true',
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    let isPushed = false;

    // 建立一個 ResizeObserver 來監聽廣告區塊的大小變化
    // 只有當區塊擁有實際寬度（不為 0，不是 display: none 隱藏狀態）時再推播廣告
    const observer = new ResizeObserver(() => {
      if (adRef.current && adRef.current.clientWidth > 0 && !isPushed) {
        try {
          if (!adRef.current.getAttribute('data-adsbygoogle-status')) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            isPushed = true;
            observer.disconnect(); // 成功推播後就停止監聽
          }
        } catch (err) {
          console.error('AdSense initialization error:', err);
        }
      }
    });

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`w-full overflow-hidden flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-9923151438975549" // 這是您在 index.html 的 Publisher ID
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
}

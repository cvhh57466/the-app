export default function PrivacyPolicy() {
  return (
    <div className="flex-1 overflow-y-auto bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6">隱私權政策 (Privacy Policy)</h1>
        <p className="text-sm text-gray-500 mb-8">最後更新日期：2026年4月</p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">1. 資料收集</h3>
            <p className="text-gray-700 leading-relaxed">本網站「桃園趣哪玩」不會主動收集使用者的個人敏感資訊。當您使用「開啟地圖定位」功能時，您的地理位置資訊僅會在您的瀏覽器端進行距離計算，並不會儲存至我們的伺服器。</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">2. 廣告與 Cookie</h3>
            <p className="text-gray-700 leading-relaxed">我們使用第三方廣告服務（如 Google AdSense）在網站上放送廣告。這些公司可能會使用與您瀏覽本網站和其他網站有關的資訊（<strong>不包含</strong>您的姓名、地址、電子郵件地址或電話號碼），以便提供您感興趣之產品與服務的廣告。為此，第三方廠商（包括 Google）會使用 Cookie 放送廣告。</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">3. Firebase Analytics 分析</h3>
            <p className="text-gray-700 leading-relaxed">本站可能使用 Google Analytics (Firebase) 追蹤匿名流量數據，用以改善網站的使用體驗。</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">4. 聯絡我們</h3>
            <p className="text-gray-700 leading-relaxed">若對本隱私權政策有任何疑問，請聯繫：cvhh57466@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div className="flex-1 overflow-y-auto bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6">使用者條款 (Terms of Service)</h1>
        <p className="text-sm text-gray-500 mb-8">最後更新日期：2026年4月</p>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">1. 網站服務說明</h3>
            <p className="text-gray-700 leading-relaxed">「桃園趣哪玩」是一個提供桃園旅遊景點、美食與住宿資訊的彙整平台。我們的資料來源主要基於政府開放資料（例如：桃園市政府資料開放平台）與公開資訊整理而成。</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">2. 免責聲明</h3>
            <p className="text-gray-700 leading-relaxed">本網站力求資訊的準確性，包含但不限於：地點營業時間、門票價格與精確的 GPS 座標。然而，由於資訊可能隨時間變動，我們<strong>不保證</strong>所有資料皆為最新且無誤。使用者在前往景點前，請務必自行至官方網站或透過電話做最終確認。本網站對於使用者因依賴本網站資訊而造成的任何直接、間接損失概不負責。</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">3. 外部連結</h3>
            <p className="text-gray-700 leading-relaxed">本網站可能包含第三方網站（如 Google Maps）的連結。點擊這些連結代表您將離開本網站。這些第三方網站的內容與隱私權規範不屬本站管轄範圍，我們對其內容與政策不承擔任何責任。</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">4. 修改與終止</h3>
            <p className="text-gray-700 leading-relaxed">我們保留隨時修改網站內容、暫停或終止部分或全部服務的權利，恕不另行通知。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Settings } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // セッション情報を取得（オプション）
      fetch(`/api/checkout-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSessionData(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen fortnite-bg flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card-enhanced p-12 rounded-xl">
            {/* 成功アイコン */}
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>

            {/* メインメッセージ */}
            <h1 className="text-4xl font-black text-white mb-6">
              🎉 購入完了！
            </h1>
            <p className="text-xl text-blue-200 mb-8">
              FortPlanへようこそ！<br />
              決済が正常に完了しました。
            </p>

            {/* 特典情報 */}
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-green-300 mb-2">
                🏆 早期購入特典が適用されました
              </h3>
              <p className="text-green-200">
                永久月1000円でFortPlanをご利用いただけます
              </p>
            </div>

            {/* 次のステップ */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-white">次のステップ</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <Settings className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-blue-300 font-bold">1. アカウント設定</h4>
                  <p className="text-blue-200 text-sm">プロフィールとチーム設定</p>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
                  <Home className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-purple-300 font-bold">2. 戦略作成開始</h4>
                  <p className="text-purple-200 text-sm">最初の戦略ボードを作成</p>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                ダッシュボードへ
              </Link>
              <Link
                href="/"
                className="border-2 border-blue-400 text-blue-400 px-8 py-4 rounded-full font-bold hover:bg-blue-400 hover:text-black transition-all"
              >
                ホームに戻る
              </Link>
            </div>

            {/* サポート情報 */}
            <div className="mt-8 pt-8 border-t border-gray-600">
              <p className="text-gray-400 text-sm">
                ご不明な点がございましたら、
                <Link href="/support" className="text-blue-400 hover:underline">
                  サポートセンター
                </Link>
                までお気軽にお問い合わせください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
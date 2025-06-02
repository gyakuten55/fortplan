'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Check, Zap, Star, Shield, Clock, AlertCircle } from 'lucide-react';

export default function PurchasePage() {
  const [isLoading, setIsLoading] = useState(false);

  const plan = {
    name: 'FortPlan',
    price: 1000,
    type: '月額制',
    description: '次世代フォートナイト戦略プランニングツール',
    features: [
      '戦略ボード（リアルタイム戦略立案）',
      '試合レポート（詳細な戦績分析）',
      '武器・アイテム分析（最適ロードアウト提案）',
      'データエクスポート（PDF・PNG出力）',
      'FortniteAPI連携（最新データ自動取得）',
      'チーム管理・メンバー招待機能'
    ]
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      // 環境変数の確認
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        alert('Stripe設定が不完全です。管理者にお問い合わせください。');
        setIsLoading(false);
        return;
      }

      // 実際のStripe実装はAPIルートで行う
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'pro',
          priceId: 'price_1RURZRH4gst7Ys3lideQANOf', // 正しい価格ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '決済処理でエラーが発生しました');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('決済処理でエラーが発生しました:', error);
      alert(`決済処理でエラーが発生しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen fortnite-bg">
      <div className="container mx-auto px-4 py-8">
        {/* 戻るボタン */}
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          トップページに戻る
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-white mb-4">
              FortPlan
            </h1>
            <p className="text-blue-200 text-xl">
              次世代フォートナイト戦略プランニングツールで、チームの勝率を向上させましょう
            </p>
          </div>

          {/* 早期購入特典の告知 */}
          <div className="max-w-lg mx-auto mb-8 px-4">
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl p-4 md:p-6 text-center">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-lg md:text-xl font-bold text-orange-300 mb-2">🚀 早期購入特典</h3>
              <p className="text-orange-200 font-medium text-sm md:text-base">
                6月末までに購入すると<br />
                <span className="text-xl md:text-2xl font-black text-orange-300">永久月1000円</span>
              </p>
              <p className="text-orange-300 text-xs md:text-sm mt-2">
                ※通常価格になる前の限定価格です
              </p>
            </div>
          </div>

          {/* プラン表示 */}
          <div className="max-w-lg mx-auto mb-12 px-4">
            <div className="glass-card-enhanced p-6 md:p-10 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-black flex items-center">
                  <Star className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  🎮 プロ戦略ツール
                </span>
              </div>
              
              <div className="text-center mb-6 md:mb-8 mt-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-blue-200 text-sm md:text-base">{plan.description}</p>
              </div>

              <div className="text-center mb-6 md:mb-8">
                <div className="flex justify-center items-end mb-2">
                  <span className="text-4xl md:text-6xl font-black text-white">1000</span>
                  <span className="text-lg md:text-2xl text-blue-300 mb-1 md:mb-2">円/月</span>
                </div>
                <p className="text-blue-300 mb-3 md:mb-4 text-sm md:text-base">6月末までの早期購入特典</p>
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 md:p-3">
                  <p className="text-green-300 text-xs md:text-sm font-medium">
                    💰 早期購入者は永久にこの価格でご利用いただけます
                  </p>
                </div>
              </div>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-white text-sm md:text-base">
                    <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400 mr-2 md:mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 決済ボタン */}
          <div className="text-center px-4">
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 md:px-16 py-4 md:py-6 rounded-full text-lg md:text-2xl font-black hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/25 pulse-glow inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-md"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white mr-2 md:mr-3"></div>
                  処理中...
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                  Stripeで決済を開始
                </>
              )}
            </button>
            <p className="text-blue-300 text-xs md:text-sm mt-4">
              安全なStripe決済システムを使用しています
            </p>
          </div>

          {/* セキュリティ・保証情報 */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="glass-card-enhanced p-6 text-center">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">安全な決済</h4>
              <p className="text-blue-200 text-sm">
                業界標準のStripe決済システムで、クレジットカード情報は安全に保護されます
              </p>
            </div>
            <div className="glass-card-enhanced p-6 text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">即時利用開始</h4>
              <p className="text-blue-200 text-sm">
                決済完了後、すぐにアカウント設定画面に進み、FortPlanをご利用いただけます
              </p>
            </div>
            <div className="glass-card-enhanced p-6 text-center">
              <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">早期購入保証</h4>
              <p className="text-blue-200 text-sm">
                6月末までにご購入いただいた方は、永久に月1000円でご利用いただけます
              </p>
            </div>
          </div>

          {/* よくある質問 */}
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-white text-center mb-8">よくある質問</h3>
            <div className="space-y-6">
              <div className="glass-card-enhanced p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">
                  早期購入特典の「永久月1000円」とは何ですか？
                </h4>
                <p className="text-blue-200">
                  6月末までにご購入いただいた方は、将来価格が変更されても永久に月1000円でFortPlanをご利用いただけます。
                  早期サポーターへの特別な感謝価格です。
                </p>
              </div>
              <div className="glass-card-enhanced p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">
                  FortPlanにはどのような機能が含まれていますか？
                </h4>
                <p className="text-blue-200">
                  戦略ボード、試合レポート、武器・アイテム分析、データエクスポート、FortniteAPI連携、チーム管理機能が含まれています。
                  すべてプロチーム仕様の高機能ツールです。
                </p>
              </div>
              <div className="glass-card-enhanced p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">
                  サブスクリプションはいつでもキャンセルできますか？
                </h4>
                <p className="text-blue-200">
                  はい、いつでもキャンセル可能です。ただし、早期購入特典でご購入いただいた場合は、
                  非常にお得な価格設定のため、一度キャンセルすると再加入時は通常価格となります。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
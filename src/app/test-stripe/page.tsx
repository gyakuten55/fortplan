'use client';

import { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

export default function TestStripePage() {
  const [testResults, setTestResults] = useState({
    publicKey: false,
    secretKey: false,
    priceId: false,
    apiConnection: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const runStripeTests = async () => {
    setIsLoading(true);
    const results = { ...testResults };

    // 1. 公開キーテスト
    results.publicKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    // 2. APIエンドポイントテスト
    try {
      const response = await fetch('/api/test-stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      results.secretKey = data.secretKeyValid;
      results.priceId = data.priceIdValid;
      results.apiConnection = data.connectionValid;
    } catch (error) {
      console.error('API test failed:', error);
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const TestResult = ({ label, status, detail }: { label: string, status: boolean, detail?: string }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
      <div>
        <span className="text-white font-medium">{label}</span>
        {detail && <p className="text-gray-400 text-sm">{detail}</p>}
      </div>
      {status ? (
        <Check className="w-6 h-6 text-green-400" />
      ) : (
        <X className="w-6 h-6 text-red-400" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen fortnite-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card-enhanced p-8 rounded-xl">
          <h1 className="text-3xl font-bold text-white mb-6">🧪 Stripe設定テスト</h1>
          
          <div className="mb-6">
            <button
              onClick={runStripeTests}
              disabled={isLoading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'テスト実行中...' : 'Stripe設定をテスト'}
            </button>
          </div>

          <div className="space-y-4">
            <TestResult 
              label="公開キー (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)"
              status={testResults.publicKey}
              detail="クライアントサイドで使用する公開キーの確認"
            />
            
            <TestResult 
              label="シークレットキー (STRIPE_SECRET_KEY)"
              status={testResults.secretKey}
              detail="サーバーサイドで使用するシークレットキーの確認"
            />
            
            <TestResult 
              label="価格ID (STRIPE_PRICE_ID)"
              status={testResults.priceId}
              detail="商品価格IDの有効性確認"
            />
            
            <TestResult 
              label="Stripe API接続"
              status={testResults.apiConnection}
              detail="StripeAPIとの通信確認"
            />
          </div>

          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <h3 className="text-blue-300 font-bold mb-2 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              設定手順
            </h3>
            <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
              <li>プロジェクトルートに <code>.env.local</code> ファイルを作成</li>
              <li><code>stripe-config.md</code> の内容をコピー＆ペースト</li>
              <li>開発サーバーを再起動</li>
              <li>このページでテストを実行</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 
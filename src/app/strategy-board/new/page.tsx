'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { userStorage, authStorage, strategyBoardStorage } from '@/lib/storage';
import { getMap } from '@/lib/fortnite-api';
import { StrategyBoard } from '@/types';

export default function NewStrategyBoardPage() {
  const [boardName, setBoardName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 認証チェック
    const user = userStorage.get();
    const token = authStorage.get();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!boardName.trim()) {
      setError('戦略ボード名を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      // マップ情報を取得
      const mapData = await getMap();
      
      const newBoard: StrategyBoard = {
        id: `board-${Date.now()}`,
        name: boardName.trim(),
        mapImageUrl: mapData.imageUrl,
        elements: [],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = strategyBoardStorage.save(newBoard);
      
      if (!result.success) {
        setError(result.error || '戦略ボードの作成に失敗しました');
        return;
      }
      
      // 作成したボードの編集画面にリダイレクト
      router.push(`/strategy-board/${newBoard.id}`);
    } catch (error) {
      setError('戦略ボードの作成に失敗しました');
      console.error('Failed to create board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* ヘッダー */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/strategy-board"
                className="text-purple-300 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戦略ボード一覧に戻る
              </Link>
              <div className="flex items-center space-x-2">
                <Plus className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">新しい戦略ボード</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* メインフォーム */}
          <div className="glass-card p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">戦略ボード作成</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="boardName" className="block text-sm font-medium text-gray-300 mb-2">
                  戦略ボード名 *
                </label>
                <input
                  type="text"
                  id="boardName"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="例: ティルテッド降下戦略、エンドゲーム対策"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  required
                  maxLength={100}
                />
                <p className="text-gray-400 text-sm mt-1">
                  {boardName.length}/100文字
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Link
                  href="/strategy-board"
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={isLoading || !boardName.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>作成中...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>戦略ボードを作成</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* テンプレート選択 */}
          <div className="glass-card p-8 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">新しい戦略ボードを作成</h3>
            <p className="text-gray-300 mb-6">
              フォートナイトの戦略を立案するためのボードを作成します。マップ上に要素を配置して、チーム戦略を可視化できます。
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">利用可能な機能</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>マーカー・テキスト配置</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>ルート・エリア描画</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>プレイヤー配置（味方・敵）</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>ズーム・パンニング</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">戦略立案のヒント</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• 降下地点を明確にマーキング</li>
                  <li>• 移動ルートを線で描画</li>
                  <li>• 重要エリアを円・四角で囲む</li>
                  <li>• チームメンバーの役割分担</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
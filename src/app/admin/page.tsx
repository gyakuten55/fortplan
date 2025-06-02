'use client';

import { useState, useEffect } from 'react';
import { userStorage } from '@/lib/storage';
import { User } from '@/types';
import { Eye, EyeOff, Users, Mail, Calendar, Shield, Database, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージからユーザー情報を取得
    const user = userStorage.get();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const clearUserData = () => {
    if (confirm('ユーザーデータを削除しますか？この操作は元に戻せません。')) {
      localStorage.removeItem('fortplan-user');
      localStorage.removeItem('fortplan-auth');
      setCurrentUser(null);
      alert('ユーザーデータを削除しました。');
    }
  };

  const exportUserData = () => {
    if (currentUser) {
      const dataStr = JSON.stringify(currentUser, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-${currentUser.email}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
            <Shield className="w-8 h-8 mr-3" />
            管理者ダッシュボード
          </h1>
          <p className="text-gray-300">登録ユーザー情報の確認・管理</p>
        </div>

        {currentUser ? (
          <div className="space-y-6">
            {/* ユーザー情報カード */}
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  登録ユーザー情報
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={exportUserData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    エクスポート
                  </button>
                  <button
                    onClick={clearUserData}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    削除
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ユーザーID
                    </label>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                      <code className="text-purple-300 text-sm">{currentUser.id}</code>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      メールアドレス
                    </label>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                      <span className="text-white">{currentUser.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      チーム名
                    </label>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                      <span className="text-white">{currentUser.teamName}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      代表者名
                    </label>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                      <span className="text-white">{currentUser.representativeName}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      パスワード
                    </label>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-3 relative">
                      {currentUser.password ? (
                        <>
                          <span className="text-white font-mono text-sm">
                            {showPassword 
                              ? atob(currentUser.password) 
                              : '••••••••••••••••'
                            }
                          </span>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">パスワード未設定</span>
                      )}
                    </div>
                    {currentUser.password && (
                      <p className="text-xs text-gray-400 mt-1">
                        Base64エンコード: {currentUser.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      決済状況
                    </label>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        currentUser.isPaid 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {currentUser.isPaid ? '✓ 決済完了' : '✗ 未決済'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      登録日時
                    </label>
                    <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                      <span className="text-white">
                        {new Date(currentUser.createdAt).toLocaleString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ローカルストレージ情報 */}
            <div className="glass-card p-6 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                ストレージ情報
              </h3>
              <div className="bg-black/20 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-300 text-sm">
                  <code>{JSON.stringify(currentUser, null, 2)}</code>
                </pre>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4">
              <h4 className="text-amber-300 font-medium mb-2">⚠️ 重要な注意事項</h4>
              <ul className="text-amber-200 text-sm space-y-1">
                <li>• 現在はローカルストレージ（ブラウザ内）にデータが保存されています</li>
                <li>• ブラウザのデータを削除すると、ユーザー情報も失われます</li>
                <li>• 本格運用時は、実際のデータベース（PostgreSQL, MongoDB等）への移行が必要です</li>
                <li>• パスワードは現在Base64エンコードですが、本格運用時はハッシュ化が必要です</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-lg text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">登録ユーザーなし</h2>
            <p className="text-gray-300 mb-6">
              まだユーザーが登録されていません。<br />
              決済完了後の登録フローを通じてユーザーが作成されます。
            </p>
            <a 
              href="/purchase" 
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              購入ページに移動
            </a>
          </div>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/dashboard" 
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← ダッシュボードに戻る
          </a>
        </div>
      </div>
    </div>
  );
} 
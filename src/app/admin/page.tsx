'use client';

import { useState, useEffect } from 'react';
import { userStorage } from '@/lib/storage';
import { User } from '@/types';
import { Eye, EyeOff, Users, Mail, Calendar, Shield, Database, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      // 管理者認証チェック
      const adminToken = localStorage.getItem('fortplan-admin-token');
      const adminUserData = localStorage.getItem('fortplan-admin-user');
      
      if (!adminToken || !adminUserData) {
        // 未認証の場合、ログインページにリダイレクト
        window.location.href = '/admin/login';
        return;
      }

      try {
        // トークンの有効性をサーバーで検証
        const response = await fetch('/api/admin/auth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
          setAdminUser(JSON.parse(adminUserData));
          await fetchUsers();
        } else {
          // トークンが無効な場合
          localStorage.removeItem('fortplan-admin-token');
          localStorage.removeItem('fortplan-admin-user');
          window.location.href = '/admin/login';
        }
      } catch (error) {
        console.error('認証確認エラー:', error);
        window.location.href = '/admin/login';
      }
    };

    const fetchUsers = async () => {
      try {
        // サーバーサイドから全ユーザー情報を取得
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data.users || []);
        } else {
          console.error('ユーザー情報の取得に失敗しました');
        }
      } catch (error) {
        console.error('API呼び出しエラー:', error);
      }
      
      // ローカルストレージからも取得（バックアップ）
      const localUser = userStorage.get();
      setCurrentUser(localUser);
      setIsLoading(false);
    };

    checkAdminAuth();
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
    if (allUsers.length > 0) {
      const dataStr = JSON.stringify(allUsers, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-users-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      localStorage.removeItem('fortplan-admin-token');
      localStorage.removeItem('fortplan-admin-user');
      window.location.href = '/admin/login';
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-gray-300">認証確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* 管理者ヘッダー */}
        <div className="glass-card p-4 rounded-lg mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-red-400 mr-2" />
              <div>
                <h2 className="text-lg font-bold text-white">運営者ログイン中</h2>
                <p className="text-sm text-gray-300">
                  {adminUser?.username} ({adminUser?.loginTime && new Date(adminUser.loginTime).toLocaleString('ja-JP')})
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              ログアウト
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
            <Shield className="w-8 h-8 mr-3" />
            FortPlan 管理者ダッシュボード
          </h1>
          <p className="text-gray-300">購入ユーザー情報の確認・管理</p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold text-white mb-2">総ユーザー数</h3>
            <p className="text-3xl font-bold text-purple-400">{allUsers.length}</p>
          </div>
          <div className="glass-card p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold text-white mb-2">有料ユーザー</h3>
            <p className="text-3xl font-bold text-green-400">
              {allUsers.filter(user => user.isPaid).length}
            </p>
          </div>
          <div className="glass-card p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold text-white mb-2">今日の新規登録</h3>
            <p className="text-3xl font-bold text-blue-400">
              {allUsers.filter(user => 
                new Date(user.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
        </div>

        {allUsers.length > 0 ? (
          <div className="space-y-6">
            {/* 全ユーザー一覧 */}
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  全登録ユーザー ({allUsers.length}名)
                </h2>
              </div>

              <div className="grid gap-4">
                {allUsers.map((user, index) => (
                  <div key={user.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          #{index + 1} - チーム名
                        </label>
                        <p className="text-white">{user.teamName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          代表者名
                        </label>
                        <p className="text-white">{user.representativeName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          メールアドレス
                        </label>
                        <p className="text-white">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          登録日時
                        </label>
                        <p className="text-white text-sm">
                          {new Date(user.createdAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.isPaid 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {user.isPaid ? '✓ 決済完了' : '✗ 未決済'}
                      </span>
                      <p className="text-xs text-gray-400">
                        ID: {user.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ローカルユーザー情報（デバッグ用） */}
            {currentUser && (
              <div className="glass-card p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  ローカルユーザー情報（このブラウザ）
                </h3>
                <div className="bg-black/20 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-300 text-sm">
                    <code>{JSON.stringify(currentUser, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : currentUser ? (
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
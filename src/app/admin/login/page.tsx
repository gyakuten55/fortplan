'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('ユーザー名とパスワードを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      // 運営者認証API呼び出し
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 認証トークンをローカルストレージに保存
        localStorage.setItem('fortplan-admin-token', data.token);
        localStorage.setItem('fortplan-admin-user', JSON.stringify(data.admin));
        
        // 管理者ダッシュボードにリダイレクト
        router.push('/admin');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('ログインに失敗しました。しばらく経ってから再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 戻るボタン */}
        <Link 
          href="/" 
          className="inline-flex items-center text-purple-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          トップページに戻る
        </Link>

        <div className="glass-card p-8 rounded-lg">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              運営者ログイン
            </h1>
            <p className="text-gray-300">
              FortPlan管理者アカウントでログインしてください
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                管理者ユーザー名
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                  placeholder="管理者ユーザー名"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                  placeholder="管理者パスワード"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  管理者ログイン
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg">
            <h4 className="text-amber-300 font-medium text-sm mb-2">🔒 セキュリティ情報</h4>
            <ul className="text-amber-200 text-xs space-y-1">
              <li>• このページは運営者専用です</li>
              <li>• 不正アクセスは監視されています</li>
              <li>• 認証情報を第三者と共有しないでください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
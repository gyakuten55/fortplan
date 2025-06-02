'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { userStorage, authStorage } from '@/lib/storage';
import { User } from '@/types';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 既にログインしている場合はダッシュボードにリダイレクト
    const user = userStorage.get();
    const token = authStorage.get();
    
    if (user && token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // バリデーション
    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('正しいメールアドレスを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      // 実際の認証処理（現在はダミー実装）
      // 実際の実装では、サーバーサイドでの認証を行う
      
      // ダミーの認証チェック（実際の実装では削除）
      if (formData.email === 'demo@fortplan.com' && formData.password === 'password123') {
        // デモユーザーを作成・保存
        const demoUser: User = {
          id: 'demo-user-001',
          email: 'demo@fortplan.com',
          teamName: 'Demo Team',
          representativeName: 'デモユーザー',
          password: btoa('password123'), // パスワードをBase64エンコード
          isPaid: true,
          createdAt: new Date().toISOString()
        };
        
        userStorage.set(demoUser);
        
        // ログイン成功
        const authToken = generateAuthToken();
        authStorage.set(authToken);
        
        setMessage('ログインに成功しました。ダッシュボードに移動します...');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        // 既存ユーザーのチェック
        const savedUser = userStorage.get();
        if (savedUser && savedUser.email === formData.email) {
          // パスワードチェック
          let isPasswordValid = false;
          
          if (savedUser.password) {
            // Base64エンコードされたパスワードをデコードして比較
            try {
              const decodedPassword = atob(savedUser.password);
              isPasswordValid = decodedPassword === formData.password;
            } catch (error) {
              console.error('Password decode error:', error);
              isPasswordValid = false;
            }
          } else {
            // 旧ユーザー（パスワードなし）の場合、パスワード長で簡易チェック
            isPasswordValid = formData.password.length >= 6;
          }
          
          if (isPasswordValid) {
            // ログイン成功
            const authToken = generateAuthToken();
            authStorage.set(authToken);
            
            setMessage('ログインに成功しました。ダッシュボードに移動します...');
            
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
          } else {
            setError('パスワードが正しくありません');
          }
        } else {
          // ユーザーが見つからない場合、新規登録ページへ誘導
          setError('アカウントが見つかりません。新規登録を行ってください。');
        }
      }
    } catch (error) {
      setError('ログインに失敗しました。しばらく経ってから再度お試しください。');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // エラーメッセージをクリア
    if (error) setError('');
  };

  // 簡易的な認証トークン生成（実際の実装ではJWTなどを使用）
  const generateAuthToken = () => {
    return btoa(JSON.stringify({
      email: formData.email,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24時間
    }));
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
            <h1 className="text-3xl font-bold text-white mb-2">
              ログイン
            </h1>
            <p className="text-gray-300">
              FortPlanアカウントにログインしてください
            </p>
          </div>

          {message && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-lg mb-6 text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  placeholder="your-email@example.com"
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
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  placeholder="パスワード"
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
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  ログイン
                </>
              )}
            </button>
          </form>



          <div className="mt-6 text-center">
            <p className="text-gray-300">
              アカウントをお持ちでない方は{' '}
              <Link href="/purchase" className="text-purple-400 hover:text-purple-300 transition-colors">
                こちらから購入
              </Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
} 
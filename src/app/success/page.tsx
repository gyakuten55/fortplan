'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, User, Mail, Users, Calendar, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { userStorage, authStorage } from '@/lib/storage';
import { User as UserType } from '@/types';

function SuccessContent() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    representativeName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = searchParams.get('session_id');
    setSessionId(session);
  }, [searchParams]);

  useEffect(() => {
    // パスワード検証
    let passwordValidationError = '';
    
    if (formData.password && formData.password.length < 8) {
      passwordValidationError = 'パスワードは8文字以上で入力してください';
    } else if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      passwordValidationError = 'パスワードが一致しません';
    }
    
    setPasswordError(passwordValidationError);

    // フォームバリデーション
    const isValid = formData.teamName.trim() !== '' && 
                   formData.representativeName.trim() !== '' && 
                   formData.email.trim() !== '' &&
                   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                   formData.password.length >= 8 &&
                   formData.password === formData.confirmPassword;
    setIsFormValid(isValid);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alert('すべての項目を正しく入力してください。');
      return;
    }

    setIsLoading(true);

    try {
      // ユーザー情報を作成
      const newUser: UserType = {
        id: `user-${Date.now()}`,
        email: formData.email,
        teamName: formData.teamName,
        representativeName: formData.representativeName,
        password: btoa(formData.password), // Base64エンコードで簡易暗号化
        isPaid: true, // 決済完了済み
        createdAt: new Date().toISOString()
      };

      // ローカルストレージに保存
      userStorage.set(newUser);

      // 認証トークン生成・保存
      const authToken = btoa(JSON.stringify({
        email: formData.email,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24時間
      }));
      authStorage.set(authToken);

      // 成功メッセージ表示後、ダッシュボードに移動
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Account creation error:', error);
      alert('アカウント作成中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 決済成功メッセージ */}
        <div className="glass-card p-8 rounded-lg mb-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              決済が完了しました！
            </h1>
            <p className="text-gray-300 text-sm">
              FortPlanへようこそ。アカウント情報を登録してください。
            </p>
            {sessionId && (
              <p className="text-gray-400 text-xs mt-2">
                セッションID: {sessionId.slice(0, 20)}...
              </p>
            )}
          </div>
        </div>

        {/* 会員情報登録フォーム */}
        <div className="glass-card p-8 rounded-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">
              アカウント情報登録
            </h2>
            <p className="text-gray-300 text-sm">
              FortPlanを始めるために必要な情報を入力してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-2">
                チーム名
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  placeholder="例: Team Victory"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="representativeName" className="block text-sm font-medium text-gray-300 mb-2">
                代表者名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="representativeName"
                  name="representativeName"
                  value={formData.representativeName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  placeholder="例: 田中太郎"
                  required
                />
              </div>
            </div>

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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  placeholder="8文字以上のパスワード"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && formData.password.length < 8 && (
                <p className="text-red-400 text-xs mt-1">パスワードは8文字以上で入力してください</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                パスワード確認
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  placeholder="パスワードを再入力"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  アカウント作成中...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  FortPlanを開始する
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-blue-300 font-medium text-sm">早期購入特典が適用されました</h4>
                <p className="text-blue-200 text-xs mt-1">
                  永久月1000円でFortPlanの全機能をご利用いただけます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">読み込み中...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
} 
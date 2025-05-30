'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';
import { userStorage, authStorage, teamMemberStorage } from '@/lib/storage';
import { TeamMember } from '@/types';

export default function NewMemberPage() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    discordId: '',
    joinDate: '',
    memo: '',
  });
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

    if (!formData.name.trim()) {
      setError('メンバー名を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        discordId: formData.discordId.trim() || undefined,
        joinDate: formData.joinDate || undefined,
        memo: formData.memo.trim() || undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = teamMemberStorage.save(newMember);
      
      if (!result.success) {
        setError(result.error || 'メンバーの追加に失敗しました');
        return;
      }
      
      // メンバー一覧にリダイレクト
      router.push('/members');
    } catch (error) {
      setError('メンバーの追加に失敗しました');
      console.error('Failed to create member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* ヘッダー */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/members"
                className="text-purple-300 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                メンバー一覧に戻る
              </Link>
              <div className="flex items-center space-x-2">
                <UserPlus className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">新しいメンバー</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">メンバー追加</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 必須情報 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  メンバー名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="例: 田中太郎"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  required
                  maxLength={50}
                />
              </div>

              {/* 基本情報 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
                    年齢
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="例: 20"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    min="10"
                    max="100"
                  />
                </div>

                <div>
                  <label htmlFor="discordId" className="block text-sm font-medium text-gray-300 mb-2">
                    Discord ID
                  </label>
                  <input
                    type="text"
                    id="discordId"
                    name="discordId"
                    value={formData.discordId}
                    onChange={handleChange}
                    placeholder="例: username#1234"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* 参加日 */}
              <div>
                <label htmlFor="joinDate" className="block text-sm font-medium text-gray-300 mb-2">
                  チーム参加日
                </label>
                <input
                  type="date"
                  id="joinDate"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* メモ */}
              <div>
                <label htmlFor="memo" className="block text-sm font-medium text-gray-300 mb-2">
                  メモ・備考
                </label>
                <textarea
                  id="memo"
                  name="memo"
                  value={formData.memo}
                  onChange={handleChange}
                  placeholder="メンバーに関するメモや特記事項があれば記入してください..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  maxLength={500}
                />
                <p className="text-gray-400 text-sm mt-1">
                  {formData.memo.length}/500文字
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <Link
                  href="/members"
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>追加中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>メンバーを追加</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ヒント */}
          <div className="mt-8 glass-card p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">💡 メンバー管理のヒント</h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <h5 className="font-semibold text-blue-400 mb-2">効果的な管理</h5>
                <ul className="space-y-1">
                  <li>• 名前で識別しやすく管理</li>
                  <li>• Discord IDで連絡手段を確保</li>
                  <li>• 参加日で在籍期間を把握</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-green-400 mb-2">メモの活用</h5>
                <ul className="space-y-1">
                  <li>• 得意な武器や戦術を記録</li>
                  <li>• プレイスタイルの特徴</li>
                  <li>• 改善点や目標を共有</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
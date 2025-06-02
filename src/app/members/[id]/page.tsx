'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Save, Trash2 } from 'lucide-react';
import { userStorage, authStorage, teamMemberStorage } from '@/lib/storage';
import { TeamMember } from '@/types';

export default function EditMemberPage() {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    discordId: '',
    joinDate: '',
    memo: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // 認証チェック
    const user = userStorage.get();
    const token = authStorage.get();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    // メンバー情報を取得
    const memberId = params.id as string;
    const savedMember = teamMemberStorage.get(memberId);
    
    if (!savedMember) {
      router.push('/members');
      return;
    }

    setMember(savedMember);
    setFormData({
      name: savedMember.name,
      age: savedMember.age?.toString() || '',
      discordId: savedMember.discordId || '',
      joinDate: savedMember.joinDate || '',
      memo: savedMember.memo || '',
    });
    setIsLoading(false);
  }, [router, params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('メンバー名を入力してください');
      return;
    }

    if (!member) return;

    setIsSaving(true);

    try {
      const updatedMember: TeamMember = {
        ...member,
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        discordId: formData.discordId.trim() || undefined,
        joinDate: formData.joinDate || undefined,
        memo: formData.memo.trim() || undefined,
        updatedAt: new Date().toISOString()
      };

      teamMemberStorage.save(updatedMember);
      
      // メンバー一覧にリダイレクト
      router.push('/members');
    } catch (error) {
      setError('メンバー情報の更新に失敗しました');
      console.error('Failed to update member:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDelete = () => {
    if (!member) return;
    
    if (confirm(`「${member.name}」をメンバーリストから削除しますか？\n\nこの操作は取り消せません。`)) {
      try {
        teamMemberStorage.delete(member.id);
        router.push('/members');
      } catch (error) {
        setError('メンバーの削除に失敗しました');
        console.error('Failed to delete member:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">メンバー情報を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

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
                <Edit className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">メンバー編集</h1>
              </div>
            </div>
            
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>削除</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-6">メンバー情報編集</h2>
            
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
                  disabled={isSaving || !formData.name.trim()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>変更を保存</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* メンバー情報 */}
          <div className="mt-8 glass-card p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">📊 メンバー情報</h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <p><span className="text-blue-400">作成日:</span> {new Date(member.createdAt).toLocaleDateString('ja-JP')}</p>
                <p><span className="text-green-400">更新日:</span> {new Date(member.updatedAt).toLocaleDateString('ja-JP')}</p>
                <p><span className="text-purple-400">ステータス:</span> {member.isActive ? 'アクティブ' : '非アクティブ'}</p>
              </div>
              <div>
                {member.stats && (
                  <>
                    <p><span className="text-yellow-400">試合数:</span> {member.stats.gamesPlayed || 0}</p>
                    <p><span className="text-red-400">平均キル:</span> {member.stats.averageKills?.toFixed(1) || '0.0'}</p>
                    <p><span className="text-orange-400">平均順位:</span> #{member.stats.averagePlacement?.toFixed(0) || '0'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Target, 
  Clock, 
  Users, 
  MapPin, 
  Zap, 
  Shield, 
  Gamepad2,
  Plus,
  X,
  Building,
  Award
} from 'lucide-react';
import { userStorage, authStorage, matchReportStorage, teamMemberStorage } from '@/lib/storage';
import { MatchReport, TeamMember } from '@/types';

export default function NewMatchReportPage() {
  const [formData, setFormData] = useState<Partial<MatchReport>>({
    gameMode: 'squad',
    placement: 50,
    totalPlayers: 100,
    kills: 0,
    assists: 0,
    damage: 0,
    revives: 0,
    survivalTime: '10:00',
    stormDamage: 0,
    landingSpot: '',
    strategy: '',
    teammates: [],
    reflections: '',
    challenges: '',
    lessonsLearned: '',
    tags: [],
    mapVersion: 'Chapter 5 Season 1'
  });
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // フォートナイトの人気降下地点
  const popularLandingSpots = [
    'ティルテッドタワーズ', 'プレザントパーク', 'リテールロウ', 'ソルティスプリングス',
    'ダスティディビット', 'ラマランチ', 'ロッキーリールズ', 'シフトシャフト',
    'フレンジーファーム', 'ホリーヘッジ', 'ミスティメドウズ', 'スウィーティサンズ',
    'レイジーレイク', 'ログジャム', 'スリーピーサウンド', 'コーラルキャッスル',
    'ステルススストロングホールド', 'グランドグレイシャー', 'ブルータルバスティオン'
  ];

  // 戦略テンプレート
  const strategyTemplates = [
    '安全プレイ (エッジムーブ)', 'アグレッシブプレイ (センター取り)', 'ローテーション重視',
    'キル狙い', 'ファームタイム確保', '建築バトル', 'ハイグラウンド確保',
    'チーム連携重視', 'ソロプレイ', '装備充実優先', '早期移動', '待ち戦法'
  ];

  useEffect(() => {
    // 認証チェック
    const user = userStorage.get();
    const token = authStorage.get();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    // チームメンバーを読み込み
    const members = teamMemberStorage.getActive();
    setTeamMembers(members);

    // 現在の日時を設定
    setFormData(prev => ({
      ...prev,
      date: new Date().toISOString().slice(0, 16)
    }));
  }, [router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleTeammateToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      teammates: prev.teammates?.includes(memberId)
        ? prev.teammates.filter(id => id !== memberId)
        : [...(prev.teammates || []), memberId]
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!formData.date || !formData.landingSpot) {
      setError('日時、降下地点は必須項目です');
      return;
    }

    if (formData.placement! < 1 || formData.placement! > (formData.totalPlayers || 100)) {
      setError('順位は1位から参加者数の範囲で入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const newReport: MatchReport = {
        id: `match-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...formData
      } as MatchReport;

      const result = matchReportStorage.save(newReport);
      
      if (!result.success) {
        setError(result.error || 'レポートの保存に失敗しました');
        return;
      }
      
      // チームメンバーの統計を更新
      if (formData.teammates && formData.teammates.length > 0) {
        formData.teammates.forEach(memberId => {
          const member = teamMemberStorage.get(memberId);
          if (member) {
            const currentStats = member.stats || {};
            const newStats = {
              gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
              averageKills: currentStats.averageKills 
                ? (currentStats.averageKills * (currentStats.gamesPlayed || 1) + formData.kills!) / ((currentStats.gamesPlayed || 1) + 1)
                : formData.kills!,
              averagePlacement: currentStats.averagePlacement 
                ? (currentStats.averagePlacement * (currentStats.gamesPlayed || 1) + formData.placement!) / ((currentStats.gamesPlayed || 1) + 1)
                : formData.placement!
            };
            teamMemberStorage.updateStats(memberId, newStats);
          }
        });
      }

      router.push('/match-report');
    } catch (error) {
      setError('レポートの保存に失敗しました');
      console.error('Failed to save match report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* ヘッダー */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/match-report"
                className="text-purple-300 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                試合レポートに戻る
              </Link>
              <div className="flex items-center space-x-2">
                <Plus className="w-6 h-6 text-green-400" />
                <h1 className="text-xl font-bold text-white">新しい試合レポート</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本情報 */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2" />
                基本情報
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                    試合日時 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="gameMode" className="block text-sm font-medium text-gray-300 mb-2">
                    ゲームモード
                  </label>
                  <select
                    id="gameMode"
                    value={formData.gameMode}
                    onChange={(e) => handleInputChange('gameMode', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  >
                    <option value="solo">ソロ</option>
                    <option value="duo">デュオ</option>
                    <option value="squad">スクワッド</option>
                    <option value="ltm">LTM (期間限定モード)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="placement" className="block text-sm font-medium text-gray-300 mb-2">
                    最終順位 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    id="placement"
                    min="1"
                    max={formData.totalPlayers || 100}
                    value={formData.placement}
                    onChange={(e) => handleInputChange('placement', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="totalPlayers" className="block text-sm font-medium text-gray-300 mb-2">
                    参加者数
                  </label>
                  <input
                    type="number"
                    id="totalPlayers"
                    min="1"
                    max="100"
                    value={formData.totalPlayers}
                    onChange={(e) => handleInputChange('totalPlayers', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>
              </div>
            </div>

            {/* 戦闘統計 */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                戦闘統計
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="kills" className="block text-sm font-medium text-gray-300 mb-2">
                    キル数
                  </label>
                  <input
                    type="number"
                    id="kills"
                    min="0"
                    value={formData.kills}
                    onChange={(e) => handleInputChange('kills', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label htmlFor="assists" className="block text-sm font-medium text-gray-300 mb-2">
                    アシスト数
                  </label>
                  <input
                    type="number"
                    id="assists"
                    min="0"
                    value={formData.assists}
                    onChange={(e) => handleInputChange('assists', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label htmlFor="damage" className="block text-sm font-medium text-gray-300 mb-2">
                    与ダメージ
                  </label>
                  <input
                    type="number"
                    id="damage"
                    min="0"
                    value={formData.damage}
                    onChange={(e) => handleInputChange('damage', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                {(formData.gameMode === 'duo' || formData.gameMode === 'squad') && (
                  <div>
                    <label htmlFor="revives" className="block text-sm font-medium text-gray-300 mb-2">
                      蘇生回数
                    </label>
                    <input
                      type="number"
                      id="revives"
                      min="0"
                      value={formData.revives}
                      onChange={(e) => handleInputChange('revives', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="survivalTime" className="block text-sm font-medium text-gray-300 mb-2">
                    生存時間 (分:秒)
                  </label>
                  <input
                    type="time"
                    id="survivalTime"
                    value={formData.survivalTime}
                    onChange={(e) => handleInputChange('survivalTime', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label htmlFor="stormDamage" className="block text-sm font-medium text-gray-300 mb-2">
                    ストームダメージ
                  </label>
                  <input
                    type="number"
                    id="stormDamage"
                    min="0"
                    value={formData.stormDamage}
                    onChange={(e) => handleInputChange('stormDamage', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  />
                </div>
              </div>
            </div>

            {/* 戦略・戦術 */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                戦略・戦術
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="landingSpot" className="block text-sm font-medium text-gray-300 mb-2">
                    降下地点 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="landingSpot"
                    value={formData.landingSpot}
                    onChange={(e) => handleInputChange('landingSpot', e.target.value)}
                    list="landingSpots"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="降下地点を入力または選択..."
                    required
                  />
                  <datalist id="landingSpots">
                    {popularLandingSpots.map((spot) => (
                      <option key={spot} value={spot} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="strategy" className="block text-sm font-medium text-gray-300 mb-2">
                    採用した戦略
                  </label>
                  <input
                    type="text"
                    id="strategy"
                    value={formData.strategy}
                    onChange={(e) => handleInputChange('strategy', e.target.value)}
                    list="strategies"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="戦略を入力または選択..."
                  />
                  <datalist id="strategies">
                    {strategyTemplates.map((strategy) => (
                      <option key={strategy} value={strategy} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* チーム情報 */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                参加メンバー
              </h2>
              
              {teamMembers.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      一緒にプレイしたメンバー ({formData.teammates?.length || 0}/{teamMembers.length} 選択中)
                    </label>
                    
                    {/* 全選択・全解除ボタン */}
                    <div className="flex space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange('teammates', teamMembers.map(m => m.id))}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        全選択
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('teammates', [])}
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        全解除
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      {teamMembers.map((member) => (
                        <label 
                          key={member.id} 
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            formData.teammates?.includes(member.id)
                              ? 'bg-blue-600/20 border-blue-400 shadow-lg'
                              : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.teammates?.includes(member.id) || false}
                            onChange={() => handleTeammateToggle(member.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                              <span className="text-white font-medium">{member.name}</span>
                              {member.age && (
                                <span className="text-gray-400 text-sm">({member.age}歳)</span>
                              )}
                            </div>
                            {member.position && (
                              <span className="text-gray-400 text-sm">{member.position}</span>
                            )}
                            {member.discordId && (
                              <span className="text-purple-400 text-xs">💬 {member.discordId}</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    
                    {formData.teammates && formData.teammates.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          選択されたメンバー: {formData.teammates.map(id => teamMembers.find(m => m.id === id)?.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">チームメンバーが未登録です</h3>
                  <p className="text-gray-300 mb-4">
                    一緒にプレイしたメンバーを選択できます。
                  </p>
                  <div className="space-y-2">
                    <Link 
                      href="/members/new"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>メンバーを追加</span>
                    </Link>
                    <p className="text-gray-400 text-sm">
                      または、<Link href="/members" className="text-blue-400 hover:underline">メンバー管理</Link>でチームメンバーを登録してください
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 振り返り */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                振り返り・分析
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="reflections" className="block text-sm font-medium text-gray-300 mb-2">
                    良かった点・成功要因
                  </label>
                  <textarea
                    id="reflections"
                    value={formData.reflections}
                    onChange={(e) => handleInputChange('reflections', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="今回の試合で上手くいった点、良い判断だった点を記録..."
                  />
                </div>

                <div>
                  <label htmlFor="challenges" className="block text-sm font-medium text-gray-300 mb-2">
                    課題・改善点
                  </label>
                  <textarea
                    id="challenges"
                    value={formData.challenges}
                    onChange={(e) => handleInputChange('challenges', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="反省点、次回に向けて改善すべき点を記録..."
                  />
                </div>

                <div>
                  <label htmlFor="lessonsLearned" className="block text-sm font-medium text-gray-300 mb-2">
                    学んだこと・気づき
                  </label>
                  <textarea
                    id="lessonsLearned"
                    value={formData.lessonsLearned}
                    onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="この試合から得た新しい知見、戦略のアイデアなど..."
                  />
                </div>
              </div>
            </div>

            {/* タグ・その他 */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-6">
                タグ・その他
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                    カスタムタグ
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                      placeholder="タグを入力してEnterキー..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      追加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-green-300 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="mapVersion" className="block text-sm font-medium text-gray-300 mb-2">
                    マップバージョン
                  </label>
                  <input
                    type="text"
                    id="mapVersion"
                    value={formData.mapVersion}
                    onChange={(e) => handleInputChange('mapVersion', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="Chapter 5 Season 1"
                  />
                </div>
              </div>
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* 保存ボタン */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/match-report"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>レポートを保存</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
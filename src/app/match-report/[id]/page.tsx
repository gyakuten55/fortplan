'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  Target, 
  Clock, 
  Users, 
  MapPin, 
  Zap, 
  Shield, 
  Gamepad2,
  X,
  Building,
  Award,
  Calendar,
  Trophy,
  TrendingUp,
  Plus
} from 'lucide-react';
import { userStorage, authStorage, matchReportStorage, teamMemberStorage } from '@/lib/storage';
import { MatchReport, TeamMember } from '@/types';

export default function MatchReportDetailPage() {
  const [report, setReport] = useState<MatchReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<MatchReport>>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

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

    loadReport();
    const members = teamMemberStorage.getActive();
    setTeamMembers(members);
  }, [router, reportId]);

  const loadReport = () => {
    setIsLoading(true);
    setError('');

    try {
      const foundReport = matchReportStorage.getAll().find(r => r.id === reportId);
      
      if (!foundReport) {
        setError('レポートが見つかりません');
        return;
      }

      setReport(foundReport);
      setFormData(foundReport);
    } catch (error) {
      setError('レポートの読み込みに失敗しました');
      console.error('Failed to load report:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    setError('');
    setIsSaving(true);

    try {
      // バリデーション
      if (!formData.date || !formData.landingSpot) {
        setError('日時、降下地点は必須項目です');
        return;
      }

      if (formData.placement! < 1 || formData.placement! > (formData.totalPlayers || 100)) {
        setError('順位は1位から参加者数の範囲で入力してください');
        return;
      }

      const updatedReport: MatchReport = {
        ...formData,
        updatedAt: new Date().toISOString()
      } as MatchReport;

      matchReportStorage.save(updatedReport);
      setReport(updatedReport);
      setIsEditing(false);
    } catch (error) {
      setError('レポートの保存に失敗しました');
      console.error('Failed to save report:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getGameModeIcon = (mode: string) => {
    switch (mode) {
      case 'solo': return <Target className="w-5 h-5" />;
      case 'duo': return <Users className="w-5 h-5" />;
      case 'squad': return <Users className="w-5 h-5" />;
      case 'ltm': return <Zap className="w-5 h-5" />;
      default: return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getGameModeLabel = (mode: string) => {
    switch (mode) {
      case 'solo': return 'ソロ';
      case 'duo': return 'デュオ';
      case 'squad': return 'スクワッド';
      case 'ltm': return 'LTM';
      default: return mode;
    }
  };

  const getPlacementColor = (placement: number) => {
    if (placement === 1) return 'text-yellow-400';
    if (placement <= 3) return 'text-orange-400';
    if (placement <= 10) return 'text-green-400';
    if (placement <= 25) return 'text-blue-400';
    return 'text-gray-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTeammateNames = (teammateIds: string[]) => {
    return teammateIds
      .map(id => teamMembers.find(m => m.id === id)?.name)
      .filter(name => name)
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-300">レポートを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Link
            href="/match-report"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            レポート一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
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
                href="/match-report"
                className="text-purple-300 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                レポート一覧に戻る
              </Link>
              <div className="flex items-center space-x-3">
                {getGameModeIcon(report.gameMode)}
                <h1 className="text-xl font-bold text-white">
                  試合レポート詳細
                </h1>
                <span className="text-gray-400">#{report.placement}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>編集</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(report);
                      setError('');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>保存</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 基本情報 */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Gamepad2 className="w-5 h-5 mr-2" />
              基本情報
            </h2>
            
            {!isEditing ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 text-sm block">試合日時</span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-white">{formatDate(report.date)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm block">ゲームモード</span>
                    <div className="flex items-center space-x-2">
                      {getGameModeIcon(report.gameMode)}
                      <span className="text-white">{getGameModeLabel(report.gameMode)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400 text-sm block">最終順位</span>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className={`text-2xl font-bold ${getPlacementColor(report.placement)}`}>
                        #{report.placement} / {report.totalPlayers || 100}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm block">マップバージョン</span>
                    <span className="text-white">{report.mapVersion}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    試合日時 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ゲームモード
                  </label>
                  <select
                    value={formData.gameMode}
                    onChange={(e) => handleInputChange('gameMode', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  >
                    <option value="solo">ソロ</option>
                    <option value="duo">デュオ</option>
                    <option value="squad">スクワッド</option>
                    <option value="ltm">LTM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    最終順位 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.totalPlayers || 100}
                    value={formData.placement}
                    onChange={(e) => handleInputChange('placement', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    参加者数
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.totalPlayers}
                    onChange={(e) => handleInputChange('totalPlayers', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 戦闘統計 */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              戦闘統計
            </h2>
            
            {!isEditing ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div className="text-center">
                  <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{report.kills}</div>
                  <div className="text-gray-400 text-sm">キル</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{report.assists}</div>
                  <div className="text-gray-400 text-sm">アシスト</div>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{report.damage}</div>
                  <div className="text-gray-400 text-sm">ダメージ</div>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{report.survivalTime}</div>
                  <div className="text-gray-400 text-sm">生存時間</div>
                </div>
                {report.revives !== undefined && (
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{report.revives}</div>
                    <div className="text-gray-400 text-sm">蘇生</div>
                  </div>
                )}
                {report.stormDamage !== undefined && (
                  <div className="text-center">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{report.stormDamage}</div>
                    <div className="text-gray-400 text-sm">ストーム被害</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">キル数</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.kills}
                    onChange={(e) => handleInputChange('kills', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">アシスト数</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.assists}
                    onChange={(e) => handleInputChange('assists', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">与ダメージ</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.damage}
                    onChange={(e) => handleInputChange('damage', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">生存時間</label>
                  <input
                    type="time"
                    value={formData.survivalTime}
                    onChange={(e) => handleInputChange('survivalTime', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
                {(formData.gameMode === 'duo' || formData.gameMode === 'squad') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">蘇生回数</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.revives}
                      onChange={(e) => handleInputChange('revives', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ストームダメージ</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stormDamage}
                    onChange={(e) => handleInputChange('stormDamage', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 戦略・戦術 */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              戦略・戦術
            </h2>
            
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400 text-sm block">降下地点</span>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-white text-lg">{report.landingSpot}</span>
                  </div>
                </div>
                {report.strategy && (
                  <div>
                    <span className="text-gray-400 text-sm block">採用した戦略</span>
                    <span className="text-white text-lg">{report.strategy}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    降下地点 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.landingSpot}
                    onChange={(e) => handleInputChange('landingSpot', e.target.value)}
                    list="landingSpots"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                  <datalist id="landingSpots">
                    {popularLandingSpots.map((spot) => (
                      <option key={spot} value={spot} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    採用した戦略
                  </label>
                  <input
                    type="text"
                    value={formData.strategy}
                    onChange={(e) => handleInputChange('strategy', e.target.value)}
                    list="strategies"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                  <datalist id="strategies">
                    {strategyTemplates.map((strategy) => (
                      <option key={strategy} value={strategy} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}
          </div>

          {/* チーム情報 */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              参加メンバー
            </h2>
            
            {!isEditing ? (
              <div className="space-y-6">
                {report.teammates && report.teammates.length > 0 ? (
                  <div>
                    <span className="text-gray-400 text-sm block mb-3">一緒にプレイしたメンバー ({report.teammates.length}名)</span>
                    <div className="grid md:grid-cols-2 gap-3">
                      {report.teammates.map((teammateId) => {
                        const member = teamMembers.find(m => m.id === teammateId);
                        return member ? (
                          <div key={teammateId} className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center space-x-2 mb-1">
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
                              <div className="text-purple-400 text-xs mt-1">💬 {member.discordId}</div>
                            )}
                          </div>
                        ) : (
                          <div key={teammateId} className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
                            <span className="text-red-400">削除されたメンバー (ID: {teammateId})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    一緒にプレイしたメンバーが選択されていません
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {teamMembers.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">チームメンバーが未登録です</h3>
                    <p className="text-gray-300 mb-4">
                      メンバー管理でチームメンバーを登録してから試合レポートを編集してください。
                    </p>
                    <Link 
                      href="/members/new"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>メンバーを追加</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 振り返り */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              振り返り・分析
            </h2>
            
            {!isEditing ? (
              <div className="space-y-6">
                {report.reflections && (
                  <div>
                    <span className="text-gray-400 text-sm block mb-2">良かった点・成功要因</span>
                    <p className="text-white whitespace-pre-wrap">{report.reflections}</p>
                  </div>
                )}
                {report.challenges && (
                  <div>
                    <span className="text-gray-400 text-sm block mb-2">課題・改善点</span>
                    <p className="text-white whitespace-pre-wrap">{report.challenges}</p>
                  </div>
                )}
                {report.lessonsLearned && (
                  <div>
                    <span className="text-gray-400 text-sm block mb-2">学んだこと・気づき</span>
                    <p className="text-white whitespace-pre-wrap">{report.lessonsLearned}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    良かった点・成功要因
                  </label>
                  <textarea
                    value={formData.reflections}
                    onChange={(e) => handleInputChange('reflections', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white resize-none focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    課題・改善点
                  </label>
                  <textarea
                    value={formData.challenges}
                    onChange={(e) => handleInputChange('challenges', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white resize-none focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    学んだこと・気づき
                  </label>
                  <textarea
                    value={formData.lessonsLearned}
                    onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white resize-none focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* タグ・その他 */}
          <div className="glass-card p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-6">
              タグ・その他
            </h2>
            
            {!isEditing ? (
              <div className="space-y-4">
                {report.tags && report.tags.length > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm block mb-3">タグ</span>
                    <div className="flex flex-wrap gap-2">
                      {report.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 text-sm block">マップバージョン</span>
                  <span className="text-white">{report.mapVersion}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    カスタムタグ
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                      placeholder="新しいタグを入力..."
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    マップバージョン
                  </label>
                  <input
                    type="text"
                    value={formData.mapVersion}
                    onChange={(e) => handleInputChange('mapVersion', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
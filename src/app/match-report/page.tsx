'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Award,
  Zap,
  Shield,
  MapPin,
  Gamepad2
} from 'lucide-react';
import { userStorage, authStorage, matchReportStorage, teamMemberStorage } from '@/lib/storage';
import { MatchReport, MatchStats, TeamMember } from '@/types';

export default function MatchReportPage() {
  const [reports, setReports] = useState<MatchReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<MatchReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'solo' | 'duo' | 'squad' | 'ltm'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'placement' | 'kills' | 'damage'>('date');
  const [stats, setStats] = useState<MatchStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 認証チェック
    const user = userStorage.get();
    const token = authStorage.get();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    loadReports();
  }, [router]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterMode, sortBy]);

  const loadReports = () => {
    setIsLoading(true);
    const allReports = matchReportStorage.getAll();
    const members = teamMemberStorage.getAll();
    setReports(allReports);
    setTeamMembers(members);
    calculateStats(allReports);
    setIsLoading(false);
  };

  const calculateStats = (allReports: MatchReport[]) => {
    if (allReports.length === 0) {
      setStats(null);
      return;
    }

    const totalKills = allReports.reduce((sum, report) => sum + report.kills, 0);
    const totalDamage = allReports.reduce((sum, report) => sum + report.damage, 0);
    const wins = allReports.filter(report => report.placement === 1).length;
    const top10 = allReports.filter(report => report.placement <= 10).length;
    const top25 = allReports.filter(report => report.placement <= 25).length;
    
    const avgSurvivalSeconds = allReports.reduce((sum, report) => {
      const [minutes, seconds] = report.survivalTime.split(':').map(Number);
      return sum + (minutes * 60 + seconds);
    }, 0) / allReports.length;

    const avgSurvivalTime = `${Math.floor(avgSurvivalSeconds / 60)}:${String(Math.floor(avgSurvivalSeconds % 60)).padStart(2, '0')}`;

    const calculatedStats: MatchStats = {
      totalMatches: allReports.length,
      totalKills,
      totalDamage,
      averageKills: Math.round((totalKills / allReports.length) * 10) / 10,
      averageDamage: Math.round(totalDamage / allReports.length),
      averagePlacement: Math.round(allReports.reduce((sum, report) => sum + report.placement, 0) / allReports.length),
      averageSurvivalTime: avgSurvivalTime,
      bestPlacement: Math.min(...allReports.map(report => report.placement)),
      winRate: Math.round((wins / allReports.length) * 1000) / 10,
      top10Rate: Math.round((top10 / allReports.length) * 1000) / 10,
      top25Rate: Math.round((top25 / allReports.length) * 1000) / 10,
      kdr: Math.round((totalKills / Math.max(allReports.length - wins, 1)) * 10) / 10,
      lastUpdated: new Date().toISOString()
    };

    setStats(calculatedStats);
  };

  const filterReports = () => {
    let filtered = reports;

    // ゲームモードフィルター
    if (filterMode !== 'all') {
      filtered = filtered.filter(report => report.gameMode === filterMode);
    }

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.landingSpot.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reflections.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'placement':
          return a.placement - b.placement;
        case 'kills':
          return b.kills - a.kills;
        case 'damage':
          return b.damage - a.damage;
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
  };

  const deleteReport = (id: string) => {
    if (confirm('この試合レポートを削除しますか？')) {
      matchReportStorage.delete(id);
      loadReports();
    }
  };

  const getGameModeIcon = (mode: string) => {
    switch (mode) {
      case 'solo': return <Target className="w-4 h-4" />;
      case 'duo': return <Users className="w-4 h-4" />;
      case 'squad': return <Users className="w-4 h-4" />;
      case 'ltm': return <Zap className="w-4 h-4" />;
      default: return <Gamepad2 className="w-4 h-4" />;
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
      month: 'short',
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
          <p className="text-gray-300">試合レポートを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* ヘッダー */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="text-purple-300 hover:text-white transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ダッシュボードに戻る
              </Link>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-green-400" />
                <h1 className="text-xl font-bold text-white">試合レポート</h1>
              </div>
            </div>
            
            <Link
              href="/match-report/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>新しいレポート</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 統計カード */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Gamepad2 className="w-5 h-5 text-blue-400" />
                <span className="text-lg font-bold text-white">{stats.totalMatches}</span>
              </div>
              <p className="text-gray-300 text-sm">総試合数</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold text-white">#{stats.bestPlacement}</span>
              </div>
              <p className="text-gray-300 text-sm">最高順位</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-orange-400" />
                <span className="text-lg font-bold text-white">{stats.winRate}%</span>
              </div>
              <p className="text-gray-300 text-sm">勝率</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-lg font-bold text-white">{stats.top10Rate}%</span>
              </div>
              <p className="text-gray-300 text-sm">TOP10率</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-red-400" />
                <span className="text-lg font-bold text-white">{stats.averageKills}</span>
              </div>
              <p className="text-gray-300 text-sm">平均キル</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-lg font-bold text-white">{stats.averageDamage}</span>
              </div>
              <p className="text-gray-300 text-sm">平均ダメージ</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-lg font-bold text-white">{stats.averageSurvivalTime}</span>
              </div>
              <p className="text-gray-300 text-sm">平均生存時間</p>
            </div>

            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span className="text-lg font-bold text-white">{stats.kdr}</span>
              </div>
              <p className="text-gray-300 text-sm">K/D比</p>
            </div>
          </div>
        )}

        {/* フィルターとソート */}
        <div className="glass-card p-6 rounded-lg mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="降下地点、戦略、反省点で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
              />
            </div>

            {/* ゲームモードフィルター */}
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'すべて' },
                { key: 'solo', label: 'ソロ' },
                { key: 'duo', label: 'デュオ' },
                { key: 'squad', label: 'スクワッド' },
                { key: 'ltm', label: 'LTM' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setFilterMode(mode.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterMode === mode.key
                      ? 'bg-green-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* ソート */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
            >
              <option value="date">日付順</option>
              <option value="placement">順位順</option>
              <option value="kills">キル数順</option>
              <option value="damage">ダメージ順</option>
            </select>
          </div>
        </div>

        {/* レポート一覧 */}
        {filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="glass-card p-6 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* ゲームモードアイコン */}
                    <div className="flex items-center space-x-2">
                      {getGameModeIcon(report.gameMode)}
                      <span className="text-gray-300 text-sm">{getGameModeLabel(report.gameMode)}</span>
                    </div>

                    {/* 順位 */}
                    <div className={`text-xl font-bold ${getPlacementColor(report.placement)}`}>
                      #{report.placement}
                    </div>

                    {/* 基本情報 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{report.kills} キル</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>{report.damage} ダメージ</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{report.survivalTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{report.landingSpot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">{formatDate(report.date)}</span>
                    <Link
                      href={`/match-report/${report.id}`}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 戦略と振り返り */}
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="text-gray-400 text-sm">戦略: </span>
                    <span className="text-white">{report.strategy}</span>
                  </div>
                  
                  {/* 参加メンバー情報 */}
                  {report.teammates && report.teammates.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm">参加メンバー: </span>
                      <span className="text-blue-300">{getTeammateNames(report.teammates)}</span>
                    </div>
                  )}
                  
                  {report.reflections && (
                    <div>
                      <span className="text-gray-400 text-sm">振り返り: </span>
                      <span className="text-gray-300">{report.reflections.length > 100 ? report.reflections.substring(0, 100) + '...' : report.reflections}</span>
                    </div>
                  )}
                  
                  {/* タグ表示 */}
                  {report.tags && report.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-gray-400 text-sm">タグ:</span>
                      <div className="flex flex-wrap gap-1">
                        {report.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {report.tags.length > 3 && (
                          <span className="text-gray-400 text-xs">+{report.tags.length - 3}個</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {reports.length === 0 ? '試合レポートがありません' : '条件に合うレポートが見つかりません'}
            </h3>
            <p className="text-gray-300 mb-6">
              {reports.length === 0 
                ? '最初の試合レポートを作成して、戦績を記録しましょう'
                : '検索条件やフィルターを変更してください'
              }
            </p>
            {reports.length === 0 && (
              <Link
                href="/match-report/new"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>最初のレポートを作成</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
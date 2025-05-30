'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Award, 
  MapPin, 
  Clock, 
  Users, 
  Zap, 
  Shield, 
  Trophy,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { userStorage, authStorage, matchReportStorage, teamMemberStorage } from '@/lib/storage';
import { MatchReport, MatchStats, LandingSpotStats, StrategyAnalysis } from '@/types';

export default function AnalyticsPage() {
  const [reports, setReports] = useState<MatchReport[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [gameMode, setGameMode] = useState<'all' | 'solo' | 'duo' | 'squad' | 'ltm'>('all');
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

    loadData();
  }, [router]);

  const loadData = () => {
    setIsLoading(true);
    const allReports = matchReportStorage.getAll();
    setReports(allReports);
    setIsLoading(false);
  };

  // フィルタリングされたレポート
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // 時間範囲フィルター
    if (timeRange !== 'all') {
      const days = parseInt(timeRange.replace('d', ''));
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter(report => new Date(report.date) >= cutoff);
    }

    // ゲームモードフィルター
    if (gameMode !== 'all') {
      filtered = filtered.filter(report => report.gameMode === gameMode);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, timeRange, gameMode]);

  // 基本統計の計算
  const basicStats = useMemo(() => {
    if (filteredReports.length === 0) return null;

    const totalKills = filteredReports.reduce((sum, r) => sum + r.kills, 0);
    const totalDamage = filteredReports.reduce((sum, r) => sum + r.damage, 0);
    const wins = filteredReports.filter(r => r.placement === 1).length;
    const top10 = filteredReports.filter(r => r.placement <= 10).length;
    const top25 = filteredReports.filter(r => r.placement <= 25).length;

    return {
      totalMatches: filteredReports.length,
      averageKills: Math.round((totalKills / filteredReports.length) * 10) / 10,
      averageDamage: Math.round(totalDamage / filteredReports.length),
      averagePlacement: Math.round(filteredReports.reduce((sum, r) => sum + r.placement, 0) / filteredReports.length),
      winRate: Math.round((wins / filteredReports.length) * 1000) / 10,
      top10Rate: Math.round((top10 / filteredReports.length) * 1000) / 10,
      top25Rate: Math.round((top25 / filteredReports.length) * 1000) / 10,
      bestPlacement: Math.min(...filteredReports.map(r => r.placement)),
      worstPlacement: Math.max(...filteredReports.map(r => r.placement))
    };
  }, [filteredReports]);

  // 降下地点分析
  const landingSpotAnalysis = useMemo(() => {
    if (filteredReports.length === 0) return [];

    const spotStats: { [key: string]: LandingSpotStats } = {};

    filteredReports.forEach(report => {
      const spot = report.landingSpot;
      if (!spotStats[spot]) {
        spotStats[spot] = {
          name: spot,
          matches: 0,
          averageKills: 0,
          averagePlacement: 0,
          winRate: 0,
          survivalRate: 0
        };
      }

      spotStats[spot].matches++;
    });

    // 各地点の詳細統計を計算
    Object.keys(spotStats).forEach(spot => {
      const spotReports = filteredReports.filter(r => r.landingSpot === spot);
      const totalKills = spotReports.reduce((sum, r) => sum + r.kills, 0);
      const totalPlacement = spotReports.reduce((sum, r) => sum + r.placement, 0);
      const wins = spotReports.filter(r => r.placement === 1).length;
      const survival = spotReports.filter(r => r.placement <= 50).length; // 上位50%を生存とする

      spotStats[spot].averageKills = Math.round((totalKills / spotReports.length) * 10) / 10;
      spotStats[spot].averagePlacement = Math.round(totalPlacement / spotReports.length);
      spotStats[spot].winRate = Math.round((wins / spotReports.length) * 1000) / 10;
      spotStats[spot].survivalRate = Math.round((survival / spotReports.length) * 1000) / 10;
    });

    return Object.values(spotStats)
      .filter(stat => stat.matches >= 2) // 最低2試合以上
      .sort((a, b) => b.matches - a.matches);
  }, [filteredReports]);

  // 戦略分析
  const strategyAnalysis = useMemo(() => {
    if (filteredReports.length === 0) return [];

    const strategyStats: { [key: string]: StrategyAnalysis } = {};

    filteredReports.forEach(report => {
      const strategy = report.strategy;
      if (!strategyStats[strategy]) {
        strategyStats[strategy] = {
          strategy,
          frequency: 0,
          successRate: 0,
          averagePlacement: 0,
          bestResult: 100
        };
      }

      strategyStats[strategy].frequency++;
    });

    // 各戦略の詳細統計を計算
    Object.keys(strategyStats).forEach(strategy => {
      const strategyReports = filteredReports.filter(r => r.strategy === strategy);
      const totalPlacement = strategyReports.reduce((sum, r) => sum + r.placement, 0);
      const successes = strategyReports.filter(r => r.placement <= 10).length; // TOP10を成功とする
      const bestResult = Math.min(...strategyReports.map(r => r.placement));

      strategyStats[strategy].averagePlacement = Math.round(totalPlacement / strategyReports.length);
      strategyStats[strategy].successRate = Math.round((successes / strategyReports.length) * 1000) / 10;
      strategyStats[strategy].bestResult = bestResult;
    });

    return Object.values(strategyStats)
      .filter(stat => stat.frequency >= 2)
      .sort((a, b) => b.successRate - a.successRate);
  }, [filteredReports]);

  // パフォーマンストレンド
  const performanceTrend = useMemo(() => {
    if (filteredReports.length < 5) return null;

    const recent = filteredReports.slice(0, Math.ceil(filteredReports.length / 3));
    const older = filteredReports.slice(Math.ceil(filteredReports.length * 2 / 3));

    const recentAvgPlacement = recent.reduce((sum, r) => sum + r.placement, 0) / recent.length;
    const olderAvgPlacement = older.reduce((sum, r) => sum + r.placement, 0) / older.length;

    const recentAvgKills = recent.reduce((sum, r) => sum + r.kills, 0) / recent.length;
    const olderAvgKills = older.reduce((sum, r) => sum + r.kills, 0) / older.length;

    return {
      placementTrend: olderAvgPlacement - recentAvgPlacement, // プラスなら改善
      killsTrend: recentAvgKills - olderAvgKills, // プラスなら改善
      isImproving: (olderAvgPlacement - recentAvgPlacement) > 0
    };
  }, [filteredReports]);

  // 改善提案の生成
  const suggestions = useMemo(() => {
    if (!basicStats || filteredReports.length < 3) return [];

    const suggestions = [];

    // 勝率が低い場合
    if (basicStats.winRate < 5) {
      suggestions.push({
        type: 'warning',
        title: '勝率向上',
        content: '安全プレイを心がけ、序盤の生存を優先してみましょう。エッジムーブで早期の戦闘を避けることが重要です。'
      });
    }

    // キル数が少ない場合
    if (basicStats.averageKills < 2) {
      suggestions.push({
        type: 'info',
        title: 'キル数向上',
        content: '積極的な戦闘を増やしてみましょう。人気降下地点での序盤戦闘や、ローテーション時の戦闘機会を狙ってみてください。'
      });
    }

    // 降下地点の偏り
    if (landingSpotAnalysis.length > 0) {
      const bestSpot = landingSpotAnalysis[0];
      if (bestSpot.winRate > basicStats.winRate * 1.5) {
        suggestions.push({
          type: 'success',
          title: '降下地点最適化',
          content: `${bestSpot.name}での成績が良好です。この地点での戦略を他の地点にも応用してみましょう。`
        });
      }
    }

    // パフォーマンストレンド
    if (performanceTrend && performanceTrend.isImproving) {
      suggestions.push({
        type: 'success',
        title: 'パフォーマンス向上中',
        content: '最近の成績が向上しています！現在の戦略を継続し、さらなる改善を目指しましょう。'
      });
    } else if (performanceTrend && !performanceTrend.isImproving) {
      suggestions.push({
        type: 'warning',
        title: '成績下降傾向',
        content: '最近の成績が下降気味です。戦略の見直しや新しいアプローチを試してみることをお勧めします。'
      });
    }

    return suggestions.slice(0, 4); // 最大4つまで
  }, [basicStats, landingSpotAnalysis, performanceTrend, filteredReports.length]);

  const exportData = () => {
    const analyticsData = {
      basicStats,
      landingSpotAnalysis,
      strategyAnalysis,
      performanceTrend,
      filteredReports: filteredReports.map(r => ({
        date: r.date,
        gameMode: r.gameMode,
        placement: r.placement,
        kills: r.kills,
        damage: r.damage,
        landingSpot: r.landingSpot,
        strategy: r.strategy
      })),
      generatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fortplan-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">分析データを読み込んでいます...</p>
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
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold text-white">詳細分析</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => loadData()}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={exportData}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>データ出力</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* フィルター */}
          <div className="glass-card p-6 rounded-lg">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">期間</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="7d">過去7日</option>
                  <option value="30d">過去30日</option>
                  <option value="90d">過去90日</option>
                  <option value="all">全期間</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">ゲームモード</label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all">すべて</option>
                  <option value="solo">ソロ</option>
                  <option value="duo">デュオ</option>
                  <option value="squad">スクワッド</option>
                  <option value="ltm">LTM</option>
                </select>
              </div>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">分析データがありません</h3>
              <p className="text-gray-300 mb-6">
                選択した条件に合う試合データが見つかりません。フィルターを変更するか、試合レポートを追加してください。
              </p>
              <Link
                href="/match-report"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>試合レポートを確認</span>
              </Link>
            </div>
          ) : (
            <>
              {/* 基本統計 */}
              {basicStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-lg font-bold text-white">{basicStats.winRate}%</span>
                    </div>
                    <p className="text-gray-300 text-sm">勝率</p>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-lg font-bold text-white">{basicStats.top10Rate}%</span>
                    </div>
                    <p className="text-gray-300 text-sm">TOP10率</p>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-red-400" />
                      <span className="text-lg font-bold text-white">{basicStats.averageKills}</span>
                    </div>
                    <p className="text-gray-300 text-sm">平均キル</p>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-5 h-5 text-orange-400" />
                      <span className="text-lg font-bold text-white">#{basicStats.averagePlacement}</span>
                    </div>
                    <p className="text-gray-300 text-sm">平均順位</p>
                  </div>

                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <span className="text-lg font-bold text-white">{basicStats.totalMatches}</span>
                    </div>
                    <p className="text-gray-300 text-sm">試合数</p>
                  </div>
                </div>
              )}

              {/* パフォーマンストレンド */}
              {performanceTrend && (
                <div className="glass-card p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    パフォーマンストレンド
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${performanceTrend.placementTrend > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <TrendingUp className={`w-6 h-6 ${performanceTrend.placementTrend > 0 ? 'text-green-400' : 'text-red-400 rotate-180'}`} />
                      </div>
                      <div>
                        <div className="text-white font-semibold">順位トレンド</div>
                        <div className={`text-sm ${performanceTrend.placementTrend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {performanceTrend.placementTrend > 0 ? '改善' : '悪化'} 
                          ({Math.abs(performanceTrend.placementTrend).toFixed(1)}位)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${performanceTrend.killsTrend > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <Target className={`w-6 h-6 ${performanceTrend.killsTrend > 0 ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <div className="text-white font-semibold">キルトレンド</div>
                        <div className={`text-sm ${performanceTrend.killsTrend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {performanceTrend.killsTrend > 0 ? '増加' : '減少'} 
                          ({Math.abs(performanceTrend.killsTrend).toFixed(1)}キル)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 改善提案 */}
              {suggestions.length > 0 && (
                <div className="glass-card p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    改善提案
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        suggestion.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                        suggestion.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <div className="flex items-start space-x-3">
                          {suggestion.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                          ) : suggestion.type === 'warning' ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                          ) : (
                            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                          )}
                          <div>
                            <h3 className={`font-medium ${
                              suggestion.type === 'success' ? 'text-green-300' :
                              suggestion.type === 'warning' ? 'text-yellow-300' :
                              'text-blue-300'
                            }`}>
                              {suggestion.title}
                            </h3>
                            <p className="text-gray-300 text-sm mt-1">{suggestion.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 降下地点分析 */}
              {landingSpotAnalysis.length > 0 && (
                <div className="glass-card p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    降下地点分析
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-300">地点名</th>
                          <th className="text-right py-3 px-4 text-gray-300">試合数</th>
                          <th className="text-right py-3 px-4 text-gray-300">勝率</th>
                          <th className="text-right py-3 px-4 text-gray-300">平均キル</th>
                          <th className="text-right py-3 px-4 text-gray-300">平均順位</th>
                          <th className="text-right py-3 px-4 text-gray-300">生存率</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landingSpotAnalysis.slice(0, 10).map((spot, index) => (
                          <tr key={spot.name} className="border-b border-gray-800 hover:bg-white/5">
                            <td className="py-3 px-4 text-white font-medium">{spot.name}</td>
                            <td className="py-3 px-4 text-right text-gray-300">{spot.matches}</td>
                            <td className="py-3 px-4 text-right text-white">{spot.winRate}%</td>
                            <td className="py-3 px-4 text-right text-white">{spot.averageKills}</td>
                            <td className="py-3 px-4 text-right text-white">#{spot.averagePlacement}</td>
                            <td className="py-3 px-4 text-right text-white">{spot.survivalRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 戦略分析 */}
              {strategyAnalysis.length > 0 && (
                <div className="glass-card p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    戦略分析
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {strategyAnalysis.slice(0, 8).map((strategy) => (
                      <div key={strategy.strategy} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-medium">{strategy.strategy}</h3>
                          <span className="text-gray-400 text-sm">{strategy.frequency}回</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">成功率</span>
                            <span className="text-green-400">{strategy.successRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">平均順位</span>
                            <span className="text-white">#{strategy.averagePlacement}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">最高順位</span>
                            <span className="text-yellow-400">#{strategy.bestResult}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Gamepad2, 
  Map, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  Plus,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Trophy,
  Crosshair,
  Bell,
  Info,
  AlertTriangle,
  Zap,
  Wrench,
  Star
} from 'lucide-react';
import { userStorage, authStorage, strategyBoardStorage, matchReportStorage, teamMemberStorage, operatorMessageStorage } from '@/lib/storage';
import { User, OperatorMessage } from '@/types';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [operatorMessages, setOperatorMessages] = useState<OperatorMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // 統計データ
  const [stats, setStats] = useState({
    totalBoards: 0,
    totalMatches: 0,
    totalMembers: 0,
    avgPlacement: 0,
    totalKills: 0
  });

  useEffect(() => {
    // 認証チェック
    const savedUser = userStorage.get();
    const token = authStorage.get();
    
    if (!savedUser || !token) {
      router.push('/login');
      return;
    }

    // デモユーザーが存在しない場合は作成
    if (savedUser.email === 'demo@fortplan.com' && !savedUser.teamName) {
      const demoUser: User = {
        id: 'demo-user-001',
        email: 'demo@fortplan.com',
        teamName: 'Demo Team',
        representativeName: 'デモユーザー',
        isPaid: true,
        createdAt: new Date().toISOString()
      };
      userStorage.set(demoUser);
      setUser(demoUser);
    } else {
      setUser(savedUser);
    }

    // 統計データを計算
    calculateStats();

    // 運営メッセージを読み込み
    loadOperatorMessages();
    
    setIsLoading(false);
  }, [router]);

  const calculateStats = () => {
    const boards = strategyBoardStorage.getAll();
    const matches = matchReportStorage.getAll();
    const members = teamMemberStorage.getAll();
    
    const avgPlacement = matches.length > 0 
      ? Math.round(matches.reduce((sum, match) => sum + match.placement, 0) / matches.length)
      : 0;
    
    const totalKills = matches.reduce((sum, match) => sum + match.kills, 0);

    setStats({
      totalBoards: boards.length,
      totalMatches: matches.length,
      totalMembers: members.length,
      avgPlacement,
      totalKills
    });
  };

  const loadOperatorMessages = () => {
    const messages = operatorMessageStorage.getRecent(3);
    const unread = operatorMessageStorage.getUnreadCount();
    setOperatorMessages(messages);
    setUnreadCount(unread);
  };

  const handleMessageRead = (messageId: string) => {
    operatorMessageStorage.markAsRead(messageId);
    loadOperatorMessages();
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'update': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-orange-400" />;
      case 'feature': return <Star className="w-4 h-4 text-green-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return 'お知らせ';
      case 'warning': return '注意事項';
      case 'update': return 'アップデート';
      case 'maintenance': return 'メンテナンス';
      case 'feature': return '新機能';
      default: return 'お知らせ';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今日';
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    userStorage.remove();
    authStorage.remove();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { icon: <Map className="w-5 h-5" />, label: '戦略ボード', href: '/strategy-board', color: 'text-blue-400' },
    { icon: <Users className="w-5 h-5" />, label: 'メンバー管理', href: '/members', color: 'text-teal-400' },
    { icon: <BarChart3 className="w-5 h-5" />, label: '試合レポート', href: '/match-report', color: 'text-green-400' },
    { icon: <Crosshair className="w-5 h-5" />, label: '武器・アイテム', href: '/weapons', color: 'text-red-400' },
    { icon: <TrendingUp className="w-5 h-5" />, label: '詳細分析', href: '/analytics', color: 'text-orange-400' },
  ];

  const quickActions = [
    { icon: <Plus className="w-6 h-6" />, label: '新しい戦略ボード', href: '/strategy-board/new', bgColor: 'bg-blue-600' },
    { icon: <Users className="w-6 h-6" />, label: 'メンバー追加', href: '/members/new', bgColor: 'bg-teal-600' },
    { icon: <Calendar className="w-6 h-6" />, label: '試合レポート追加', href: '/match-report/new', bgColor: 'bg-green-600' },
    { icon: <Crosshair className="w-6 h-6" />, label: '武器・アイテム確認', href: '/weapons', bgColor: 'bg-red-600' },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* ヘッダー */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">FortPlan</span>
              </div>
              <div className="hidden md:block">
                <span className="text-gray-300">|</span>
                <span className="text-gray-300 ml-4">チーム: {user.teamName}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">こんにちは、{user.representativeName}さん</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* ウェルカムセクション */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ダッシュボード
          </h1>
          <p className="text-gray-300">
            FortPlanでチームの戦略を次のレベルへ
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-400">
                <Map className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalBoards}</span>
            </div>
            <p className="text-gray-300 text-sm">戦略ボード</p>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-teal-400">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalMembers}</span>
            </div>
            <p className="text-gray-300 text-sm">チームメンバー</p>
          </div>

          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalMatches}</span>
            </div>
            <p className="text-gray-300 text-sm">試合レポート</p>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-yellow-400">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white">
                {stats.avgPlacement > 0 ? `#${stats.avgPlacement}` : '-'}
              </span>
            </div>
            <p className="text-gray-300 text-sm">平均順位</p>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-red-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalKills}</span>
            </div>
            <p className="text-gray-300 text-sm">総キル数</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* メインメニュー */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">主な機能</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <Link 
                  key={index}
                  href={item.href}
                  className="glass-card p-6 rounded-lg hover:transform hover:scale-105 transition-all duration-300 group"
                >
                  <div className={`${item.color} mb-4 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.label}</h3>
                  <p className="text-gray-400 text-sm">
                    {item.label === '戦略ボード' && 'マップ上で戦略を視覚的に計画'}
                    {item.label === 'メンバー管理' && 'チームメンバーの情報と統計管理'}
                    {item.label === '試合レポート' && '試合結果の記録と分析'}
                    {item.label === '武器・アイテム' && 'Fortniteの武器とアイテム情報'}
                    {item.label === '詳細分析' && 'チーム成績の詳細分析'}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* クイックアクション */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">クイックアクション</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <Link 
                  key={index}
                  href={action.href}
                  className={`${action.bgColor} p-4 rounded-lg flex items-center space-x-3 hover:opacity-90 transition-opacity`}
                >
                  <div className="text-white">
                    {action.icon}
                  </div>
                  <span className="text-white font-medium">{action.label}</span>
                </Link>
              ))}
            </div>

            {/* 運営からのお知らせ */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-purple-400" />
                  運営からのお知らせ
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {operatorMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`glass-card p-4 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                      !message.isRead ? 'border-l-4 border-purple-400' : ''
                    }`}
                    onClick={() => handleMessageRead(message.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getMessageIcon(message.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${
                            message.type === 'info' ? 'bg-blue-600/30' :
                            message.type === 'warning' ? 'bg-yellow-600/30' :
                            message.type === 'update' ? 'bg-purple-600/30' :
                            message.type === 'maintenance' ? 'bg-orange-600/30' :
                            'bg-green-600/30'
                          }`}>
                            {getMessageTypeLabel(message.type)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(message.publishedAt)}
                          </span>
                        </div>
                        <h4 className={`text-sm font-medium mb-1 ${
                          !message.isRead ? 'text-white' : 'text-gray-300'
                        }`}>
                          {message.title}
                        </h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {message.content.length > 80 
                            ? `${message.content.substring(0, 80)}...` 
                            : message.content
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {operatorMessages.length === 0 && (
                  <div className="glass-card p-4 rounded-lg text-center">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">現在、お知らせはありません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
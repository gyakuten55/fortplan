'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Target, 
  Map, 
  BarChart3, 
  Download, 
  Users, 
  Star, 
  CheckCircle,
  ArrowRight,
  Gamepad2,
  TrendingUp,
  Shield,
  Zap,
  Award,
  PlayCircle,
  Clock,
  Trophy,
  Eye,
  ChevronRight,
  X
} from 'lucide-react';

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const features = [
    {
      icon: <Map className="w-8 h-8" />,
      title: "戦略ボード",
      description: "リアルタイム戦略立案",
      details: "FortniteAPIから最新マップを取得し、降下地点分析、建築プランニング、資材調達ルートを視覚的に設計。チーム全員で同時編集可能。",
      benefits: ["勝率20%向上", "チーム連携強化", "戦略の可視化"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "試合レポート",
      description: "詳細な戦績分析システム",
      details: "順位、キル数、ダメージ量を自動記録し、過去データと比較分析。弱点を特定し、改善提案を自動生成します。",
      benefits: ["弱点の明確化", "成長の可視化", "改善提案"]
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "武器・アイテム分析",
      description: "最適ロードアウト提案",
      details: "FortniteAPIから最新の武器データを取得し、各メンバーのプレイスタイルに最適なロードアウトを自動提案します。",
      benefits: ["最新メタ対応", "個人最適化", "DPS向上"]
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "データエクスポート",
      description: "高品質な戦略共有",
      details: "作成した戦略ボードや分析レポートを高品質なPDFや画像として出力。チーム外のコーチとも簡単に共有できます。",
      benefits: ["簡単共有", "高品質出力", "コーチ連携"]
    }
  ];

  const testimonials = [
    {
      name: "Thunder Squad",
      role: "プロチーム",
      comment: "FortPlanを導入してから、チームの戦略理解度が飛躍的に向上しました。特に新メンバーの戦術習得が早くなりました。",
      rating: 5,
      improvement: "勝率35%向上",
      avatar: "⚡"
    },
    {
      name: "Phoenix Hunters",
      role: "セミプロチーム", 
      comment: "視覚的な戦略共有で、言葉だけでは伝わらない細かい位置取りまで完璧に共有できるようになりました。",
      rating: 5,
      improvement: "連携ミス80%減少",
      avatar: "🔥"
    },
    {
      name: "Storm Raiders",
      role: "アマチュアチーム",
      comment: "試合後の分析が効率化され、次の試合への準備時間が大幅に短縮されました。データに基づいた改善ができています。",
      rating: 5,
      improvement: "分析時間50%短縮",
      avatar: "⛈️"
    }
  ];

  const pricingFeatures = [
    "✨ 戦略ボード（無制限作成）",
    "🗺️ 最新マップ自動取得",
    "📊 詳細試合レポート機能", 
    "🔫 武器・アイテム情報（リアルタイム更新）",
    "📈 高度な統計分析・傾向分析",
    "📄 PDFエクスポート",
    "🖼️ PNGエクスポート",
    "💾 ローカルデータ保存",
    "🎯 優先サポート",
    "🏆 プロチーム戦略テンプレート"
  ];

  const stats = [
    { number: "4つ", label: "主要機能", icon: <Target className="w-6 h-6" /> },
    { number: "250%", label: "目標勝率向上", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "99.9%", label: "稼働率", icon: <Shield className="w-6 h-6" /> },
    { number: "24/7", label: "サポート", icon: <Clock className="w-6 h-6" /> }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen fortnite-bg">
      {/* ヘッダー */}
      <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-purple-500/30">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Gamepad2 className="w-10 h-10 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FortPlan
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/login" 
                className="text-blue-300 hover:text-white transition-colors font-medium"
              >
                ログイン
              </Link>
              <Link 
                href="/purchase" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all font-bold shadow-lg shadow-purple-500/25 pulse-glow"
              >
                今すぐ購入
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* ヒーローセクション */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-6">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 inline-block battle-royale-badge">
                🎮 次世代フォートナイト戦略プランニングツール
              </span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                戦略的
              </span>
              アプローチで<br />
              チームを強化
            </h1>
            
            <p className="text-2xl text-blue-100 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
              プロレベルの戦略分析で、あなたのチームを<br />
              <span className="text-yellow-400 font-bold">勝率250%向上</span>させる究極のプランニングツール
            </p>

            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 mb-16">
              <Link 
                href="/purchase" 
                className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white px-12 py-5 rounded-full text-xl font-black hover:scale-105 transition-all shadow-2xl shadow-red-500/50 victory-button group flex items-center"
              >
                <Trophy className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                利用する
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button 
                onClick={() => document.getElementById('app-ui')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-blue-400 text-blue-400 px-8 py-5 rounded-full text-xl font-bold hover:bg-blue-400 hover:text-black transition-all flex items-center group"
              >
                <Eye className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                詳細を見る
              </button>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="glass-card-enhanced p-6 text-center">
                  <div className="text-blue-400 mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black text-white mb-1">{stat.number}</div>
                  <div className="text-blue-200 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* アプリUI紹介セクション */}
      <section id="app-ui" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-6">実際のアプリ画面</h2>
            <p className="text-blue-200 text-xl">プロ仕様の戦略ツールを体験してください</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="glass-card-enhanced p-4 rounded-xl">
                <Image
                  src="/images/strategy-board-screenshot.png"
                  alt="戦略ボード画面"
                  width={1200}
                  height={800}
                  className="rounded-lg w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  quality={100}
                  priority
                  onClick={() => setEnlargedImage("/images/strategy-board-screenshot.png")}
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold text-white mb-4">🗺️ 戦略ボード</h3>
              <p className="text-blue-200 text-lg mb-6">
                最新のフォートナイトマップ上で、チーム全員がリアルタイムで戦略を共有。
                降下地点から最終円まで、完璧な戦略を立案できます。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  FortniteAPI連携で常に最新マップ
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  リアルタイム同時編集
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  建築プランニング機能
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  チーム位置追跡
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">📊 試合レポート分析</h3>
              <p className="text-blue-200 text-lg mb-6">
                詳細な戦績データを自動収集・分析し、チームの弱点と改善点を明確に可視化。
                データドリブンな成長を実現します。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  自動データ収集・分析
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  弱点の自動特定
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  改善提案の自動生成
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  チーム成長トラッキング
                </li>
              </ul>
            </div>
            <div>
              <div className="glass-card-enhanced p-4 rounded-xl">
                <Image
                  src="/images/match-report-screenshot.png"
                  alt="試合レポート画面"
                  width={1200}
                  height={800}
                  className="rounded-lg w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  quality={100}
                  onClick={() => setEnlargedImage("/images/match-report-screenshot.png")}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
            <div className="order-2 md:order-1">
              <div className="glass-card-enhanced p-4 rounded-xl">
                <Image
                  src="/images/weapon-analysis-screenshot.png"
                  alt="武器分析画面"
                  width={1200}
                  height={800}
                  className="rounded-lg w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  quality={100}
                  onClick={() => setEnlargedImage("/images/weapon-analysis-screenshot.png")}
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold text-white mb-4">🔫 武器・アイテム分析</h3>
              <p className="text-blue-200 text-lg mb-6">
                FortniteAPIから最新の武器データを取得し、各メンバーのプレイスタイルに最適なロードアウトを自動提案。
                常に最新のメタに対応します。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  リアルタイム武器データ更新
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  個人プレイスタイル分析
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  最適ロードアウト提案
                </li>
                <li className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-3" />
                  メタ変更通知
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 購入セクション */}
      <section className="py-20 bg-gradient-to-b from-purple-900/20 to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-6">FortPlanを手に入れる</h2>
            <p className="text-blue-200 text-xl">次世代フォートナイト戦略プランニングツール</p>
          </div>
          
          <div className="max-w-lg mx-auto">
            <div className="glass-card-enhanced p-10 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-2 rounded-full text-lg font-black mb-6 inline-block">
                  🎮 プロ戦略ツール
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">FortPlan</h3>
                <div className="flex justify-center items-end mb-2">
                  <span className="text-6xl font-black text-white">1000</span>
                  <span className="text-2xl text-blue-300 mb-2">円/月</span>
                </div>
                <p className="text-blue-300 mb-6">6月末までの早期購入特典</p>
                
                <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-8">
                  <p className="text-orange-300 font-bold">
                    🚀 6月末までに購入で永久月1000円
                  </p>
                  <p className="text-orange-200 text-sm mt-1">
                    早期購入者限定の特別価格です
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-white">
                  <span className="text-green-400 mr-3 text-lg">🗺️</span>
                  <span>戦略ボード（リアルタイム戦略立案）</span>
                </li>
                <li className="flex items-center text-white">
                  <span className="text-green-400 mr-3 text-lg">📊</span>
                  <span>試合レポート（詳細な戦績分析）</span>
                </li>
                <li className="flex items-center text-white">
                  <span className="text-green-400 mr-3 text-lg">🔫</span>
                  <span>武器・アイテム分析（最適ロードアウト提案）</span>
                </li>
                <li className="flex items-center text-white">
                  <span className="text-green-400 mr-3 text-lg">📄</span>
                  <span>データエクスポート（PDF・PNG出力）</span>
                </li>
                <li className="flex items-center text-white">
                  <span className="text-green-400 mr-3 text-lg">⚡</span>
                  <span>FortniteAPI連携（最新データ自動取得）</span>
                </li>
                <li className="flex items-center text-white">
                  <span className="text-green-400 mr-3 text-lg">👥</span>
                  <span>チーム管理・メンバー招待機能</span>
                </li>
              </ul>

              <Link 
                href="/purchase" 
                className="w-full block text-center py-5 rounded-xl font-black text-xl transition-all bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25 pulse-glow mb-4"
              >
                🚀 詳細・購入情報を確認
              </Link>
              
              <p className="text-center text-sm text-blue-300">
                ✅ リリース前情報公開 ✅ 早期アクセス予約受付中
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section id="features" className="py-20 bg-gradient-to-b from-transparent to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-6">勝利を導く4つの武器</h2>
            <p className="text-blue-200 text-xl">プロチームが使う戦略ツールを、あなたのチームに</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card-enhanced p-8 text-center cursor-pointer group hover:scale-105 transition-all duration-300"
                onClick={() => setActiveFeature(index)}
              >
                <div className="text-blue-400 mb-6 flex justify-center group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-blue-200 mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <span key={i} className="inline-block bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2">
                      {benefit}
                    </span>
                  ))}
                </div>
                <ChevronRight className="w-5 h-5 text-purple-400 mx-auto mt-4 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>

          {/* 機能詳細 */}
          <div className="glass-card-enhanced p-10 rounded-xl">
            <div className="flex items-center mb-8">
              <div className="text-blue-400 mr-4 bg-blue-500/20 p-4 rounded-lg">
                {features[activeFeature].icon}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">{features[activeFeature].title}</h3>
                <p className="text-blue-300 text-lg">{features[activeFeature].description}</p>
              </div>
            </div>
            <p className="text-blue-100 text-lg leading-relaxed mb-6">
              {features[activeFeature].details}
            </p>
            <div className="flex flex-wrap gap-3">
              {features[activeFeature].benefits.map((benefit, i) => (
                <span key={i} className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 px-4 py-2 rounded-full font-medium border border-green-500/30">
                  ✓ {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ビデオモーダル */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <PlayCircle className="w-24 h-24 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">実戦動画デモ</h3>
              <p className="text-blue-200 mb-6">
                実際のチームがFortPlanを使って戦略を立案し、勝利を収める様子をご覧ください
              </p>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                動画を再生
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 拡大画像モーダル */}
      {enlargedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-7xl w-full">
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative">
              <Image
                src={enlargedImage}
                alt="拡大画像"
                width={1600}
                height={1067}
                className="rounded-lg w-full h-auto"
                quality={100}
              />
            </div>
          </div>
        </div>
      )}

      {/* フッター */}
      <footer className="border-t border-purple-500/30 py-12 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FortPlan
              </span>
            </div>
            <div className="text-blue-300">
              © 2024 FortPlan. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Zap, Shield, Crosshair } from 'lucide-react';
import { userStorage, authStorage } from '@/lib/storage';
import { getWeapons, getItems, getRarityColor, getRarityBgColor, FortniteWeapon, FortniteItem } from '@/lib/fortnite-api';

export default function WeaponsPage() {
  const [weapons, setWeapons] = useState<FortniteWeapon[]>([]);
  const [items, setItems] = useState<FortniteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'weapons' | 'items'>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [weaponsData, itemsData] = await Promise.all([
        getWeapons(),
        getItems()
      ]);
      setWeapons(weaponsData);
      setItems(itemsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = () => {
    let allData: (FortniteWeapon | FortniteItem)[] = [];
    
    if (selectedCategory === 'all') {
      allData = [...weapons, ...items];
    } else if (selectedCategory === 'weapons') {
      allData = weapons;
    } else {
      allData = items;
    }

    return allData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity;
      
      return matchesSearch && matchesRarity;
    });
  };

  const categories = [
    { id: 'all', label: 'すべて', icon: Filter },
    { id: 'weapons', label: '武器', icon: Crosshair },
    { id: 'items', label: 'アイテム', icon: Shield }
  ];

  const rarities = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">データを読み込んでいます...</p>
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
                <Crosshair className="w-6 h-6 text-purple-400" />
                <h1 className="text-xl font-bold text-white">武器・アイテム</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 検索・フィルター */}
          <div className="glass-card p-6 rounded-lg mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">検索</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="武器やアイテムを検索..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">カテゴリ</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">レアリティ</label>
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all">すべて</option>
                  <option value="common">コモン</option>
                  <option value="uncommon">アンコモン</option>
                  <option value="rare">レア</option>
                  <option value="epic">エピック</option>
                  <option value="legendary">レジェンダリー</option>
                  <option value="mythic">ミシック</option>
                </select>
              </div>
            </div>
          </div>

          {/* データ表示 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData().map((item) => (
              <div key={item.id} className={`glass-card p-4 rounded-lg border ${getRarityBgColor(item.rarity)}`}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Crosshair className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  <h3 className={`font-bold mb-2 ${getRarityColor(item.rarity)}`}>
                    {item.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">タイプ:</span>
                      <span className="text-white">{item.type}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">レアリティ:</span>
                      <span className={getRarityColor(item.rarity)}>
                        {item.rarity}
                      </span>
                    </div>
                    
                    {'damage' in item && item.damage && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">ダメージ:</span>
                        <span className="text-white">{item.damage}</span>
                      </div>
                    )}
                    
                    {'dps' in item && item.dps && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">DPS:</span>
                        <span className="text-white">{item.dps}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredData().length === 0 && (
            <div className="text-center py-12">
              <Crosshair className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">データが見つかりません</h3>
              <p className="text-gray-300">
                検索条件を変更してお試しください。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
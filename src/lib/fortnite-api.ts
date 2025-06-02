// Fortnite API integration
const FORTNITE_API_KEY = '659ebb27-ca2c605c-a1138c3b-95c40fd5';
const BASE_URL = 'https://fortniteapi.io';

export interface FortniteMapData {
  id: string;
  name: string;
  imageUrl: string;
  pois: Array<{
    id: string;
    name: string;
    location: {
      x: number;
      y: number;
    };
  }>;
}

export interface FortniteWeapon {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  type: string;
  image: string;
  damage?: number;
  dps?: number;
}

export interface FortniteItem {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  type: string;
  image: string;
}

export interface FortnitePOI {
  id: string;
  name: string;
  x: number;
  y: number;
}

// APIリクエスト用のベース関数
async function apiRequest(endpoint: string) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': FORTNITE_API_KEY,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // 1時間キャッシュ
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fortnite API Error:', error);
    throw error;
  }
}

// POIデータを取得
async function getPOIs(): Promise<FortnitePOI[]> {
  try {
    const data = await apiRequest('/v2/game/poi?lang=ja');
    return data.list?.map((poi: any) => ({
      id: poi.id,
      name: poi.name,
      x: poi.x,
      y: poi.y
    })) || [];
  } catch (error) {
    console.error('Failed to fetch POIs:', error);
    // フォールバック用のモックPOIデータ
    return [
      { id: 'pleasant-park', name: 'Pleasant Park', x: 300, y: 200 },
      { id: 'tilted-towers', name: 'Tilted Towers', x: 400, y: 300 },
      { id: 'retail-row', name: 'Retail Row', x: 600, y: 400 },
      { id: 'salty-springs', name: 'Salty Springs', x: 500, y: 500 },
      { id: 'lazy-lake', name: 'Lazy Lake', x: 700, y: 300 },
      { id: 'sweaty-sands', name: 'Sweaty Sands', x: 200, y: 600 },
      { id: 'holly-hedges', name: 'Holly Hedges', x: 250, y: 350 },
      { id: 'craggy-cliffs', name: 'Craggy Cliffs', x: 450, y: 100 },
    ];
  }
}

// マップデータを取得
export async function getMap(): Promise<FortniteMapData> {
  try {
    // 現在のマップ画像のURLを使用（FortniteAPI.ioの公式画像URL）
    const mapImageUrl = 'https://media.fortniteapi.io/images/map.png?showPOI=true';
    
    // POIデータを取得
    const pois = await getPOIs();
    
    return {
      id: 'current-map',
      name: 'Current Fortnite Map',
      imageUrl: mapImageUrl,
      pois: pois.map(poi => ({
        id: poi.id,
        name: poi.name,
        location: { x: poi.x, y: poi.y }
      }))
    };
  } catch (error) {
    console.error('Failed to fetch map data:', error);
    // フォールバック用のモックデータ（実際のマップ画像URLを使用）
    return {
      id: 'fallback',
      name: 'Fortnite Map',
      imageUrl: 'https://media.fortniteapi.io/images/map.png',
      pois: [
        { id: 'pleasant-park', name: 'Pleasant Park', location: { x: 300, y: 200 } },
        { id: 'tilted-towers', name: 'Tilted Towers', location: { x: 400, y: 300 } },
        { id: 'retail-row', name: 'Retail Row', location: { x: 600, y: 400 } },
        { id: 'salty-springs', name: 'Salty Springs', location: { x: 500, y: 500 } },
        { id: 'lazy-lake', name: 'Lazy Lake', location: { x: 700, y: 300 } },
        { id: 'sweaty-sands', name: 'Sweaty Sands', location: { x: 200, y: 600 } },
        { id: 'holly-hedges', name: 'Holly Hedges', location: { x: 250, y: 350 } },
        { id: 'craggy-cliffs', name: 'Craggy Cliffs', location: { x: 450, y: 100 } },
      ]
    };
  }
}

// 武器データを取得
export async function getWeapons(): Promise<FortniteWeapon[]> {
  try {
    const data = await apiRequest('/v1/loot/list?lang=ja');
    return data.weapons?.map((weapon: any) => ({
      id: weapon.id,
      name: weapon.name,
      description: weapon.description || '',
      rarity: weapon.rarity?.toLowerCase() || 'common',
      type: weapon.type || 'Weapon',
      image: weapon.images?.icon || '',
      damage: weapon.mainStats?.damage,
      dps: weapon.mainStats?.dps
    })) || [];
  } catch (error) {
    console.error('Failed to fetch weapons data:', error);
    // フォールバック用のモックデータ
    return [
      {
        id: 'assault-rifle',
        name: 'アサルトライフル',
        description: '汎用性の高い中距離武器',
        rarity: 'common',
        type: 'アサルトライフル',
        image: '/images/weapons/assault-rifle.jpg',
        damage: 30,
        dps: 165
      },
      {
        id: 'shotgun',
        name: 'ポンプショットガン',
        description: '高ダメージ近距離武器',
        rarity: 'uncommon',
        type: 'ショットガン',
        image: '/images/weapons/shotgun.jpg',
        damage: 95,
        dps: 95
      },
      {
        id: 'sniper',
        name: 'ボルトアクションスナイパー',
        description: '長距離精密武器',
        rarity: 'rare',
        type: 'スナイパーライフル',
        image: '/images/weapons/sniper.jpg',
        damage: 116,
        dps: 34
      }
    ];
  }
}

// アイテムデータを取得
export async function getItems(): Promise<FortniteItem[]> {
  try {
    const data = await apiRequest('/v2/items/list?lang=ja');
    return data.items?.filter((item: any) => 
      item.type?.includes('emote') || 
      item.type?.includes('glider') || 
      item.type?.includes('pickaxe')
    ).slice(0, 20).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      rarity: item.rarity?.toLowerCase() || 'common',
      type: item.type || 'Item',
      image: item.images?.icon || ''
    })) || [];
  } catch (error) {
    console.error('Failed to fetch items data:', error);
    // フォールバック用のモックデータ
    return [
      {
        id: 'shield-potion',
        name: 'シールドポーション',
        description: 'シールドを50回復',
        rarity: 'rare',
        type: '消耗品',
        image: '/images/items/shield-potion.jpg'
      },
      {
        id: 'bandages',
        name: 'バンデージ',
        description: 'ヘルスを15回復',
        rarity: 'common',
        type: '回復アイテム',
        image: '/images/items/bandages.jpg'
      },
      {
        id: 'medkit',
        name: 'メドキット',
        description: 'ヘルスを完全回復',
        rarity: 'uncommon',
        type: '回復アイテム',
        image: '/images/items/medkit.jpg'
      }
    ];
  }
}

// レアリティに基づく色を取得
export function getRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'common': return 'text-gray-400';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
    case 'mythic': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

// レアリティに基づく背景色を取得
export function getRarityBgColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'common': return 'bg-gray-500/20 border-gray-500/50';
    case 'uncommon': return 'bg-green-500/20 border-green-500/50';
    case 'rare': return 'bg-blue-500/20 border-blue-500/50';
    case 'epic': return 'bg-purple-500/20 border-purple-500/50';
    case 'legendary': return 'bg-yellow-500/20 border-yellow-500/50';
    case 'mythic': return 'bg-red-500/20 border-red-500/50';
    default: return 'bg-gray-500/20 border-gray-500/50';
  }
} 
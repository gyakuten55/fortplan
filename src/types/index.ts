// ユーザー関連の型定義
export interface User {
  id: string;
  email: string;
  teamName: string;
  representativeName: string;
  password?: string; // Base64エンコード済みパスワード
  isPaid: boolean;
  createdAt: string;
}

// メンバー管理関連の型定義
export interface TeamMember {
  id: string;
  name: string; // 必須
  age?: number;
  position?: string; // ポジション・役割
  discordId?: string;
  memo?: string;
  joinDate?: string;
  isActive: boolean;
  stats?: {
    gamesPlayed?: number;
    averageKills?: number;
    averagePlacement?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 戦略ボード関連の型定義
export interface StrategyBoard {
  id: string;
  name: string;
  mapImageUrl: string;
  elements: BoardElement[];
  createdAt: string;
  updatedAt: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface ElementStyle {
  color?: string;
  borderColor?: string;
  fontSize?: number;
  strokeWidth?: number;
}

export interface PlayerInfo {
  team: 'ally' | 'enemy';
  name?: string;
  health?: number;
  shield?: number;
}

export interface BoardElement {
  id: string;
  type: 'marker' | 'text' | 'route' | 'area' | 'circle' | 'player-ally' | 'player-enemy';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  points?: Point[];
  style?: ElementStyle;
  playerInfo?: PlayerInfo;
}

// 試合レポート関連の型定義
export interface MatchReport {
  id: string;
  date: string;
  gameMode: 'solo' | 'duo' | 'squad' | 'ltm'; // LTM = Limited Time Mode
  placement: number; // 最終順位
  totalPlayers?: number; // 参加者数（通常100人）
  
  // 基本統計
  kills: number;
  assists: number;
  damage: number;
  revives?: number; // チーム戦での蘇生回数
  
  // 生存・時間関連
  survivalTime: string; // "12:34" 形式
  stormDamage?: number; // ストームで受けたダメージ
  
  // 戦略関連
  landingSpot: string; // 降下地点
  strategy: string; // 採用した戦略
  buildingMaterials?: {
    wood: number;
    stone: number;
    metal: number;
  };
  
  // チーム関連（squad/duoの場合）
  teammates?: string[]; // チームメンバーのID
  teamPlacement?: number; // チーム内での貢献度評価
  
  // 振り返り
  reflections: string; // 良かった点
  challenges: string; // 課題・改善点
  lessonsLearned: string; // 学んだこと
  
  // タグ・カテゴリ
  tags?: string[]; // カスタムタグ
  mapVersion?: string; // マップバージョン
  
  createdAt: string;
  updatedAt?: string;
}

// 試合統計サマリー
export interface MatchStats {
  totalMatches: number;
  totalKills: number;
  totalDamage: number;
  averageKills: number;
  averageDamage: number;
  averagePlacement: number;
  averageSurvivalTime: string;
  bestPlacement: number;
  winRate: number; // 勝率（1位の割合）
  top10Rate: number; // トップ10入り率
  top25Rate: number; // トップ25入り率
  kdr: number; // キル/デス比
  lastUpdated: string;
}

// 降下地点統計
export interface LandingSpotStats {
  name: string;
  matches: number;
  averageKills: number;
  averagePlacement: number;
  winRate: number;
  survivalRate: number; // 序盤生存率
}

// 戦略分析
export interface StrategyAnalysis {
  strategy: string;
  frequency: number;
  successRate: number;
  averagePlacement: number;
  bestResult: number;
}

// 降下地点分析関連の型定義
export interface LandingSpot {
  id: string;
  name: string;
  position: { x: number; y: number };
  advantages: string[];
  disadvantages: string[];
  frequency: number;
}

// 決済関連の型定義
export interface PaymentSession {
  sessionId: string;
  status: 'pending' | 'completed' | 'failed';
}

// 運営メッセージ関連の型定義
export interface OperatorMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'update' | 'maintenance' | 'feature';
  priority: 'low' | 'medium' | 'high';
  isRead?: boolean;
  publishedAt: string;
  expiresAt?: string; // 有効期限（オプション）
  targetVersion?: string; // 対象バージョン（オプション）
} 
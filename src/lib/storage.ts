import { 
  User, 
  StrategyBoard, 
  MatchReport, 
  LandingSpot,
  TeamMember,
  OperatorMessage
} from '@/types';

// ローカルストレージのキー定義
const STORAGE_KEYS = {
  USER: 'fortplan_user',
  STRATEGY_BOARDS: 'fortplan_strategy_boards',
  MATCH_REPORTS: 'fortplan_match_reports',
  LANDING_SPOTS: 'fortplan_landing_spots',
  TEAM_MEMBERS: 'fortplan_team_members',
  OPERATOR_MESSAGES: 'fortplan_operator_messages',
  AUTH_TOKEN: 'fortplan_auth_token',
};

// ユーザー管理
export const userStorage = {
  get: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  set: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

// 認証トークン管理
export const authStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};

// 戦略ボード管理
export const strategyBoardStorage = {
  getAll: (): StrategyBoard[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.STRATEGY_BOARDS);
    return data ? JSON.parse(data) : [];
  },

  save: (board: StrategyBoard): { success: boolean; error?: string } => {
    if (typeof window === 'undefined') return { success: false, error: 'Window not available' };
    const boards = strategyBoardStorage.getAll();
    const existingIndex = boards.findIndex(b => b.id === board.id);
    
    // 新規作成の場合、制限をチェック
    if (existingIndex < 0 && boards.length >= 50) {
      return { 
        success: false, 
        error: '戦略ボードは最大50個まで保存できます。不要なボードを削除してから作成してください。' 
      };
    }
    
    if (existingIndex >= 0) {
      boards[existingIndex] = { ...board, updatedAt: new Date().toISOString() };
    } else {
      boards.push(board);
    }
    
    localStorage.setItem(STORAGE_KEYS.STRATEGY_BOARDS, JSON.stringify(boards));
    return { success: true };
  },

  delete: (id: string): void => {
    if (typeof window === 'undefined') return;
    const boards = strategyBoardStorage.getAll();
    const filteredBoards = boards.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.STRATEGY_BOARDS, JSON.stringify(filteredBoards));
  },

  get: (id: string): StrategyBoard | null => {
    const boards = strategyBoardStorage.getAll();
    return boards.find(b => b.id === id) || null;
  },
};

// 試合レポート管理
export const matchReportStorage = {
  getAll: (): MatchReport[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MATCH_REPORTS);
    return data ? JSON.parse(data) : [];
  },

  save: (report: MatchReport): { success: boolean; error?: string } => {
    if (typeof window === 'undefined') return { success: false, error: 'Window not available' };
    const reports = matchReportStorage.getAll();
    const existingIndex = reports.findIndex(r => r.id === report.id);
    
    // 新規作成の場合、制限をチェック
    if (existingIndex < 0 && reports.length >= 100) {
      return { 
        success: false, 
        error: '試合レポートは最大100個まで保存できます。不要なレポートを削除してから作成してください。' 
      };
    }
    
    if (existingIndex >= 0) {
      reports[existingIndex] = report;
    } else {
      reports.push(report);
    }
    
    localStorage.setItem(STORAGE_KEYS.MATCH_REPORTS, JSON.stringify(reports));
    return { success: true };
  },

  delete: (id: string): void => {
    if (typeof window === 'undefined') return;
    const reports = matchReportStorage.getAll();
    const filteredReports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATCH_REPORTS, JSON.stringify(filteredReports));
  },
};

// チームメンバー管理
export const teamMemberStorage = {
  getAll: (): TeamMember[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
    return data ? JSON.parse(data) : [];
  },

  save: (member: TeamMember): { success: boolean; error?: string } => {
    if (typeof window === 'undefined') return { success: false, error: 'Window not available' };
    const members = teamMemberStorage.getAll();
    const existingIndex = members.findIndex(m => m.id === member.id);
    
    // 新規作成の場合、制限をチェック
    if (existingIndex < 0 && members.length >= 50) {
      return { 
        success: false, 
        error: 'チームメンバーは最大50人まで登録できます。不要なメンバーを削除してから登録してください。' 
      };
    }
    
    if (existingIndex >= 0) {
      members[existingIndex] = { ...member, updatedAt: new Date().toISOString() };
    } else {
      members.push(member);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
    return { success: true };
  },

  delete: (id: string): void => {
    if (typeof window === 'undefined') return;
    const members = teamMemberStorage.getAll();
    const filteredMembers = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(filteredMembers));
  },

  get: (id: string): TeamMember | null => {
    const members = teamMemberStorage.getAll();
    return members.find(m => m.id === id) || null;
  },

  // アクティブメンバーのみ取得
  getActive: (): TeamMember[] => {
    return teamMemberStorage.getAll().filter(m => m.isActive);
  },

  // 統計情報の更新
  updateStats: (id: string, stats: TeamMember['stats']): void => {
    const member = teamMemberStorage.get(id);
    if (member) {
      const result = teamMemberStorage.save({
        ...member,
        stats: { ...member.stats, ...stats }
      });
      // 統計更新は既存レコードの更新なので、エラーハンドリングは不要
    }
  },
};

// 運営メッセージ管理
export const operatorMessageStorage = {
  getAll: (): OperatorMessage[] => {
    if (typeof window === 'undefined') return [];
    
    // 常に最新のメッセージで上書き
    const defaultMessages: OperatorMessage[] = [
      {
        id: 'msg-1',
        title: 'FortPlanβ版リリース！',
        content: 'FortPlanのβ版がリリースされました！戦略ボード、試合レポート、メンバー管理など、チーム戦略に必要な機能をご利用いただけます。フィードバックをお待ちしております。',
        type: 'info',
        priority: 'high',
        publishedAt: new Date().toISOString(),
        targetVersion: '0.9.0'
      }
    ];
    
    localStorage.setItem(STORAGE_KEYS.OPERATOR_MESSAGES, JSON.stringify(defaultMessages));
    return defaultMessages;
  },

  markAsRead: (id: string): void => {
    if (typeof window === 'undefined') return;
    const messages = operatorMessageStorage.getAll();
    const messageIndex = messages.findIndex(m => m.id === id);
    
    if (messageIndex >= 0) {
      messages[messageIndex] = { ...messages[messageIndex], isRead: true };
      localStorage.setItem(STORAGE_KEYS.OPERATOR_MESSAGES, JSON.stringify(messages));
    }
  },

  getUnreadCount: (): number => {
    const messages = operatorMessageStorage.getAll();
    return messages.filter(m => !m.isRead).length;
  },

  getByPriority: (priority: 'low' | 'medium' | 'high'): OperatorMessage[] => {
    const messages = operatorMessageStorage.getAll();
    return messages.filter(m => m.priority === priority).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  },

  getRecent: (limit: number = 5): OperatorMessage[] => {
    const messages = operatorMessageStorage.getAll();
    return messages
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
};

// データをすべてクリア（デバッグ用）
export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}; 
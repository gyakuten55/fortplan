'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Download,
  Map,
  Calendar,
  Clock
} from 'lucide-react';
import { userStorage, authStorage, strategyBoardStorage } from '@/lib/storage';
import { StrategyBoard } from '@/types';

export default function StrategyBoardPage() {
  const [boards, setBoards] = useState<StrategyBoard[]>([]);
  const [filteredBoards, setFilteredBoards] = useState<StrategyBoard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 認証チェック
    const user = userStorage.get();
    const token = authStorage.get();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    loadBoards();
  }, [router]);

  useEffect(() => {
    filterBoards();
  }, [boards, searchTerm]);

  const loadBoards = () => {
    setIsLoading(true);
    try {
      const savedBoards = strategyBoardStorage.getAll();
      setBoards(savedBoards);
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBoards = () => {
    let filtered = boards;

    if (searchTerm) {
      filtered = boards.filter(board => 
        board.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 更新日時順でソート
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    setFilteredBoards(filtered);
  };

  const handleDeleteBoard = (boardId: string) => {
    const boardToDelete = boards.find(b => b.id === boardId);
    const boardName = boardToDelete?.name || '選択されたボード';
    
    if (confirm(`「${boardName}」を削除しますか？\n\nこの操作は取り消せません。`)) {
      try {
        strategyBoardStorage.delete(boardId);
        setSelectedBoard(null);
        loadBoards();
        
        // 成功メッセージを表示（簡易的な方法）
        alert(`「${boardName}」を削除しました。`);
      } catch (error) {
        console.error('Failed to delete board:', error);
        alert('戦略ボードの削除に失敗しました。');
      }
    }
  };

  const handleDuplicateBoard = (board: StrategyBoard) => {
    try {
      const duplicatedBoard: StrategyBoard = {
        ...board,
        id: `board-${Date.now()}`,
        name: `${board.name} (コピー)`,
        notes: board.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = strategyBoardStorage.save(duplicatedBoard);
      
      if (!result.success) {
        alert(result.error || '戦略ボードの複製に失敗しました。');
        return;
      }
      
      setSelectedBoard(null);
      loadBoards();
      
      // 成功メッセージを表示（簡易的な方法）
      alert(`「${duplicatedBoard.name}」を作成しました。`);
    } catch (error) {
      console.error('Failed to duplicate board:', error);
      alert('戦略ボードの複製に失敗しました。');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const BoardCard = ({ board }: { board: StrategyBoard }) => (
    <div className="glass-card p-6 rounded-lg hover:transform hover:scale-105 transition-all duration-300 group relative">
      {/* ドロップダウンメニュー */}
      <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('メニューボタンがクリックされました:', board.name, 'current:', selectedBoard);
            setSelectedBoard(selectedBoard === board.id ? null : board.id);
          }}
          className="text-gray-400 hover:text-white transition-colors p-1 relative z-10"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {selectedBoard === board.id && (
          <>
            {/* オーバーレイ */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setSelectedBoard(null)}
            />
            {/* ドロップダウンメニュー */}
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 min-w-48">
              <Link
                href={`/strategy-board/${board.id}`}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition-colors text-white"
                onClick={() => setSelectedBoard(null)}
              >
                <Edit className="w-4 h-4" />
                <span>編集</span>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('複製ボタンがクリックされました:', board.name);
                  handleDuplicateBoard(board);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition-colors text-white text-left"
              >
                <Copy className="w-4 h-4" />
                <span>複製</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('削除ボタンがクリックされました:', board.name);
                  handleDeleteBoard(board.id);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-600 transition-colors text-red-400 text-left"
              >
                <Trash2 className="w-4 h-4" />
                <span>削除</span>
              </button>
            </div>
          </>
        )}
      </div>

      <Link href={`/strategy-board/${board.id}`} className="block" onClick={() => setSelectedBoard(null)}>
        {/* マッププレビュー */}
        <div className="mb-4 h-32 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center border border-white/10">
          <Map className="w-8 h-8 text-blue-400" />
        </div>

        {/* ボード情報 */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
          {board.name}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>作成: {formatDate(board.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>更新: {formatDate(board.updatedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Map className="w-4 h-4" />
            <span>{board.elements.length} 要素</span>
          </div>
        </div>
      </Link>
    </div>
  );

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
                <Map className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">戦略ボード</h1>
              </div>
            </div>
            
            <Link 
              href="/strategy-board/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>新規作成</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 検索・フィルター */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="戦略ボード名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          
          <div className="mt-4 text-gray-300 text-sm">
            {filteredBoards.length} 件の戦略ボードが見つかりました
          </div>
        </div>

        {/* ボード一覧 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">戦略ボードを読み込んでいます...</p>
          </div>
        ) : filteredBoards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? '該当する戦略ボードが見つかりません' : '戦略ボードがありません'}
            </h3>
            <p className="text-gray-300 mb-6">
              {searchTerm 
                ? '検索条件を変更してみてください' 
                : '新しい戦略ボードを作成して、チームの戦略を立案しましょう'
              }
            </p>
            {!searchTerm && (
              <Link 
                href="/strategy-board/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>最初の戦略ボードを作成</span>
              </Link>
            )}
          </div>
        )}

        {/* クイックスタートガイド */}
        {boards.length === 0 && !isLoading && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">1. ボードを作成</h4>
              <p className="text-gray-300 text-sm">
                新しい戦略ボードを作成し、チームの作戦に名前を付けましょう
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Map className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">2. 戦略を配置</h4>
              <p className="text-gray-300 text-sm">
                マップ上にマーカーやルートを配置して、戦略を視覚化しましょう
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">3. 共有・保存</h4>
              <p className="text-gray-300 text-sm">
                完成した戦略をPDFやPNGでエクスポートして、チームと共有しましょう
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
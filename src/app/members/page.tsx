'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Users,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  Clock,
  Target,
  MoreVertical,
  UserCheck,
  UserX
} from 'lucide-react';
import { userStorage, authStorage, teamMemberStorage } from '@/lib/storage';
import { TeamMember } from '@/types';

export default function MembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 認証チェック
    const user = userStorage.get();
    const token = authStorage.get();
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    loadMembers();
  }, [router]);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, filterStatus]);

  const loadMembers = () => {
    setIsLoading(true);
    try {
      const savedMembers = teamMemberStorage.getAll();
      setMembers(savedMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    // ステータスフィルター
    if (filterStatus === 'active') {
      filtered = filtered.filter(member => member.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(member => !member.isActive);
    }

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.discordId && member.discordId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 作成日時順でソート
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredMembers(filtered);
  };

  const handleDeleteMember = (memberId: string) => {
    const memberToDelete = members.find(m => m.id === memberId);
    const memberName = memberToDelete?.name || '選択されたメンバー';
    
    if (confirm(`「${memberName}」をメンバーリストから削除しますか？\n\nこの操作は取り消せません。`)) {
      try {
        teamMemberStorage.delete(memberId);
        setSelectedMember(null);
        loadMembers();
        alert(`「${memberName}」を削除しました。`);
      } catch (error) {
        console.error('Failed to delete member:', error);
        alert('メンバーの削除に失敗しました。');
      }
    }
  };

  const toggleMemberStatus = (member: TeamMember) => {
    try {
      const updatedMember = {
        ...member,
        isActive: !member.isActive
      };
      teamMemberStorage.save(updatedMember);
      setSelectedMember(null);
      loadMembers();
      
      const status = updatedMember.isActive ? 'アクティブ' : '非アクティブ';
      alert(`「${member.name}」を${status}に変更しました。`);
    } catch (error) {
      console.error('Failed to update member status:', error);
      alert('メンバーステータスの変更に失敗しました。');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div className={`glass-card p-6 rounded-lg hover:transform hover:scale-105 transition-all duration-300 group relative ${
      !member.isActive ? 'opacity-60' : ''
    }`}>
      {/* ドロップダウンメニュー */}
      <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedMember(selectedMember === member.id ? null : member.id);
          }}
          className="text-gray-400 hover:text-white transition-colors p-1 relative z-10"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {selectedMember === member.id && (
          <>
            {/* オーバーレイ */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setSelectedMember(null)}
            />
            {/* ドロップダウンメニュー */}
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 min-w-48">
              <Link
                href={`/members/${member.id}`}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition-colors text-white"
                onClick={() => setSelectedMember(null)}
              >
                <Edit className="w-4 h-4" />
                <span>編集</span>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMemberStatus(member);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 transition-colors text-white text-left"
              >
                {member.isActive ? (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>非アクティブにする</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>アクティブにする</span>
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteMember(member.id);
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

      <Link href={`/members/${member.id}`} className="block" onClick={() => setSelectedMember(null)}>
        {/* メンバー基本情報 */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${member.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
              {member.name}
            </h3>
            {member.age && (
              <span className="text-sm text-gray-400">({member.age}歳)</span>
            )}
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="space-y-2 text-sm text-gray-400">
          {member.discordId && (
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">💬</span>
              <span>{member.discordId}</span>
            </div>
          )}
          
          {member.joinDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>参加: {formatDate(member.joinDate)}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>登録: {formatDate(member.createdAt)}</span>
          </div>

          {/* 統計情報 */}
          {member.stats && (
            <div className="pt-2 border-t border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-xs">
                {member.stats.gamesPlayed && (
                  <div className="text-center">
                    <div className="text-blue-400 font-semibold">{member.stats.gamesPlayed}</div>
                    <div>試合数</div>
                  </div>
                )}
                {member.stats.averageKills && (
                  <div className="text-center">
                    <div className="text-red-400 font-semibold">{member.stats.averageKills.toFixed(1)}</div>
                    <div>平均キル</div>
                  </div>
                )}
                {member.stats.averagePlacement && (
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold">#{member.stats.averagePlacement.toFixed(0)}</div>
                    <div>平均順位</div>
                  </div>
                )}
              </div>
            </div>
          )}
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
                <Users className="w-6 h-6 text-blue-400" />
                <h1 className="text-xl font-bold text-white">チームメンバー</h1>
              </div>
            </div>
            
            <Link 
              href="/members/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>メンバー追加</span>
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
                placeholder="名前、Discord IDで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            
            <div className="flex space-x-2">
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {status === 'all' && '全て'}
                  {status === 'active' && 'アクティブ'}
                  {status === 'inactive' && '非アクティブ'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-gray-300 text-sm">
            {filteredMembers.length} 件のメンバーが見つかりました
          </div>
        </div>

        {/* メンバー一覧 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">メンバーを読み込んでいます...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterStatus !== 'all' ? '該当するメンバーが見つかりません' : 'メンバーがいません'}
            </h3>
            <p className="text-gray-300 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? '検索条件やフィルターを変更してみてください' 
                : '最初のチームメンバーを追加しましょう'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link 
                href="/members/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>最初のメンバーを追加</span>
              </Link>
            )}
          </div>
        )}

        {/* クイックスタートガイド */}
        {members.length === 0 && !isLoading && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">1. メンバーを追加</h4>
              <p className="text-gray-300 text-sm">
                チームメンバーの基本情報を登録しましょう
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">2. 詳細を管理</h4>
              <p className="text-gray-300 text-sm">
                ポジションやメモ、統計情報を記録しましょう
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">3. 戦略に活用</h4>
              <p className="text-gray-300 text-sm">
                戦略ボードでメンバーの役割を明確にしましょう
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Trash2,
  Eye,
  Folder,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  Building,
  TrendingUp,
} from 'lucide-react';
import { useBriefStore } from '@/store/briefStore';
import { useBrandStore } from '@/store/brandStore';
import { useDataStore } from '@/store/dataStore';
import type { ArchivedBrief, PeakCategory, BriefCard, CardStatus } from '@/types';
import { formatDateCN } from '@/utils/helpers';

const statusLabels: Record<CardStatus, string> = {
  pending: '待处理',
  'in-progress': '处理中',
  monitoring: '观察中',
  resolved: '已解决',
};

const statusColors: Record<CardStatus, string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  'in-progress': 'bg-blue-50 text-blue-600 border-blue-200',
  monitoring: 'bg-amber-50 text-amber-600 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const categoryConfig: { key: PeakCategory; label: string; icon: typeof Building; color: string; bgColor: string }[] = [
  { key: 'brand', label: '品牌动态', icon: Building, color: 'text-champagne-600', bgColor: 'bg-champagne-50' },
  { key: 'competitor', label: '竞品动态', icon: TrendingUp, color: 'text-navy-600', bgColor: 'bg-navy-50' },
  { key: 'risk', label: '风险预警', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
  { key: 'opportunity', label: '机会点', icon: Sparkles, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

export default function Archive() {
  const navigate = useNavigate();
  const { id: viewId } = useParams();
  const { brandGroups, selectedGroupId, setSelectedGroup } = useBrandStore();
  const { getArchivedBriefs, getArchivedBriefById, deleteArchivedBrief } = useBriefStore();
  const { getPeakById } = useDataStore();

  const [filterGroupId, setFilterGroupId] = useState<string>('all');
  const [viewingBrief, setViewingBrief] = useState<ArchivedBrief | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const allBriefs = getArchivedBriefs();
  const filteredBriefs = filterGroupId === 'all'
    ? allBriefs
    : allBriefs.filter(b => b.groupId === filterGroupId);

  useEffect(() => {
    if (viewId) {
      const brief = getArchivedBriefById(viewId);
      if (brief) {
        setViewingBrief(brief);
      }
    }
  }, [viewId, getArchivedBriefById]);

  const handleBack = () => {
    if (viewingBrief) {
      setViewingBrief(null);
      navigate('/archive');
    } else {
      navigate('/dashboard');
    }
  };

  const handleViewBrief = (brief: ArchivedBrief) => {
    setViewingBrief(brief);
    navigate(`/archive/${brief.id}`);
  };

  const handleDelete = (id: string) => {
    deleteArchivedBrief(id);
    setConfirmDelete(null);
  };

  const handleGroupChange = (groupId: string) => {
    setFilterGroupId(groupId);
  };

  const formatArchiveDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getBriefCategoryCounts = (brief: ArchivedBrief) => {
    const counts: Record<PeakCategory, number> = {
      brand: 0,
      competitor: 0,
      risk: 0,
      opportunity: 0,
    };
    brief.cards.forEach(c => {
      counts[c.category]++;
    });
    return counts;
  };

  if (viewingBrief) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-navy-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">返回归档列表</span>
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="font-serif text-lg font-semibold text-navy-800">
              历史简报详情
            </h1>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {viewingBrief.groupName}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {viewingBrief.date}
            </span>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-[1600px] mx-auto bg-white shadow-lg">
            <div className="p-8">
              <div className="flex items-start justify-between border-b-2 border-navy-800 pb-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1 tracking-widest">
                    ARCHIVED BRIEFING
                  </p>
                  <h2 className="font-serif text-2xl font-bold text-navy-800">
                    {viewingBrief.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      简报日期：{viewingBrief.date}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      归档时间：{formatArchiveDate(viewingBrief.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-gray-300 font-serif text-xl font-bold tracking-wider">
                      归档
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    共 <span className="font-semibold text-navy-700">{viewingBrief.cards.length}</span> 条内容
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-5">
                {categoryConfig.map((cat) => {
                  const cards = viewingBrief.cards.filter(c => c.category === cat.key);
                  const Icon = cat.icon;

                  return (
                    <div key={cat.key} className="flex flex-col">
                      <div className={`flex items-center gap-2 pb-2 border-b-2 ${cat.color} mb-3`}>
                        <div className={`p-1.5 rounded ${cat.bgColor}`}>
                          <Icon className={`w-4 h-4 ${cat.color}`} />
                        </div>
                        <h3 className={`font-serif text-base font-bold ${cat.color}`}>
                          {cat.label}
                        </h3>
                        <span className="text-xs text-gray-400 ml-auto font-medium">
                          {cards.length} 条
                        </span>
                      </div>

                      <div className="flex-1 space-y-3">
                        {cards.length > 0 ? (
                          cards.map((card: BriefCard) => {
                            const event = getPeakById(card.peakEventId);
                            if (!event) return null;

                            return (
                              <div
                                key={card.id}
                                className={`p-3 rounded-lg border ${
                                  card.status === 'resolved'
                                    ? 'border-emerald-200 bg-emerald-50/40'
                                    : 'border-gray-200 bg-white shadow-sm'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {card.status && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColors[card.status]}`}>
                                      {statusLabels[card.status]}
                                    </span>
                                  )}
                                  {card.assignee && (
                                    <span className="text-[10px] text-gray-500">
                                      负责人：{card.assignee}
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm font-semibold text-navy-800 mb-2 leading-snug">
                                  {event.title}
                                </h4>

                                {card.judgement && (
                                  <div className="mb-2 p-2 bg-champagne-50 rounded text-[11px] text-gray-700 leading-relaxed border-l-2 border-champagne-400">
                                    <span className="font-medium text-champagne-700">判断：</span>
                                    {card.judgement}
                                  </div>
                                )}

                                {(card.actionItem || event.suggestedAction) && (
                                  <div className="p-2 bg-amber-50 rounded text-[11px] text-gray-700 leading-relaxed border-l-2 border-amber-400">
                                    <span className="font-medium text-amber-700">建议动作：</span>
                                    {card.actionItem || event.suggestedAction}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex-1 flex items-center justify-center py-12 text-gray-300 border-2 border-dashed border-gray-200 rounded-lg">
                            <div className="text-center">
                              <Icon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <span className="text-sm">暂无内容</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-4">
                  <span>数据来源：全网舆情监测系统</span>
                  <span className="text-gray-200">|</span>
                  <span>已归档，只读查看</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>归档时间：{formatArchiveDate(viewingBrief.createdAt)}</span>
                  <span className="text-gray-200">|</span>
                  <span>© 2026 公关晨会简报系统</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-navy-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回工作台</span>
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="font-serif text-lg font-semibold text-navy-800 flex items-center gap-2">
            <Folder className="w-5 h-5 text-champagne-500" />
            历史简报归档
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-2">按品牌组筛选：</span>
          <button
            onClick={() => handleGroupChange('all')}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              filterGroupId === 'all'
                ? 'bg-navy-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {brandGroups.map(group => (
            <button
              key={group.id}
              onClick={() => handleGroupChange(group.id)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                filterGroupId === group.id
                  ? 'bg-navy-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-[1400px] mx-auto">
          {filteredBriefs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-serif font-semibold text-navy-800 mb-2">
                暂无归档简报
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                在工作台编辑完简报后，可以归档保存以便后续查阅
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-sm"
              >
                前往工作台
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBriefs.map((brief) => {
                const counts = getBriefCategoryCounts(brief);
                return (
                  <div
                    key={brief.id}
                    className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-champagne-500" />
                        <h3 className="font-serif font-semibold text-navy-800 line-clamp-2">
                          {brief.title}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{brief.groupName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>简报日期：{brief.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>归档时间：{formatArchiveDate(brief.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {categoryConfig.map((cat) => (
                        counts[cat.key] > 0 && (
                          <span
                            key={cat.key}
                            className={`text-[10px] px-2 py-0.5 rounded ${cat.bgColor} ${cat.color}`}
                          >
                            {cat.label} {counts[cat.key]}
                          </span>
                        )
                      ))}
                      <span className="text-[10px] text-gray-400 ml-auto">
                        共 {brief.cards.length} 条
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleViewBrief(brief)}
                        className="flex-1 px-3 py-1.5 text-xs bg-navy-50 text-navy-700 rounded hover:bg-navy-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看详情
                      </button>
                      {confirmDelete === brief.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(brief.id)}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          >
                            确认删除
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(brief.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

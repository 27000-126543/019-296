import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Maximize2,
  Building2,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  User,
  Calendar,
  Flag,
  Lightbulb,
  Clock,
  Monitor,
  FileText,
  Mic2,
  Clock3,
  UserCheck,
  MessageCircle,
  FileCheck,
} from 'lucide-react';
import { useBrandStore } from '@/store/brandStore';
import { useDataStore } from '@/store/dataStore';
import { useBriefStore } from '@/store/briefStore';
import type { PeakCategory, BriefCard, CardStatus, ExportViewMode, ActivityLog } from '@/types';
import { formatDateCN, formatNumber, getYesterdayDate } from '@/utils/helpers';

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

const activityTypeIcons: Record<ActivityLog['type'], typeof Clock> = {
  progress: Clock3,
  result: FileCheck,
  note: MessageCircle,
};

const activityTypeLabels: Record<ActivityLog['type'], string> = {
  progress: '进展',
  result: '结果',
  note: '备注',
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function ExportPreview() {
  const navigate = useNavigate();
  const { selectedGroupId, getCurrentGroup, getSelfBrand, getAllBrands } = useBrandStore();
  const { getSentimentByBrand, getPeakById } = useDataStore();
  const { setActiveGroup, getCardsByCategory, exportViewMode, setExportViewMode } = useBriefStore();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentGroup = getCurrentGroup();
  const selfBrand = getSelfBrand();
  const brands = getAllBrands();
  const yesterday = getYesterdayDate();

  const viewMode: ExportViewMode = exportViewMode || 'screen';
  const isPrintMode = viewMode === 'print';

  useEffect(() => {
    if (!selectedGroupId) {
      navigate('/');
      return;
    }
    setActiveGroup(selectedGroupId);
  }, [selectedGroupId, navigate, setActiveGroup]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const selfSentiment = selfBrand ? getSentimentByBrand(selfBrand.id) : null;

  const categoryConfig: { key: PeakCategory; label: string; icon: typeof Building2; color: string; bgColor: string }[] = [
    { key: 'brand', label: '品牌动态', icon: Building2, color: 'text-champagne-600', bgColor: 'bg-champagne-50' },
    { key: 'competitor', label: '竞品动态', icon: TrendingUp, color: 'text-navy-600', bgColor: 'bg-navy-50' },
    { key: 'risk', label: '风险预警', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { key: 'opportunity', label: '机会点', icon: Sparkles, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  ];

  const rankedBrands = brands
    .map((brand) => {
      const sentiment = getSentimentByBrand(brand.id);
      return {
        brand,
        total: sentiment?.totalMentions || 0,
        positive: sentiment?.positive || 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  if (!currentGroup || !selfBrand) return null;

  const getCardData = (card: BriefCard) => {
    const event = getPeakById(card.peakEventId);
    const brand = brands.find((b) => b.id === event?.brandId);
    return { event, brand };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-navy-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回编辑</span>
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="font-serif text-lg font-semibold text-navy-800">
            简报预览
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setExportViewMode('screen')}
              className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${
                !isPrintMode ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              投屏视图
            </button>
            <button
              onClick={() => setExportViewMode('print')}
              className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${
                isPrintMode ? 'bg-white text-navy-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              打印视图
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            全屏
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Printer className="w-4 h-4" />
            打印 / 导出PDF
          </button>
        </div>
      </header>

      <main className="p-6 print:p-0">
        <div className="max-w-[1600px] mx-auto bg-white shadow-lg print:shadow-none">
          <div className="p-8 print:p-6">
            <div className="flex items-start justify-between border-b-2 border-navy-800 pb-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1 tracking-widest">
                  BRAND VOICE MORNING BRIEFING
                </p>
                <h2 className="font-serif text-2xl font-bold text-navy-800">
                  {currentGroup.name} — 晨会声量简报
                </h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDateCN(yesterday)}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    晨会 09:00
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 bg-gradient-to-br from-navy-700 to-navy-900 rounded-lg flex items-center justify-center">
                  <span className="text-champagne-400 font-serif text-xl font-bold tracking-wider">
                    简报
                  </span>
                </div>
                {selfSentiment && (
                  <div className="mt-2 text-xs text-gray-500">
                    总声量 <span className="font-semibold text-navy-700">{formatNumber(selfSentiment.totalMentions)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`mb-6 ${!isPrintMode ? '' : 'print-only-block'}`}>
              <h3 className="font-serif text-base font-semibold text-navy-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-champagne-500 rounded-full" />
                一、声量总览
              </h3>
              <div className="grid grid-cols-6 gap-3">
                {rankedBrands.slice(0, 6).map((item, index) => {
                  const maxTotal = rankedBrands[0].total;
                  const percentage = (item.total / maxTotal) * 100;
                  const isSelf = item.brand.id === selfBrand.id;

                  return (
                    <div
                      key={item.brand.id}
                      className={`p-3 rounded-lg border ${
                        isSelf
                          ? 'border-champagne-300 bg-champagne-50/70'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0
                          ${index === 0 ? 'bg-champagne-400 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-amber-500 text-white' :
                            'bg-gray-300 text-white'}`}>
                          {index + 1}
                        </span>
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.brand.color }}
                        />
                        <span className={`text-xs font-medium truncate ${
                          isSelf ? 'text-champagne-700' : 'text-navy-700'
                        }`}>
                          {item.brand.name}
                        </span>
                        {isSelf && (
                          <span className="text-[9px] bg-champagne-200 text-champagne-700 px-1 rounded flex-shrink-0">
                            自家
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-serif font-bold text-navy-800 mb-1">
                        {formatNumber(item.total)}
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isSelf ? 'bg-champagne-500' : 'bg-navy-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] text-gray-500 flex justify-between">
                        <span>正面 {Math.round((item.positive / item.total) * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-5">
              {categoryConfig.map((cat) => {
                const cards = getCardsByCategory(cat.key);
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
                        cards.map((card) => {
                          const { event, brand } = getCardData(card);
                          if (!event) return null;

                          const activities = card.activities || [];
                          const lastActivity = activities[activities.length - 1];

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
                                {brand && (
                                  <>
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: brand.color }}
                                    />
                                    <span className="text-[11px] text-gray-600 font-medium">
                                      {brand.name}
                                    </span>
                                  </>
                                )}
                                {card.status && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColors[card.status]}`}>
                                    {statusLabels[card.status]}
                                  </span>
                                )}
                                {isPrintMode && lastActivity && (
                                  <span className="text-[10px] text-gray-500 ml-auto flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    {lastActivity.author} · {formatTime(lastActivity.timestamp)}
                                  </span>
                                )}
                                {!isPrintMode && (
                                  <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-navy-300" />
                                    {formatNumber(event.mentionCount)}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-semibold text-navy-800 mb-2 leading-snug">
                                {event.title}
                              </h4>

                              {event.summary && (
                                <div className="mb-2 p-2 bg-gray-50 rounded text-[11px] text-gray-600 leading-relaxed border-l-2 border-gray-300">
                                  <span className="font-medium text-gray-700">背景：</span>
                                  {event.summary}
                                </div>
                              )}

                              {card.judgement && (
                                <div className="mb-2 p-2 bg-champagne-50 rounded text-[11px] text-gray-700 leading-relaxed border-l-2 border-champagne-400">
                                  <span className="font-medium text-champagne-700">判断：</span>
                                  {card.judgement}
                                </div>
                              )}

                              {(card.actionItem || event.suggestedAction) && (
                                <div className="mb-2 p-2 bg-amber-50 rounded text-[11px] text-gray-700 leading-relaxed border-l-2 border-amber-400">
                                  <span className="font-medium text-amber-700 flex items-center gap-1">
                                    <Lightbulb className="w-3 h-3" />
                                    建议动作：
                                  </span>
                                  {card.actionItem || event.suggestedAction}
                                </div>
                              )}

                              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-[10px] text-gray-500 flex-wrap">
                                {card.assignee && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {card.assignee}
                                  </span>
                                )}
                                {card.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {card.dueDate}
                                  </span>
                                )}
                                {!isPrintMode && !card.assignee && !card.dueDate && (
                                  <span className="text-gray-300">待指定负责人</span>
                                )}
                              </div>

                              {isPrintMode && (
                                <>
                                  {card.hostNotes && (
                                    <div className="mt-2 p-2 bg-champagne-50/80 rounded text-[11px] text-champagne-900 leading-relaxed border border-champagne-200">
                                      <span className="font-medium flex items-center gap-1 mb-1">
                                        <Mic2 className="w-3 h-3" />
                                        主持人跟进备注：
                                      </span>
                                      {card.hostNotes}
                                    </div>
                                  )}

                                  {activities.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <p className="text-[10px] font-medium text-gray-600 mb-1.5 flex items-center gap-1">
                                        <Clock3 className="w-3 h-3" />
                                        处理记录
                                      </p>
                                      <div className="space-y-1.5">
                                        {activities.slice().reverse().map((activity) => {
                                          const ActIcon = activityTypeIcons[activity.type];
                                          return (
                                            <div key={activity.id} className="flex items-start gap-1.5 text-[10px]">
                                              <ActIcon className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <span className="font-medium text-gray-700">
                                                  {activity.author}
                                                </span>
                                                <span className="text-gray-400 mx-1">
                                                  {activityTypeLabels[activity.type]} · {formatTime(activity.timestamp)}
                                                </span>
                                                <p className="text-gray-600 break-words">
                                                  {activity.content}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </>
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
                <span>更新时间：今日 08:00</span>
              </div>
              <div className="flex items-center gap-4">
                <span>生成时间：{new Date().toLocaleString('zh-CN')}</span>
                <span className="text-gray-200">|</span>
                <span>© 2026 公关晨会简报系统</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print-only-block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

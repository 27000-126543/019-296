import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Filter,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
  User,
  Flag,
  Building2,
  Target,
} from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { useBrandStore } from '@/store/brandStore';
import { useBriefStore } from '@/store/briefStore';
import PeakEventCard from '@/components/PeakEventCard';
import type { PeakLevel, PeakCategory, PeakEvent, CardStatus, BrandFilterType } from '@/types';
import { CARD_STATUS_LABELS } from '@/types';

export default function PeakEventList() {
  const { getPeaksByGroup, getRecommendedPeaks } = useDataStore();
  const { selectedGroupId, getAllBrands, getSelfBrand } = useBrandStore();
  const { getCards } = useBriefStore();
  const [levelFilter, setLevelFilter] = useState<PeakLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<PeakCategory | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<BrandFilterType>('all');
  const [statusFilter, setStatusFilter] = useState<CardStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showRecommended, setShowRecommended] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const brands = getAllBrands();
  const selfBrand = getSelfBrand();
  const peakEvents = selectedGroupId ? getPeaksByGroup(selectedGroupId) : [];
  const recommendedPeaks = selectedGroupId ? getRecommendedPeaks(selectedGroupId) : [];
  const briefCards = getCards();

  const peakCardMap = useMemo(() => {
    const map: Record<string, typeof briefCards[number]> = {};
    briefCards.forEach((c) => {
      map[c.peakEventId] = c;
    });
    return map;
  }, [briefCards]);

  const assignees = useMemo(() => {
    const set = new Set<string>();
    briefCards.forEach((c) => {
      if (c.assignee) set.add(c.assignee);
    });
    return Array.from(set);
  }, [briefCards]);

  const filteredEvents = peakEvents
    .filter((event) => {
      const hasBrand = brands.some((b) => b.id === event.brandId);
      if (!hasBrand) return false;
      if (levelFilter !== 'all' && event.level !== levelFilter) return false;
      if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;

      if (brandFilter !== 'all') {
        const brand = brands.find((b) => b.id === event.brandId);
        if (brandFilter === 'self' && !brand?.isSelf) return false;
        if (brandFilter === 'competitor' && brand?.isSelf) return false;
      }

      if (statusFilter !== 'all') {
        const card = peakCardMap[event.id];
        if (!card) return false;
        if (card.status !== statusFilter) return false;
      }

      if (assigneeFilter !== 'all') {
        const card = peakCardMap[event.id];
        if (!card) return false;
        if (card.assignee !== assigneeFilter) return false;
      }

      return true;
    })
    .sort((a, b) => (b.recommendScore?.total || 0) - (a.recommendScore?.total || 0));

  const levelOptions: { value: PeakLevel | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'high', label: '高风险' },
    { value: 'medium', label: '中风险' },
    { value: 'low', label: '低风险' },
  ];

  const categoryOptions: { value: PeakCategory | 'all'; label: string }[] = [
    { value: 'all', label: '全部分类' },
    { value: 'brand', label: '品牌' },
    { value: 'competitor', label: '竞品' },
    { value: 'risk', label: '风险' },
    { value: 'opportunity', label: '机会' },
  ];

  const brandFilterOptions: { value: BrandFilterType; label: string; icon: typeof Building2 }[] = [
    { value: 'all', label: '全部', icon: Building2 },
    { value: 'self', label: '自家', icon: Target },
    { value: 'competitor', label: '竞品', icon: Building2 },
  ];

  const statusFilterOptions: { value: CardStatus | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'in-progress', label: '处理中' },
    { value: 'monitoring', label: '观察中' },
    { value: 'resolved', label: '已解决' },
  ];

  const getRecommendIcon = (event: PeakEvent) => {
    if (event.category === 'risk' || event.level === 'high') {
      return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
    }
    if (event.category === 'competitor') {
      return <Zap className="w-3.5 h-3.5 text-orange-500" />;
    }
    if (event.dayOverDayChange && event.dayOverDayChange > 50) {
      return <TrendingUp className="w-3.5 h-3.5 text-amber-500" />;
    }
    return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
  };

  const hasActiveFilters =
    statusFilter !== 'all' || assigneeFilter !== 'all' || brandFilter !== 'all';

  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) +
    (assigneeFilter !== 'all' ? 1 : 0) +
    (brandFilter !== 'all' ? 1 : 0);

  return (
    <div className="card-base p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-champagne-500" />
          <h3 className="section-title">异常峰值</h3>
          <span className="text-xs bg-champagne-100 text-champagne-600 px-2 py-0.5 rounded-full">
            {filteredEvents.length} 条
          </span>
        </div>
      </div>

      {showRecommended && recommendedPeaks.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">晨会重点推荐</span>
            </div>
            <button
              onClick={() => setShowRecommended(false)}
              className="text-[10px] text-amber-500 hover:text-amber-700"
            >
              收起
            </button>
          </div>
          <div className="space-y-2">
            {recommendedPeaks.slice(0, 5).map((event) => (
              <div
                key={`rec-${event.id}`}
                className="flex items-start gap-2 p-2 bg-white/70 rounded text-xs"
              >
                <div className="mt-0.5">{getRecommendIcon(event)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800 truncate">{event.title}</p>
                    {event.recommendScore && (
                      <span className="text-[10px] text-amber-600 font-medium flex-shrink-0">
                        {event.recommendScore.total}分
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap gap-1">
                    {(event.recommendScore?.reasons || []).slice(0, 2).map((reason, idx) => (
                      <span key={idx} className="bg-white px-1 rounded border border-gray-200 text-gray-600">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showRecommended && recommendedPeaks.length > 0 && (
        <button
          onClick={() => setShowRecommended(true)}
          className="mb-3 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>展开晨会重点推荐 ({recommendedPeaks.length}条)</span>
        </button>
      )}

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Filter className="w-3.5 h-3.5" />
          <span>筛选：</span>
        </div>

        <div className="flex gap-1 flex-wrap">
          {levelOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLevelFilter(opt.value)}
              className={`px-2.5 py-1 text-xs rounded transition-colors
                ${levelFilter === opt.value
                  ? 'bg-navy-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={`px-2.5 py-1 text-xs rounded transition-colors
                ${categoryFilter === opt.value
                  ? 'bg-champagne-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-navy-100 text-navy-700 border border-navy-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
            更多筛选
            {activeFilterCount > 0 && (
              <span className="bg-champagne-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
      </div>

      {showAdvancedFilters && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] text-gray-500">品牌：</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {brandFilterOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setBrandFilter(opt.value)}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors flex items-center gap-1
                      ${brandFilter === opt.value
                        ? 'bg-navy-700 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Flag className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] text-gray-500">状态：</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {statusFilterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors
                    ${statusFilter === opt.value
                      ? 'bg-navy-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {assignees.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-gray-500" />
                <span className="text-[11px] text-gray-500">负责人：</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setAssigneeFilter('all')}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors
                    ${assigneeFilter === 'all'
                      ? 'bg-navy-700 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  全部
                </button>
                {assignees.map((name) => (
                  <button
                    key={name}
                    onClick={() => setAssigneeFilter(name)}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors
                      ${assigneeFilter === name
                        ? 'bg-champagne-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400 mb-3 flex items-center gap-2">
        <span>拖拽卡片至右侧简报区添加到晨会汇报</span>
        <span className="text-champagne-400">·</span>
        <span>或点击 + 按钮快速添加</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <PeakEventCard key={event.id} event={event} index={index} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AlertTriangle className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-sm">暂无符合条件的峰值事件</span>
          </div>
        )}
      </div>

      {selfBrand && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>自家品牌峰值</span>
            <span className="font-medium text-navy-700">
              {peakEvents.filter((e) => e.brandId === selfBrand.id).length} 条
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

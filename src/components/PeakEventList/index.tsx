import { useState } from 'react';
import { AlertTriangle, Filter, Sparkles, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { useBrandStore } from '@/store/brandStore';
import PeakEventCard from '@/components/PeakEventCard';
import type { PeakLevel, PeakCategory, PeakEvent } from '@/types';

export default function PeakEventList() {
  const { getPeaksByGroup, getRecommendedPeaks } = useDataStore();
  const { selectedGroupId, getAllBrands, getSelfBrand } = useBrandStore();
  const [levelFilter, setLevelFilter] = useState<PeakLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<PeakCategory | 'all'>('all');
  const [showRecommended, setShowRecommended] = useState(true);

  const brands = getAllBrands();
  const selfBrand = getSelfBrand();
  const peakEvents = selectedGroupId ? getPeaksByGroup(selectedGroupId) : [];
  const recommendedPeaks = selectedGroupId ? getRecommendedPeaks(selectedGroupId) : [];

  const filteredEvents = peakEvents
    .filter((event) => {
      const hasBrand = brands.some((b) => b.id === event.brandId);
      if (!hasBrand) return false;
      if (levelFilter !== 'all' && event.level !== levelFilter) return false;
      if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => b.mentionCount - a.mentionCount);

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
            {recommendedPeaks.slice(0, 3).map((event) => (
              <div
                key={`rec-${event.id}`}
                className="flex items-start gap-2 p-2 bg-white/70 rounded text-xs"
              >
                <div className="mt-0.5">{getRecommendIcon(event)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{event.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{event.recommendReason}</p>
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

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Filter className="w-3.5 h-3.5" />
          <span>筛选：</span>
        </div>

        <div className="flex gap-1">
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
      </div>

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

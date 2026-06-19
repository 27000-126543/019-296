import { useState, useMemo } from 'react';
import { GripVertical, Clock, MessageSquare, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import type { PeakEvent } from '@/types';
import { useBrandStore } from '@/store/brandStore';
import { useBriefStore } from '@/store/briefStore';
import { formatNumber, getLevelBgColor, getLevelLabel, getCategoryLabel } from '@/utils/helpers';

interface PeakEventCardProps {
  event: PeakEvent;
  index?: number;
}

export default function PeakEventCard({ event, index = 0 }: PeakEventCardProps) {
  const { getAllBrands } = useBrandStore();
  const { cardsByGroup, activeGroupId, addCard } = useBriefStore();
  const [isDragging, setIsDragging] = useState(false);

  const brands = getAllBrands();
  const brand = brands.find((b) => b.id === event.brandId);

  const isAdded = useMemo(() => {
    if (!activeGroupId) return false;
    const cards = cardsByGroup[activeGroupId] || [];
    return cards.some((c) => c.peakEventId === event.id);
  }, [cardsByGroup, activeGroupId, event.id]);

  const handleDragStart = (e: React.DragEvent) => {
    if (isAdded) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.setData('peakEventId', event.id);
    e.dataTransfer.setData('category', event.category);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleAddClick = () => {
    if (!isAdded) {
      addCard(event.id, event.category);
    }
  };

  return (
    <div
      draggable={!isAdded}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`card-base p-4 relative cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95 shadow-lg' : ''}
        ${isAdded ? 'opacity-60 cursor-not-allowed' : 'card-hover'}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {brand && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: brand.color }}
              />
            )}
            <span className="text-xs text-gray-500 truncate">
              {brand?.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getLevelBgColor(event.level)}`}>
              {getLevelLabel(event.level)}
            </span>
            {event.isRecommended && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                ★ 推荐
              </span>
            )}
          </div>

          <h4 className="text-sm font-medium text-navy-800 mb-2 line-clamp-2 leading-snug">
            {event.title}
          </h4>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
            {event.summary}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{event.time.split(' ')[1]}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="w-3 h-3" />
              <span>{formatNumber(event.mentionCount)}</span>
            </div>
            {event.negativeRatio !== undefined && (
              <div className="flex items-center gap-0.5 text-xs text-red-500">
                <span>负面 {event.negativeRatio}%</span>
              </div>
            )}
            {event.dayOverDayChange !== undefined && (
              <div className={`flex items-center gap-0.5 text-xs ${
                event.dayOverDayChange > 0 ? 'text-red-500' : 'text-emerald-500'
              }`}>
                {event.dayOverDayChange > 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                <span>{event.dayOverDayChange > 0 ? '+' : ''}{event.dayOverDayChange}%</span>
              </div>
            )}
            <span className="text-[10px] text-gray-400 ml-auto">
              {getCategoryLabel(event.category)}
            </span>
          </div>
        </div>

        <button
          onClick={handleAddClick}
          disabled={isAdded}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
            ${isAdded
              ? 'bg-gray-100 text-gray-400'
              : 'bg-champagne-50 text-champagne-500 hover:bg-champagne-100 hover:scale-110'
            }`}
          title={isAdded ? '已添加' : '添加到简报'}
        >
          <Plus className={`w-4 h-4 ${isAdded ? '' : 'transition-transform group-hover:rotate-90'}`} />
        </button>
      </div>

      {isAdded && (
        <div className="absolute top-2 right-2">
          <span className="text-[10px] bg-champagne-100 text-champagne-600 px-2 py-0.5 rounded-full">
            已添加
          </span>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { X, Edit2, Check, GripVertical, MessageSquare } from 'lucide-react';
import type { BriefCard as BriefCardType } from '@/types';
import { useDataStore } from '@/store/dataStore';
import { useBriefStore } from '@/store/briefStore';
import { useBrandStore } from '@/store/brandStore';
import { formatNumber, getCategoryColor, getCategoryLabel } from '@/utils/helpers';

interface BriefCardProps {
  card: BriefCardType;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  index?: number;
}

export default function BriefCard({ card, onDragStart, onDragEnd, index = 0 }: BriefCardProps) {
  const { getPeakById } = useDataStore();
  const { removeCard, updateJudgement } = useBriefStore();
  const { getAllBrands } = useBrandStore();

  const [isEditing, setIsEditing] = useState(false);
  const [judgementText, setJudgementText] = useState(card.judgement);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const event = getPeakById(card.peakEventId);
  const brands = getAllBrands();
  const brand = brands.find((b) => b.id === event?.brandId);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    updateJudgement(card.id, judgementText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setJudgementText(card.judgement);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, index);
    }
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('fromBrief', 'true');
    e.dataTransfer.effectAllowed = 'move';
  };

  if (!event) return null;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded border border-gray-100 shadow-sm p-4 group
                  transition-all duration-200 hover:shadow-md cursor-grab active:cursor-grabbing`}
    >
      <div className="flex items-start gap-2">
        <div className="pt-0.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(card.category)}`}>
              {getCategoryLabel(card.category)}
            </span>
            {brand && (
              <>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: brand.color }}
                />
                <span className="text-xs text-gray-500">{brand.name}</span>
              </>
            )}
          </div>

          <h4 className="text-sm font-medium text-navy-800 mb-2 leading-snug">
            {event.title}
          </h4>

          <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
            <span>{event.time.split(' ')[1]}</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {formatNumber(event.mentionCount)}
            </span>
          </div>

          <div className="bg-champagne-50/50 rounded p-2.5 border border-champagne-100">
            {isEditing ? (
              <div>
                <textarea
                  ref={textareaRef}
                  value={judgementText}
                  onChange={(e) => setJudgementText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入判断说明..."
                  className="w-full text-xs text-gray-700 bg-transparent resize-none outline-none
                             placeholder:text-gray-400 min-h-[60px]"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleCancel}
                    className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-2.5 py-1 text-xs bg-champagne-500 text-white rounded
                               hover:bg-champagne-600 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="cursor-pointer group/editor"
              >
                <p className={`text-xs text-gray-700 leading-relaxed ${!card.judgement ? 'text-gray-400 italic' : ''}`}>
                  {card.judgement || '点击添加判断说明...'}
                </p>
                <div className="flex justify-end mt-1 opacity-0 group-hover/editor:opacity-100 transition-opacity">
                  <span className="text-[10px] text-champagne-500 flex items-center gap-1">
                    <Edit2 className="w-3 h-3" />
                    编辑
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => removeCard(card.id)}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                     text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all
                     opacity-0 group-hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

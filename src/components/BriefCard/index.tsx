import { useState, useRef, useEffect } from 'react';
import {
  X,
  Edit2,
  Check,
  GripVertical,
  MessageSquare,
  User,
  Calendar,
  Flag,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';
import type { BriefCard as BriefCardType, CardStatus } from '@/types';
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

const statusOptions: { value: CardStatus; label: string; color: string }[] = [
  { value: 'pending', label: '待处理', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { value: 'in-progress', label: '处理中', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'monitoring', label: '观察中', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'resolved', label: '已解决', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
];

export default function BriefCard({ card, onDragStart, onDragEnd, index = 0 }: BriefCardProps) {
  const { getPeakById } = useDataStore();
  const {
    removeCard,
    updateJudgement,
    updateAssignee,
    updateStatus,
    updateDueDate,
    updateActionItem,
  } = useBriefStore();
  const { getAllBrands } = useBrandStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [judgementText, setJudgementText] = useState(card.judgement);
  const [assigneeText, setAssigneeText] = useState(card.assignee || '');
  const [actionText, setActionText] = useState(card.actionItem || '');
  const [isEditingAction, setIsEditingAction] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const actionRef = useRef<HTMLTextAreaElement>(null);

  const event = getPeakById(card.peakEventId);
  const brands = getAllBrands();
  const brand = brands.find((b) => b.id === event?.brandId);

  const currentStatus = statusOptions.find((s) => s.value === card.status) || statusOptions[0];

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditingAction && actionRef.current) {
      actionRef.current.focus();
    }
  }, [isEditingAction]);

  const handleSaveJudgement = () => {
    updateJudgement(card.id, judgementText);
    setIsEditing(false);
  };

  const handleCancelJudgement = () => {
    setJudgementText(card.judgement);
    setIsEditing(false);
  };

  const handleSaveAssignee = (value: string) => {
    updateAssignee(card.id, value);
  };

  const handleStatusChange = (status: CardStatus) => {
    updateStatus(card.id, status);
  };

  const handleSaveAction = () => {
    updateActionItem(card.id, actionText);
    setIsEditingAction(false);
  };

  const handleCancelAction = () => {
    setActionText(card.actionItem || '');
    setIsEditingAction(false);
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
      className={`bg-white rounded border shadow-sm p-4 group
                  transition-all duration-200 hover:shadow-md cursor-grab active:cursor-grabbing
                  ${card.status === 'resolved' ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'}`}
    >
      <div className="flex items-start gap-2">
        <div className="pt-0.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(card.category)}`}>
              {getCategoryLabel(card.category)}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${currentStatus.color}`}>
              {currentStatus.label}
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
            {event.negativeRatio !== undefined && (
              <span className="text-red-500">负面 {event.negativeRatio}%</span>
            )}
            {event.dayOverDayChange !== undefined && (
              <span className={event.dayOverDayChange > 0 ? 'text-red-500' : 'text-emerald-500'}>
                {event.dayOverDayChange > 0 ? '↑' : '↓'} {Math.abs(event.dayOverDayChange)}%
              </span>
            )}
          </div>

          {event.summary && (
            <div className="mb-3 p-2 bg-gray-50 rounded text-[11px] text-gray-600 leading-relaxed border border-gray-100">
              <span className="font-medium text-gray-700">摘要：</span>
              {event.summary}
            </div>
          )}

          <div className="bg-champagne-50/50 rounded p-2.5 border border-champagne-100">
            {isEditing ? (
              <div>
                <textarea
                  ref={textareaRef}
                  value={judgementText}
                  onChange={(e) => setJudgementText(e.target.value)}
                  placeholder="请输入判断说明..."
                  className="w-full text-xs text-gray-700 bg-transparent resize-none outline-none
                             placeholder:text-gray-400 min-h-[60px]"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleCancelJudgement}
                    className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveJudgement}
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
                <p className="text-[11px] text-gray-500 mb-1">判断说明</p>
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

          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-navy-700 transition-colors"
            >
              {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>协同备注</span>
              {(card.assignee || card.dueDate) && (
                <span className="w-1.5 h-1.5 rounded-full bg-champagne-500" />
              )}
            </button>

            {showNotes && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 flex gap-1 flex-wrap">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors
                          ${card.status === opt.value
                            ? opt.color
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={assigneeText}
                    onChange={(e) => setAssigneeText(e.target.value)}
                    onBlur={(e) => handleSaveAssignee(e.target.value)}
                    placeholder="负责人"
                    className="flex-1 text-xs py-1 px-2 bg-gray-50 border border-gray-200 rounded
                               focus:outline-none focus:border-champagne-400 focus:bg-white
                               placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={card.dueDate || ''}
                    onChange={(e) => updateDueDate(card.id, e.target.value)}
                    className="flex-1 text-xs py-1 px-2 bg-gray-50 border border-gray-200 rounded
                               focus:outline-none focus:border-champagne-400 focus:bg-white
                               text-gray-600"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 mb-1">建议动作</p>
                    {isEditingAction ? (
                      <div>
                        <textarea
                          ref={actionRef}
                          value={actionText}
                          onChange={(e) => setActionText(e.target.value)}
                          placeholder={event.suggestedAction || '输入建议动作...'}
                          className="w-full text-xs py-1.5 px-2 bg-amber-50 border border-amber-200 rounded
                                     focus:outline-none focus:border-amber-400 resize-none min-h-[50px]"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <button
                            onClick={handleCancelAction}
                            className="text-[10px] text-gray-500 hover:text-gray-700"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleSaveAction}
                            className="text-[10px] text-amber-600 hover:text-amber-700 font-medium"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsEditingAction(true)}
                        className="cursor-pointer p-2 bg-amber-50/70 rounded border border-amber-100"
                      >
                        <p className={`text-xs text-gray-700 ${!card.actionItem && !event.suggestedAction ? 'text-gray-400 italic' : ''}`}>
                          {card.actionItem || event.suggestedAction || '点击添加建议动作...'}
                        </p>
                      </div>
                    )}
                  </div>
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

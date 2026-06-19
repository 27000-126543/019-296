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
  Clock,
  MessageCircle,
  Plus,
  Trash2,
  Mic2,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import type { BriefCard as BriefCardType, CardStatus, ActivityLog } from '@/types';
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

const activityTypeConfig: Record<ActivityLog['type'], { label: string; icon: typeof Clock; color: string }> = {
  progress: { label: '进展', icon: Clock, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  result: { label: '结果', icon: FileCheck, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  note: { label: '备注', icon: MessageCircle, color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return '刚刚';
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export default function BriefCard({ card, onDragStart, onDragEnd, index = 0 }: BriefCardProps) {
  const { getPeakById } = useDataStore();
  const {
    removeCard,
    updateJudgement,
    updateAssignee,
    updateStatus,
    updateDueDate,
    updateActionItem,
    updateHostNotes,
    addActivity,
    removeActivity,
  } = useBriefStore();
  const { getAllBrands } = useBrandStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showHostNotes, setShowHostNotes] = useState(false);
  const [judgementText, setJudgementText] = useState(card.judgement);
  const [assigneeText, setAssigneeText] = useState(card.assignee || '');
  const [actionText, setActionText] = useState(card.actionItem || '');
  const [hostNotesText, setHostNotesText] = useState(card.hostNotes || '');
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [isEditingHostNotes, setIsEditingHostNotes] = useState(false);
  const [newActivityContent, setNewActivityContent] = useState('');
  const [newActivityAuthor, setNewActivityAuthor] = useState('');
  const [newActivityType, setNewActivityType] = useState<ActivityLog['type']>('progress');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const actionRef = useRef<HTMLTextAreaElement>(null);
  const hostNotesRef = useRef<HTMLTextAreaElement>(null);

  const event = getPeakById(card.peakEventId);
  const brands = getAllBrands();
  const brand = brands.find((b) => b.id === event?.brandId);

  const currentStatus = statusOptions.find((s) => s.value === card.status) || statusOptions[0];
  const activities = card.activities || [];
  const lastActivity = activities[activities.length - 1];

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

  useEffect(() => {
    if (isEditingHostNotes && hostNotesRef.current) {
      hostNotesRef.current.focus();
    }
  }, [isEditingHostNotes]);

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

  const handleSaveHostNotes = () => {
    updateHostNotes(card.id, hostNotesText);
    setIsEditingHostNotes(false);
  };

  const handleCancelHostNotes = () => {
    setHostNotesText(card.hostNotes || '');
    setIsEditingHostNotes(false);
  };

  const handleAddActivity = () => {
    if (!newActivityContent.trim()) return;
    addActivity(card.id, newActivityAuthor.trim() || '匿名', newActivityContent.trim(), newActivityType);
    setNewActivityContent('');
    setNewActivityAuthor('');
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
            {lastActivity && (
              <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {lastActivity.author} · {formatTime(lastActivity.timestamp)}
              </span>
            )}
          </div>

          <h4 className="text-sm font-medium text-navy-800 mb-2 leading-snug">
            {event.title}
          </h4>

          <div className="flex items-center gap-3 mb-3 text-xs text-gray-400 flex-wrap">
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
            {event.recommendScore && event.recommendScore.total >= 25 && (
              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                ★ 推荐度 {event.recommendScore.total}
              </span>
            )}
          </div>

          {event.summary && (
            <div className="mb-3 p-2 bg-gray-50 rounded text-[11px] text-gray-600 leading-relaxed border border-gray-100">
              <span className="font-medium text-gray-700">背景：</span>
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

          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center gap-1 text-[11px] transition-colors ${
                  showNotes ? 'text-navy-700' : 'text-gray-500 hover:text-navy-700'
                }`}
              >
                {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>协同备注</span>
                {(card.assignee || card.dueDate) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne-500" />
                )}
              </button>

              <button
                onClick={() => setShowActivities(!showActivities)}
                className={`flex items-center gap-1 text-[11px] transition-colors ${
                  showActivities ? 'text-navy-700' : 'text-gray-500 hover:text-navy-700'
                }`}
              >
                {showActivities ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>处理记录</span>
                {activities.length > 0 && (
                  <span className="bg-navy-100 text-navy-700 px-1.5 rounded-full">
                    {activities.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowHostNotes(!showHostNotes)}
                className={`flex items-center gap-1 text-[11px] transition-colors ${
                  showHostNotes ? 'text-navy-700' : 'text-gray-500 hover:text-navy-700'
                }`}
              >
                {showHostNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <Mic2 className="w-3.5 h-3.5" />
                <span>主持人备注</span>
                {card.hostNotes && (
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne-500" />
                )}
              </button>
            </div>

            {showNotes && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
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
                    className="flex-1 text-xs py-1 px-2 bg-white border border-gray-200 rounded
                               focus:outline-none focus:border-champagne-400
                               placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={card.dueDate || ''}
                    onChange={(e) => updateDueDate(card.id, e.target.value)}
                    className="flex-1 text-xs py-1 px-2 bg-white border border-gray-200 rounded
                               focus:outline-none focus:border-champagne-400
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

            {showActivities && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="space-y-2">
                  {activities.length === 0 ? (
                    <p className="text-[11px] text-gray-400 text-center py-2">暂无处理记录</p>
                  ) : (
                    activities.slice().reverse().map((activity) => {
                      const config = activityTypeConfig[activity.type];
                      const Icon = config.icon;
                      return (
                        <div
                          key={activity.id}
                          className={`p-2 rounded border ${config.color} group/act`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="text-[11px] font-medium">{activity.author}</span>
                              <span className="text-[10px] text-gray-500">
                                {formatTime(activity.timestamp)}
                              </span>
                            </div>
                            <button
                              onClick={() => removeActivity(card.id, activity.id)}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover/act:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                            {activity.content}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newActivityAuthor}
                      onChange={(e) => setNewActivityAuthor(e.target.value)}
                      placeholder="你的名字"
                      className="flex-1 text-xs py-1 px-2 bg-white border border-gray-200 rounded
                                 focus:outline-none focus:border-champagne-400
                                 placeholder:text-gray-400 max-w-[100px]"
                    />
                    <div className="flex gap-1">
                      {(['progress', 'result', 'note'] as ActivityLog['type'][]).map((type) => {
                        const config = activityTypeConfig[type];
                        const Icon = config.icon;
                        return (
                          <button
                            key={type}
                            onClick={() => setNewActivityType(type)}
                            className={`px-2 py-1 text-[10px] rounded border transition-colors flex items-center gap-1
                              ${newActivityType === type
                                ? config.color
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newActivityContent}
                      onChange={(e) => setNewActivityContent(e.target.value)}
                      placeholder={`添加${activityTypeConfig[newActivityType].label}记录...`}
                      className="flex-1 text-xs py-1.5 px-2 bg-white border border-gray-200 rounded
                                 focus:outline-none focus:border-champagne-400 resize-none min-h-[40px]"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleAddActivity();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddActivity}
                      disabled={!newActivityContent.trim()}
                      className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1
                        ${newActivityContent.trim()
                          ? 'bg-navy-700 text-white hover:bg-navy-800'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <Plus className="w-3 h-3" />
                      添加
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showHostNotes && (
              <div className="mt-3 p-3 bg-champagne-50/50 rounded-lg border border-champagne-100">
                <p className="text-[11px] text-champagne-700 mb-2 flex items-center gap-1">
                  <Mic2 className="w-3.5 h-3.5" />
                  主持人内部备注（投屏时不显示，仅导出 PDF 可见）
                </p>
                {isEditingHostNotes ? (
                  <div>
                    <textarea
                      ref={hostNotesRef}
                      value={hostNotesText}
                      onChange={(e) => setHostNotesText(e.target.value)}
                      placeholder="输入主持人跟进备注、分派任务、注意事项..."
                      className="w-full text-xs py-1.5 px-2 bg-white border border-champagne-200 rounded
                                 focus:outline-none focus:border-champagne-400 resize-none min-h-[60px]"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={handleCancelHostNotes}
                        className="text-[10px] text-gray-500 hover:text-gray-700"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSaveHostNotes}
                        className="text-[10px] text-champagne-700 hover:text-champagne-800 font-medium"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingHostNotes(true)}
                    className="cursor-pointer"
                  >
                    <p className={`text-xs text-gray-700 leading-relaxed ${!card.hostNotes ? 'text-gray-400 italic' : ''}`}>
                      {card.hostNotes || '点击添加主持人内部备注...'}
                    </p>
                  </div>
                )}
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

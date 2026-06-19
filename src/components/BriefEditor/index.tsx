import { useState } from 'react';
import { FileEdit, Trash2, Download, Plus } from 'lucide-react';
import { useBriefStore } from '@/store/briefStore';
import { useNavigate } from 'react-router-dom';
import BriefCard from '@/components/BriefCard';
import type { PeakCategory } from '@/types';
import { getCategoryLabel } from '@/utils/helpers';

const CATEGORIES: { key: PeakCategory; icon: string }[] = [
  { key: 'brand', icon: '🏢' },
  { key: 'competitor', icon: '🏁' },
  { key: 'risk', icon: '⚠️' },
  { key: 'opportunity', icon: '✨' },
];

export default function BriefEditor() {
  const { getCardsByCategory, addCard, clearAll, reorderCards } = useBriefStore();
  const navigate = useNavigate();
  const [dragOverCategory, setDragOverCategory] = useState<PeakCategory | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const totalCards = CATEGORIES.reduce(
    (sum, cat) => sum + getCardsByCategory(cat.key).length,
    0
  );

  const handleDragOver = (e: React.DragEvent, category: PeakCategory) => {
    e.preventDefault();
    setDragOverCategory(category);
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, category: PeakCategory) => {
    e.preventDefault();
    setDragOverCategory(null);

    const peakEventId = e.dataTransfer.getData('peakEventId');
    const fromBrief = e.dataTransfer.getData('fromBrief');

    if (peakEventId && !fromBrief) {
      addCard(peakEventId, category);
    }
  };

  const handleCardDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
  };

  const handleCardDragEnd = () => {
    setDragIndex(null);
  };

  const handleExport = () => {
    navigate('/export');
  };

  const getCategoryColor = (cat: PeakCategory) => {
    switch (cat) {
      case 'brand':
        return 'border-champagne-300 bg-champagne-50/50';
      case 'competitor':
        return 'border-navy-300 bg-navy-50/50';
      case 'risk':
        return 'border-red-300 bg-red-50/50';
      case 'opportunity':
        return 'border-emerald-300 bg-emerald-50/50';
    }
  };

  const getCategoryHeaderBg = (cat: PeakCategory) => {
    switch (cat) {
      case 'brand':
        return 'bg-champagne-500 text-white';
      case 'competitor':
        return 'bg-navy-600 text-white';
      case 'risk':
        return 'bg-red-500 text-white';
      case 'opportunity':
        return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="card-base p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-champagne-500" />
          <h3 className="section-title">晨会简报</h3>
          <span className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full">
            {totalCards} 条
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="清空全部"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            disabled={totalCards === 0}
            className={`btn-primary flex items-center gap-1.5 text-xs
              ${totalCards === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download className="w-3.5 h-3.5" />
            预览导出
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        将左侧异常峰值拖拽至对应分类，或点击 + 快速添加
      </p>

      <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden">
        {CATEGORIES.map((cat) => {
          const cards = getCardsByCategory(cat.key);
          const isDragOver = dragOverCategory === cat.key;

          return (
            <div
              key={cat.key}
              onDragOver={(e) => handleDragOver(e, cat.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, cat.key)}
              className={`flex flex-col rounded border-2 border-dashed transition-all duration-200 overflow-hidden
                ${isDragOver ? getCategoryColor(cat.key) + ' scale-[1.02]' : 'border-gray-200 bg-gray-50/30'}`}
            >
              <div className={`px-3 py-2 ${getCategoryHeaderBg(cat.key)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-sm font-medium">{getCategoryLabel(cat.key)}</span>
                  </div>
                  <span className="text-xs opacity-80">{cards.length}</span>
                </div>
              </div>

              <div className="flex-1 p-2 overflow-y-auto scrollbar-thin">
                {cards.length > 0 ? (
                  <div className="space-y-2">
                    {cards.map((card, idx) => (
                      <BriefCard
                        key={card.id}
                        card={card}
                        index={idx}
                        onDragStart={handleCardDragStart}
                        onDragEnd={handleCardDragEnd}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={`h-full min-h-[100px] flex flex-col items-center justify-center
                    text-gray-400 transition-colors ${isDragOver ? 'text-champagne-500' : ''}`}>
                    <Plus className={`w-6 h-6 mb-1 ${isDragOver ? 'animate-pulse' : ''}`} />
                    <span className="text-xs">
                      {isDragOver ? '松开添加' : '拖拽到此处'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

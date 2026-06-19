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
} from 'lucide-react';
import { useBrandStore } from '@/store/brandStore';
import { useDataStore } from '@/store/dataStore';
import { useBriefStore } from '@/store/briefStore';
import type { PeakCategory, PeakEvent, BriefCard } from '@/types';
import { formatDateCN, formatNumber, getYesterdayDate } from '@/utils/helpers';

export default function ExportPreview() {
  const navigate = useNavigate();
  const { getCurrentGroup, getSelfBrand, getAllBrands } = useBrandStore();
  const { getSentimentByBrand, getPeakById } = useDataStore();
  const { getCardsByCategory } = useBriefStore();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentGroup = getCurrentGroup();
  const selfBrand = getSelfBrand();
  const brands = getAllBrands();
  const yesterday = getYesterdayDate();

  useEffect(() => {
    if (!currentGroup) {
      navigate('/');
    }
  }, [currentGroup, navigate]);

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

  const categoryConfig: { key: PeakCategory; label: string; icon: typeof Building2; color: string }[] = [
    { key: 'brand', label: '品牌动态', icon: Building2, color: 'text-champagne-600' },
    { key: 'competitor', label: '竞品动态', icon: TrendingUp, color: 'text-navy-600' },
    { key: 'risk', label: '风险预警', icon: AlertTriangle, color: 'text-red-600' },
    { key: 'opportunity', label: '机会点', icon: Sparkles, color: 'text-emerald-600' },
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

      <main className="p-8 print:p-0">
        <div className="max-w-[1400px] mx-auto bg-white shadow-lg print:shadow-none">
          <div className="p-8 print:p-6">
            <div className="flex items-start justify-between border-b-2 border-navy-800 pb-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1 tracking-widest">
                  BRAND VOICE BRIEFING
                </p>
                <h2 className="font-serif text-2xl font-bold text-navy-800">
                  {currentGroup.name} — 昨日声量简报
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  汇报日期：{formatDateCN(yesterday)}
                </p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-navy-800 rounded flex items-center justify-center">
                  <span className="text-white font-serif text-lg font-bold">
                    简报
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-serif text-lg font-semibold text-navy-800 mb-3">
                一、声量概览
              </h3>
              <div className="grid grid-cols-6 gap-4">
                {rankedBrands.slice(0, 6).map((item, index) => {
                  const maxTotal = rankedBrands[0].total;
                  const percentage = (item.total / maxTotal) * 100;
                  const isSelf = item.brand.id === selfBrand.id;

                  return (
                    <div
                      key={item.brand.id}
                      className={`p-3 rounded border ${
                        isSelf
                          ? 'border-champagne-300 bg-champagne-50/50'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
                          ${index === 0 ? 'bg-champagne-400 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-amber-500 text-white' :
                            'bg-gray-300 text-white'}`}>
                          {index + 1}
                        </span>
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.brand.color }}
                        />
                        <span className={`text-sm font-medium truncate ${
                          isSelf ? 'text-champagne-700' : 'text-navy-700'
                        }`}>
                          {item.brand.name}
                        </span>
                        {isSelf && (
                          <span className="text-[9px] bg-champagne-200 text-champagne-700 px-1 rounded">
                            自家
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-serif font-bold text-navy-800 mb-1">
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
                      <div className="mt-1 text-[10px] text-gray-500">
                        正面 {Math.round((item.positive / item.total) * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
              {categoryConfig.map((cat) => {
                const cards = getCardsByCategory(cat.key);
                const Icon = cat.icon;

                return (
                  <div key={cat.key} className="flex flex-col">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-3">
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                      <h3 className={`font-serif text-base font-semibold ${cat.color}`}>
                        {cat.label}
                      </h3>
                      <span className="text-xs text-gray-400 ml-auto">
                        {cards.length} 条
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      {cards.length > 0 ? (
                        cards.map((card) => {
                          const { event, brand } = getCardData(card);
                          if (!event) return null;

                          return (
                            <div
                              key={card.id}
                              className="p-3 bg-gray-50 rounded border border-gray-100"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {brand && (
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: brand.color }}
                                  />
                                )}
                                <span className="text-xs text-gray-500">
                                  {brand?.name}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-auto">
                                  {formatNumber(event.mentionCount)}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-navy-800 mb-2 leading-snug">
                                {event.title}
                              </h4>
                              {card.judgement && (
                                <div className="bg-white p-2 rounded border-l-2 border-champagne-400">
                                  <p className="text-xs text-gray-700 leading-relaxed">
                                    {card.judgement}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex-1 flex items-center justify-center py-8 text-gray-300">
                          <span className="text-sm">暂无内容</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400 print:hidden">
              <span>数据来源：全网舆情监测系统</span>
              <span>生成时间：{new Date().toLocaleString('zh-CN')}</span>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 15mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

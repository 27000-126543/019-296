import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Download,
  Settings,
  RefreshCw,
  TrendingUp,
  Bell,
  Folder,
  Archive,
  Check,
} from 'lucide-react';
import { useBrandStore } from '@/store/brandStore';
import { useDataStore } from '@/store/dataStore';
import { useBriefStore } from '@/store/briefStore';
import VolumeRanking from '@/components/VolumeRanking';
import SentimentChart from '@/components/SentimentChart';
import PlatformChart from '@/components/PlatformChart';
import PeakEventList from '@/components/PeakEventList';
import BriefEditor from '@/components/BriefEditor';
import { formatDateCN, formatNumber, getYesterdayDate } from '@/utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const { selectedGroupId, getCurrentGroup, getSelfBrand } = useBrandStore();
  const { getSentimentByBrand, getPeaksByGroup } = useDataStore();
  const { setActiveGroup, getCards, archiveCurrentBrief } = useBriefStore();
  const [showArchiveSuccess, setShowArchiveSuccess] = useState(false);

  const currentGroup = getCurrentGroup();
  const selfBrand = getSelfBrand();

  useEffect(() => {
    if (!selectedGroupId) {
      navigate('/');
      return;
    }
    setActiveGroup(selectedGroupId);
  }, [selectedGroupId, navigate, setActiveGroup]);

  if (!selectedGroupId || !currentGroup) {
    return null;
  }

  const yesterday = getYesterdayDate();
  const selfSentiment = selfBrand ? getSentimentByBrand(selfBrand.id) : null;
  const groupPeaks = getPeaksByGroup(selectedGroupId);
  const selfPeaks = groupPeaks.filter((p) => p.brandId === selfBrand?.id);
  const briefCards = getCards();

  const handleExport = () => {
    navigate('/export');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleArchive = () => {
    if (briefCards.length === 0) return;
    archiveCurrentBrief(selectedGroupId, currentGroup.name, formatDateCN(yesterday));
    setShowArchiveSuccess(true);
    setTimeout(() => setShowArchiveSuccess(false), 2500);
  };

  const handleViewArchive = () => {
    navigate('/archive');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-navy-800 text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">切换品牌组</span>
          </button>

          <div className="h-6 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-champagne-400 to-champagne-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base font-semibold tracking-wide">
                  {currentGroup.name}
                </h1>
                <span className="text-[10px] bg-champagne-500/20 text-champagne-300 px-1.5 py-0.5 rounded">
                  昨日概览
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/50">
                <Calendar className="w-3 h-3" />
                <span>{formatDateCN(yesterday)}</span>
                <span className="text-white/30">|</span>
                <span>简报 {briefCards.length} 条</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selfSentiment && (
            <div className="hidden md:flex items-center gap-4 pr-4 border-r border-white/10">
              <div className="text-right">
                <p className="text-[10px] text-white/50">总声量</p>
                <p className="text-sm font-serif font-semibold text-champagne-400">
                  {formatNumber(selfSentiment.totalMentions)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50">正面占比</p>
                <p className="text-sm font-serif font-semibold text-emerald-400">
                  {Math.round((selfSentiment.positive / selfSentiment.totalMentions) * 100)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50">异常峰值</p>
                <p className="text-sm font-serif font-semibold text-amber-400">
                  {selfPeaks.length}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleViewArchive}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors flex items-center gap-1"
            title="历史归档"
          >
            <Folder className="w-4 h-4" />
          </button>
          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
            <Settings className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleArchive}
              disabled={briefCards.length === 0}
              className={`px-3 py-1.5 text-white text-xs font-medium rounded
                         transition-all flex items-center gap-1.5
                ${briefCards.length === 0
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-navy-600 hover:bg-navy-500 active:scale-[0.98]'
                }`}
              title="归档当前简报"
            >
              <Archive className="w-3.5 h-3.5" />
              归档
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-1.5 bg-champagne-500 text-white text-sm font-medium rounded
                         hover:bg-champagne-600 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出简报
            </button>
          </div>
        </div>
      </header>

      {showArchiveSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50
                        bg-emerald-500 text-white px-5 py-2.5 rounded-lg shadow-lg
                        flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span className="text-sm">简报已归档到历史记录</span>
        </div>
      )}

      <main className="flex-1 p-5 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-5">
          <div className="col-span-5 flex flex-col gap-5 min-h-0">
            <VolumeRanking />
            <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">
              <SentimentChart />
              <PlatformChart />
            </div>
          </div>

          <div className="col-span-3 min-h-0">
            <PeakEventList />
          </div>

          <div className="col-span-4 min-h-0">
            <BriefEditor />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 px-6 py-2 flex items-center justify-between text-[11px] text-gray-400 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>数据来源：全网舆情监测系统</span>
          <span className="text-gray-200">|</span>
          <span>更新时间：今日 08:00</span>
        </div>
        <span>© 2026 声量简报系统 · 公关晨会专用</span>
      </footer>
    </div>
  );
}

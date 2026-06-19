import { create } from 'zustand';
import type { SentimentData, PlatformData, PeakEvent, RecommendScore } from '@/types';
import { sentimentData, platformData, peakEventsByGroup } from '@/data/mockData';
import { useBrandStore } from './brandStore';

const calculateRecommendScore = (event: PeakEvent): RecommendScore => {
  const reasons: string[] = [];
  let negativeScore = 0;
  let volumeScore = 0;
  let competitorScore = 0;

  if (event.negativeRatio !== undefined) {
    if (event.negativeRatio >= 70) {
      negativeScore = 40;
      reasons.push(`负面占比 ${event.negativeRatio}%，需重点关注`);
    } else if (event.negativeRatio >= 50) {
      negativeScore = 25;
      reasons.push(`负面占比偏高 ${event.negativeRatio}%`);
    } else if (event.negativeRatio >= 30) {
      negativeScore = 10;
    }
  }

  if (event.dayOverDayChange !== undefined) {
    if (event.dayOverDayChange >= 100) {
      volumeScore = 35;
      reasons.push(`声量暴涨 +${event.dayOverDayChange}%`);
    } else if (event.dayOverDayChange >= 50) {
      volumeScore = 20;
      reasons.push(`声量快速上升 +${event.dayOverDayChange}%`);
    } else if (event.dayOverDayChange >= 20) {
      volumeScore = 10;
    }
  }

  if (event.category === 'competitor') {
    competitorScore = 25;
    reasons.push('竞品重要动态');
  } else if (event.category === 'risk') {
    competitorScore = 20;
    reasons.push('潜在风险事件');
  }

  if (event.level === 'high') {
    volumeScore += 15;
    if (!reasons.includes('高风险等级')) {
      reasons.unshift('高风险等级');
    }
  } else if (event.level === 'medium') {
    volumeScore += 5;
  }

  const total = Math.min(100, negativeScore + volumeScore + competitorScore);

  if (reasons.length === 0) {
    reasons.push('综合指标值得关注');
  }

  return { total, negativeScore, volumeScore, competitorScore, reasons };
};

interface DataState {
  sentimentData: SentimentData[];
  platformData: PlatformData[];
  getSentimentByBrand: (brandId: string) => SentimentData | undefined;
  getPlatformByBrand: (brandId: string) => PlatformData | undefined;
  getPeaksByGroup: (groupId: string) => PeakEvent[];
  getPeaksByBrand: (brandId: string) => PeakEvent[];
  getPeakById: (peakId: string) => PeakEvent | undefined;
  getRankedBrands: () => { brandId: string; totalMentions: number }[];
  getRecommendedPeaks: (groupId: string) => PeakEvent[];
  getPeaksWithScore: (groupId: string) => PeakEvent[];
  calculateScore: (event: PeakEvent) => RecommendScore;
}

export const useDataStore = create<DataState>((set, get) => ({
  sentimentData,
  platformData,

  getSentimentByBrand: (brandId: string) => {
    return get().sentimentData.find(s => s.brandId === brandId);
  },

  getPlatformByBrand: (brandId: string) => {
    return get().platformData.find(p => p.brandId === brandId);
  },

  getPeaksByGroup: (groupId: string) => {
    const peaks = peakEventsByGroup[groupId] || [];
    return peaks.map(p => ({
      ...p,
      recommendScore: calculateRecommendScore(p),
    }));
  },

  getPeaksByBrand: (brandId: string) => {
    const allPeaks = Object.values(peakEventsByGroup).flat();
    return allPeaks
      .filter(p => p.brandId === brandId)
      .map(p => ({ ...p, recommendScore: calculateRecommendScore(p) }));
  },

  getPeakById: (peakId: string) => {
    const allPeaks = Object.values(peakEventsByGroup).flat();
    const peak = allPeaks.find(p => p.id === peakId);
    if (!peak) return undefined;
    return { ...peak, recommendScore: calculateRecommendScore(peak) };
  },

  getRankedBrands: () => {
    const selectedGroupId = useBrandStore.getState().selectedGroupId;
    const group = useBrandStore.getState().brandGroups.find(g => g.id === selectedGroupId);
    if (!group) return [];

    const ranked = group.brands
      .map(brand => {
        const sentiment = get().sentimentData.find(s => s.brandId === brand.id);
        return {
          brandId: brand.id,
          totalMentions: sentiment?.totalMentions || 0,
        };
      })
      .sort((a, b) => b.totalMentions - a.totalMentions);

    return ranked;
  },

  getRecommendedPeaks: (groupId: string) => {
    const peaks = get().getPeaksWithScore(groupId);
    return peaks
      .filter(p => (p.recommendScore?.total || 0) >= 25)
      .sort((a, b) => (b.recommendScore?.total || 0) - (a.recommendScore?.total || 0));
  },

  getPeaksWithScore: (groupId: string) => {
    const peaks = peakEventsByGroup[groupId] || [];
    return peaks
      .map(p => ({ ...p, recommendScore: calculateRecommendScore(p) }))
      .sort((a, b) => (b.recommendScore?.total || 0) - (a.recommendScore?.total || 0));
  },

  calculateScore: calculateRecommendScore,
}));

import { create } from 'zustand';
import type { SentimentData, PlatformData, PeakEvent } from '@/types';
import { sentimentData, platformData, peakEventsByGroup } from '@/data/mockData';
import { useBrandStore } from './brandStore';

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
    return peakEventsByGroup[groupId] || [];
  },

  getPeaksByBrand: (brandId: string) => {
    const allPeaks = Object.values(peakEventsByGroup).flat();
    return allPeaks.filter(p => p.brandId === brandId);
  },

  getPeakById: (peakId: string) => {
    const allPeaks = Object.values(peakEventsByGroup).flat();
    return allPeaks.find(p => p.id === peakId);
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
    const peaks = peakEventsByGroup[groupId] || [];
    return peaks
      .filter(p => p.isRecommended)
      .sort((a, b) => {
        const scoreA = (a.level === 'high' ? 3 : a.level === 'medium' ? 2 : 1) + (a.mentionCount / 10000);
        const scoreB = (b.level === 'high' ? 3 : b.level === 'medium' ? 2 : 1) + (b.mentionCount / 10000);
        return scoreB - scoreA;
      });
  },
}));

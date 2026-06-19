import { create } from 'zustand';
import type { SentimentData, PlatformData, PeakEvent } from '@/types';
import { sentimentData, platformData, peakEvents } from '@/data/mockData';
import { useBrandStore } from './brandStore';

interface DataState {
  sentimentData: SentimentData[];
  platformData: PlatformData[];
  peakEvents: PeakEvent[];
  getSentimentByBrand: (brandId: string) => SentimentData | undefined;
  getPlatformByBrand: (brandId: string) => PlatformData | undefined;
  getPeaksByBrand: (brandId: string) => PeakEvent[];
  getPeakById: (peakId: string) => PeakEvent | undefined;
  getRankedBrands: () => { brandId: string; totalMentions: number }[];
}

export const useDataStore = create<DataState>((set, get) => ({
  sentimentData,
  platformData,
  peakEvents,

  getSentimentByBrand: (brandId: string) => {
    return get().sentimentData.find(s => s.brandId === brandId);
  },

  getPlatformByBrand: (brandId: string) => {
    return get().platformData.find(p => p.brandId === brandId);
  },

  getPeaksByBrand: (brandId: string) => {
    return get().peakEvents.filter(p => p.brandId === brandId);
  },

  getPeakById: (peakId: string) => {
    return get().peakEvents.find(p => p.id === peakId);
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
}));

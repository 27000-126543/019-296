import { create } from 'zustand';
import type { BrandGroup, Brand } from '@/types';
import { brandGroups } from '@/data/mockData';

interface BrandState {
  brandGroups: BrandGroup[];
  selectedGroupId: string | null;
  selectedBrandId: string | null;
  setSelectedGroup: (groupId: string) => void;
  setSelectedBrand: (brandId: string) => void;
  getCurrentGroup: () => BrandGroup | undefined;
  getSelfBrand: () => Brand | undefined;
  getAllBrands: () => Brand[];
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brandGroups,
  selectedGroupId: null,
  selectedBrandId: null,

  setSelectedGroup: (groupId: string) => {
    const group = brandGroups.find(g => g.id === groupId);
    const selfBrand = group?.brands.find(b => b.isSelf);
    set({
      selectedGroupId: groupId,
      selectedBrandId: selfBrand?.id || null,
    });
  },

  setSelectedBrand: (brandId: string) => {
    set({ selectedBrandId: brandId });
  },

  getCurrentGroup: () => {
    const { selectedGroupId, brandGroups } = get();
    return brandGroups.find(g => g.id === selectedGroupId);
  },

  getSelfBrand: () => {
    const group = get().getCurrentGroup();
    return group?.brands.find(b => b.isSelf);
  },

  getAllBrands: () => {
    const group = get().getCurrentGroup();
    return group?.brands || [];
  },
}));

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

const STORAGE_KEY = 'brand-selection';

const loadFromStorage = (): { groupId: string | null; brandId: string | null } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { groupId: parsed.groupId || null, brandId: parsed.brandId || null };
    }
  } catch {
    // ignore
  }
  return { groupId: null, brandId: null };
};

const saveToStorage = (groupId: string | null, brandId: string | null) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ groupId, brandId }));
  } catch {
    // ignore
  }
};

const stored = loadFromStorage();

export const useBrandStore = create<BrandState>((set, get) => ({
  brandGroups,
  selectedGroupId: stored.groupId,
  selectedBrandId: stored.brandId,

  setSelectedGroup: (groupId: string) => {
    const group = brandGroups.find(g => g.id === groupId);
    const selfBrand = group?.brands.find(b => b.isSelf);
    const brandId = selfBrand?.id || null;
    set({
      selectedGroupId: groupId,
      selectedBrandId: brandId,
    });
    saveToStorage(groupId, brandId);
  },

  setSelectedBrand: (brandId: string) => {
    set({ selectedBrandId: brandId });
    saveToStorage(get().selectedGroupId, brandId);
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

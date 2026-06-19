import { create } from 'zustand';
import type { BriefCard, PeakCategory } from '@/types';

interface BriefState {
  cards: BriefCard[];
  addCard: (peakEventId: string, category: PeakCategory) => void;
  removeCard: (cardId: string) => void;
  updateJudgement: (cardId: string, judgement: string) => void;
  reorderCards: (category: PeakCategory, fromIndex: number, toIndex: number) => void;
  getCardsByCategory: (category: PeakCategory) => BriefCard[];
  hasPeak: (peakEventId: string) => boolean;
  clearAll: () => void;
}

const STORAGE_KEY = 'brief-cards';

const loadFromStorage = (): BriefCard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (cards: BriefCard[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // ignore
  }
};

export const useBriefStore = create<BriefState>((set, get) => ({
  cards: loadFromStorage(),

  addCard: (peakEventId: string, category: PeakCategory) => {
    const { cards } = get();
    if (cards.some(c => c.peakEventId === peakEventId)) return;

    const categoryCards = cards.filter(c => c.category === category);
    const newCard: BriefCard = {
      id: `card-${Date.now()}`,
      peakEventId,
      judgement: '',
      category,
      sortOrder: categoryCards.length,
    };

    const newCards = [...cards, newCard];
    set({ cards: newCards });
    saveToStorage(newCards);
  },

  removeCard: (cardId: string) => {
    const card = get().cards.find(c => c.id === cardId);
    if (!card) return;

    const newCards = get().cards.filter(c => c.id !== cardId);
    const categoryCards = newCards
      .filter(c => c.category === card.category)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    categoryCards.forEach((c, i) => {
      c.sortOrder = i;
    });

    set({ cards: [...newCards] });
    saveToStorage([...newCards]);
  },

  updateJudgement: (cardId: string, judgement: string) => {
    const newCards = get().cards.map(c =>
      c.id === cardId ? { ...c, judgement } : c
    );
    set({ cards: newCards });
    saveToStorage(newCards);
  },

  reorderCards: (category: PeakCategory, fromIndex: number, toIndex: number) => {
    const { cards } = get();
    const categoryCards = cards
      .filter(c => c.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const [moved] = categoryCards.splice(fromIndex, 1);
    categoryCards.splice(toIndex, 0, moved);

    categoryCards.forEach((c, i) => {
      c.sortOrder = i;
    });

    const otherCards = cards.filter(c => c.category !== category);
    const newCards = [...otherCards, ...categoryCards];
    set({ cards: newCards });
    saveToStorage(newCards);
  },

  getCardsByCategory: (category: PeakCategory) => {
    return get().cards
      .filter(c => c.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  hasPeak: (peakEventId: string) => {
    return get().cards.some(c => c.peakEventId === peakEventId);
  },

  clearAll: () => {
    set({ cards: [] });
    saveToStorage([]);
  },
}));

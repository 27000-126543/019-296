import { create } from 'zustand';
import type { BriefCard, PeakCategory, CardStatus } from '@/types';

interface BriefState {
  cardsByGroup: Record<string, BriefCard[]>;
  activeGroupId: string | null;
  setActiveGroup: (groupId: string) => void;
  getCards: () => BriefCard[];
  addCard: (peakEventId: string, category: PeakCategory) => void;
  removeCard: (cardId: string) => void;
  updateJudgement: (cardId: string, judgement: string) => void;
  updateAssignee: (cardId: string, assignee: string) => void;
  updateStatus: (cardId: string, status: CardStatus) => void;
  updateDueDate: (cardId: string, dueDate: string) => void;
  updateActionItem: (cardId: string, actionItem: string) => void;
  reorderCards: (category: PeakCategory, fromIndex: number, toIndex: number) => void;
  getCardsByCategory: (category: PeakCategory) => BriefCard[];
  hasPeak: (peakEventId: string) => boolean;
  clearAll: () => void;
}

const STORAGE_KEY = 'brief-cards-by-group';

const loadFromStorage = (): Record<string, BriefCard[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveToStorage = (cardsByGroup: Record<string, BriefCard[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cardsByGroup));
  } catch {
    // ignore
  }
};

export const useBriefStore = create<BriefState>((set, get) => ({
  cardsByGroup: loadFromStorage(),
  activeGroupId: null,

  setActiveGroup: (groupId: string) => {
    const { cardsByGroup } = get();
    if (!cardsByGroup[groupId]) {
      cardsByGroup[groupId] = [];
    }
    set({ activeGroupId: groupId });
  },

  getCards: (): BriefCard[] => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return [];
    return cardsByGroup[activeGroupId] || [];
  },

  addCard: (peakEventId: string, category: PeakCategory) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    if (cards.some(c => c.peakEventId === peakEventId)) return;

    const categoryCards = cards.filter(c => c.category === category);
    const newCard: BriefCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      peakEventId,
      judgement: '',
      category,
      sortOrder: categoryCards.length,
      status: 'pending',
      assignee: '',
      dueDate: '',
      actionItem: '',
    };

    const newCards = [...cards, newCard];
    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },

  removeCard: (cardId: string) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newCards = cards.filter(c => c.id !== cardId);
    const categoryCards = newCards
      .filter(c => c.category === card.category)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    categoryCards.forEach((c, i) => {
      c.sortOrder = i;
    });

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },

  updateJudgement: (cardId: string, judgement: string) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, judgement } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },

  updateAssignee: (cardId: string, assignee: string) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, assignee } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },

  updateStatus: (cardId: string, status: CardStatus) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, status } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },

  updateDueDate: (cardId: string, dueDate: string) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, dueDate } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },

  updateActionItem: (cardId: string, actionItem: string) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, actionItem } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },

  reorderCards: (category: PeakCategory, fromIndex: number, toIndex: number) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
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
    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },

  getCardsByCategory: (category: PeakCategory): BriefCard[] => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return [];
    const cards = cardsByGroup[activeGroupId] || [];
    return cards
      .filter(c => c.category === category)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  hasPeak: (peakEventId: string): boolean => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return false;
    const cards = cardsByGroup[activeGroupId] || [];
    return cards.some(c => c.peakEventId === peakEventId);
  },

  clearAll: () => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: [] };
    set({ cardsByGroup: newCardsByGroup });
    saveToStorage(newCardsByGroup);
  },
}));

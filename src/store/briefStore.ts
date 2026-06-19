import { create } from 'zustand';
import type { BriefCard, PeakCategory, CardStatus, ActivityLog, ArchivedBrief, ExportViewMode } from '@/types';

interface BriefState {
  cardsByGroup: Record<string, BriefCard[]>;
  activeGroupId: string | null;
  archivedBriefs: ArchivedBrief[];
  exportViewMode: ExportViewMode;
  setActiveGroup: (groupId: string) => void;
  getCards: () => BriefCard[];
  addCard: (peakEventId: string, category: PeakCategory) => void;
  removeCard: (cardId: string) => void;
  updateJudgement: (cardId: string, judgement: string) => void;
  updateAssignee: (cardId: string, assignee: string) => void;
  updateStatus: (cardId: string, status: CardStatus) => void;
  updateDueDate: (cardId: string, dueDate: string) => void;
  updateActionItem: (cardId: string, actionItem: string) => void;
  updateHostNotes: (cardId: string, hostNotes: string) => void;
  addActivity: (cardId: string, author: string, content: string, type: ActivityLog['type']) => void;
  removeActivity: (cardId: string, activityId: string) => void;
  reorderCards: (category: PeakCategory, fromIndex: number, toIndex: number) => void;
  getCardsByCategory: (category: PeakCategory) => BriefCard[];
  hasPeak: (peakEventId: string) => boolean;
  clearAll: () => void;
  archiveCurrentBrief: (groupId: string, groupName: string, date: string, title?: string) => ArchivedBrief;
  getArchivedBriefs: (groupId?: string) => ArchivedBrief[];
  getArchivedBriefById: (id: string) => ArchivedBrief | undefined;
  deleteArchivedBrief: (id: string) => void;
  setExportViewMode: (mode: ExportViewMode) => void;
  updateLastUpdated: (cardId: string, author: string) => void;
}

const STORAGE_KEY = 'brief-cards-by-group';
const ARCHIVE_KEY = 'brief-archive';
const VIEW_MODE_KEY = 'brief-export-view-mode';

const loadCardsFromStorage = (): Record<string, BriefCard[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveCardsToStorage = (cardsByGroup: Record<string, BriefCard[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cardsByGroup));
  } catch {
    // ignore
  }
};

const loadArchiveFromStorage = (): ArchivedBrief[] => {
  try {
    const stored = localStorage.getItem(ARCHIVE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveArchiveToStorage = (archive: ArchivedBrief[]) => {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  } catch {
    // ignore
  }
};

const loadViewModeFromStorage = (): ExportViewMode => {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY);
    return (stored as ExportViewMode) || 'screen';
  } catch {
    return 'screen';
  }
};

const saveViewModeToStorage = (mode: ExportViewMode) => {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch {
    // ignore
  }
};

export const useBriefStore = create<BriefState>((set, get) => ({
  cardsByGroup: loadCardsFromStorage(),
  activeGroupId: null,
  archivedBriefs: loadArchiveFromStorage(),
  exportViewMode: loadViewModeFromStorage(),

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
      activities: [],
      hostNotes: '',
    };

    const newCards = [...cards, newCard];
    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
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
    saveCardsToStorage(newCardsByGroup);
  },

  updateJudgement: (cardId: string, judgement: string) => {
    const { activeGroupId, cardsByGroup, updateLastUpdated } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, judgement } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
    updateLastUpdated(cardId, '编辑者');
  },

  updateAssignee: (cardId: string, assignee: string) => {
    const { activeGroupId, cardsByGroup, updateLastUpdated } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, assignee } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
    updateLastUpdated(cardId, assignee || '编辑者');
  },

  updateStatus: (cardId: string, status: CardStatus) => {
    const { activeGroupId, cardsByGroup, updateLastUpdated } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, status } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
  },

  updateDueDate: (cardId: string, dueDate: string) => {
    const { activeGroupId, cardsByGroup, updateLastUpdated } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, dueDate } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
  },

  updateActionItem: (cardId: string, actionItem: string) => {
    const { activeGroupId, cardsByGroup, updateLastUpdated } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, actionItem } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
  },

  updateHostNotes: (cardId: string, hostNotes: string) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, hostNotes } : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
  },

  addActivity: (cardId: string, author: string, content: string, type: ActivityLog['type']) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newActivity: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString(),
      author,
      content,
      type,
    };

    const newCards = cards.map(c => {
      if (c.id !== cardId) return c;
      const activities = [...(c.activities || []), newActivity];
      return {
        ...c,
        activities,
        lastUpdatedBy: author,
        lastUpdatedAt: newActivity.timestamp,
      };
    });

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
  },

  removeActivity: (cardId: string, activityId: string) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c => {
      if (c.id !== cardId) return c;
      return {
        ...c,
        activities: (c.activities || []).filter(a => a.id !== activityId),
      };
    });

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
  },

  updateLastUpdated: (cardId: string, author: string) => {
    const { activeGroupId, cardsByGroup } = get();
    if (!activeGroupId) return;

    const cards = cardsByGroup[activeGroupId] || [];
    const newCards = cards.map(c =>
      c.id === cardId
        ? { ...c, lastUpdatedBy: author, lastUpdatedAt: new Date().toISOString() }
        : c
    );

    const newCardsByGroup = { ...cardsByGroup, [activeGroupId]: newCards };
    set({ cardsByGroup: newCardsByGroup });
    saveCardsToStorage(newCardsByGroup);
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
    saveCardsToStorage(newCardsByGroup);
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
    saveCardsToStorage(newCardsByGroup);
  },

  archiveCurrentBrief: (groupId: string, groupName: string, date: string, title?: string): ArchivedBrief => {
    const { cardsByGroup, archivedBriefs } = get();
    const cards = cardsByGroup[groupId] || [];

    const archived: ArchivedBrief = {
      id: `archive-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      groupId,
      groupName,
      date,
      createdAt: new Date().toISOString(),
      cards: JSON.parse(JSON.stringify(cards)),
      title: title || `${groupName} ${date} 晨会简报`,
    };

    const newArchive = [archived, ...archivedBriefs];
    set({ archivedBriefs: newArchive });
    saveArchiveToStorage(newArchive);
    return archived;
  },

  getArchivedBriefs: (groupId?: string): ArchivedBrief[] => {
    const { archivedBriefs } = get();
    if (!groupId) return archivedBriefs;
    return archivedBriefs.filter(a => a.groupId === groupId);
  },

  getArchivedBriefById: (id: string): ArchivedBrief | undefined => {
    return get().archivedBriefs.find(a => a.id === id);
  },

  deleteArchivedBrief: (id: string) => {
    const { archivedBriefs } = get();
    const newArchive = archivedBriefs.filter(a => a.id !== id);
    set({ archivedBriefs: newArchive });
    saveArchiveToStorage(newArchive);
  },

  setExportViewMode: (mode: ExportViewMode) => {
    set({ exportViewMode: mode });
    saveViewModeToStorage(mode);
  },
}));

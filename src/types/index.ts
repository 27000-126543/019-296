export interface BrandGroup {
  id: string;
  name: string;
  description: string;
  brands: Brand[];
}

export interface Brand {
  id: string;
  name: string;
  isSelf: boolean;
  color: string;
  logo?: string;
}

export interface SentimentData {
  id: string;
  brandId: string;
  date: string;
  totalMentions: number;
  positive: number;
  negative: number;
  neutral: number;
  dayOverDayChange?: number;
}

export interface PlatformData {
  id: string;
  brandId: string;
  date: string;
  weibo: number;
  wechat: number;
  douyin: number;
  xiaohongshu: number;
  news: number;
  forum: number;
}

export type PeakLevel = 'high' | 'medium' | 'low';
export type PeakCategory = 'brand' | 'competitor' | 'risk' | 'opportunity';
export type CardStatus = 'pending' | 'in-progress' | 'resolved' | 'monitoring';

export interface PeakEvent {
  id: string;
  brandId: string;
  title: string;
  time: string;
  mentionCount: number;
  level: PeakLevel;
  category: PeakCategory;
  summary: string;
  suggestedAction?: string;
  isRecommended?: boolean;
  recommendReason?: string;
  negativeRatio?: number;
  dayOverDayChange?: number;
}

export interface BriefCard {
  id: string;
  peakEventId: string;
  judgement: string;
  category: PeakCategory;
  sortOrder: number;
  assignee?: string;
  status?: CardStatus;
  dueDate?: string;
  actionItem?: string;
}

export type PlatformKey = 'weibo' | 'wechat' | 'douyin' | 'xiaohongshu' | 'news' | 'forum';

export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  weibo: '微博',
  wechat: '微信',
  douyin: '抖音',
  xiaohongshu: '小红书',
  news: '新闻',
  forum: '论坛',
};

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  pending: '待处理',
  'in-progress': '处理中',
  resolved: '已解决',
  monitoring: '观察中',
};

export const CARD_STATUS_COLORS: Record<CardStatus, string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  'in-progress': 'bg-blue-50 text-blue-600 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  monitoring: 'bg-amber-50 text-amber-600 border-amber-200',
};

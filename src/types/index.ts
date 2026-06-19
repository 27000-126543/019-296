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

export interface PeakEvent {
  id: string;
  brandId: string;
  title: string;
  time: string;
  mentionCount: number;
  level: PeakLevel;
  category: PeakCategory;
  summary: string;
}

export interface BriefCard {
  id: string;
  peakEventId: string;
  judgement: string;
  category: PeakCategory;
  sortOrder: number;
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

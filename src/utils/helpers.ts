export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return Math.round((value / total) * 100) + '%';
}

export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export function formatDateCN(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getLevelColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'sentiment-negative';
    case 'medium':
      return 'text-amber-600';
    case 'low':
      return 'sentiment-neutral';
  }
}

export function getLevelBgColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'medium':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'low':
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

export function getLevelLabel(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return '高风险';
    case 'medium':
      return '中风险';
    case 'low':
      return '低风险';
  }
}

export function getCategoryLabel(category: 'brand' | 'competitor' | 'risk' | 'opportunity'): string {
  switch (category) {
    case 'brand':
      return '品牌';
    case 'competitor':
      return '竞品';
    case 'risk':
      return '风险';
    case 'opportunity':
      return '机会';
  }
}

export function getCategoryColor(category: 'brand' | 'competitor' | 'risk' | 'opportunity'): string {
  switch (category) {
    case 'brand':
      return 'text-champagne-600 bg-champagne-50 border-champagne-200';
    case 'competitor':
      return 'text-navy-600 bg-navy-50 border-navy-200';
    case 'risk':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'opportunity':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  }
}

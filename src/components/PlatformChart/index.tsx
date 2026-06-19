import { BarChart3 } from 'lucide-react';
import { useBrandStore } from '@/store/brandStore';
import { useDataStore } from '@/store/dataStore';
import { PLATFORM_LABELS, type PlatformKey } from '@/types';
import { formatNumber } from '@/utils/helpers';

const PLATFORM_ICONS: Record<PlatformKey, string> = {
  weibo: '微',
  wechat: '信',
  douyin: '抖',
  xiaohongshu: '红',
  news: '新',
  forum: '论',
};

const PLATFORM_COLORS: Record<PlatformKey, string> = {
  weibo: '#e6162d',
  wechat: '#07c160',
  douyin: '#000000',
  xiaohongshu: '#ff2442',
  news: '#0066cc',
  forum: '#722ed1',
};

export default function PlatformChart() {
  const { getSelfBrand, getAllBrands } = useBrandStore();
  const { getPlatformByBrand } = useDataStore();
  const selfBrand = getSelfBrand();
  const brands = getAllBrands();

  const platforms: PlatformKey[] = ['weibo', 'wechat', 'douyin', 'xiaohongshu', 'news', 'forum'];

  const selfPlatformData = selfBrand ? getPlatformByBrand(selfBrand.id) : null;

  const totalByPlatform = platforms.map((platform) => {
    const total = brands.reduce((sum, brand) => {
      const data = getPlatformByBrand(brand.id);
      return sum + (data?.[platform] || 0);
    }, 0);
    return { platform, total };
  });

  const maxTotal = Math.max(...totalByPlatform.map((p) => p.total));

  return (
    <div className="card-base p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-champagne-500" />
          <h3 className="section-title">平台分布</h3>
        </div>
        <span className="data-label">全品牌总计</span>
      </div>

      <div className="space-y-3">
        {platforms.map((platform) => {
          const platformData = totalByPlatform.find((p) => p.platform === platform);
          const total = platformData?.total || 0;
          const percentage = (total / maxTotal) * 100;
          const selfValue = selfPlatformData?.[platform] || 0;

          return (
            <div key={platform} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                  >
                    {PLATFORM_ICONS[platform]}
                  </div>
                  <span className="text-sm text-navy-700">
                    {PLATFORM_LABELS[platform]}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold font-serif text-navy-800">
                    {formatNumber(total)}
                  </span>
                  {selfBrand && (
                    <span className="text-xs text-champagne-500 ml-2">
                      自家 {formatNumber(selfValue)}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative h-5 bg-gray-50 rounded overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-200 to-gray-300
                             transition-all duration-1000 ease-out rounded"
                  style={{ width: `${percentage}%` }}
                />

                {selfBrand && selfPlatformData && (
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-champagne-400 to-champagne-500
                               transition-all duration-1000 ease-out rounded"
                    style={{
                      width: `${(selfValue / maxTotal) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-300" />
            <span className="text-gray-500">行业总计</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-champagne-400" />
            <span className="text-gray-500">自家品牌</span>
          </div>
        </div>
      </div>
    </div>
  );
}

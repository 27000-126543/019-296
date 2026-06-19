import { useMemo } from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { useBrandStore } from '@/store/brandStore';
import { useDataStore } from '@/store/dataStore';
import { formatNumber } from '@/utils/helpers';

export default function VolumeRanking() {
  const { getAllBrands, getSelfBrand } = useBrandStore();
  const { getSentimentByBrand } = useDataStore();
  const brands = getAllBrands();
  const selfBrand = getSelfBrand();

  const rankedBrands = useMemo(() => {
    return brands
      .map((brand) => {
        const sentiment = getSentimentByBrand(brand.id);
        return {
          brand,
          totalMentions: sentiment?.totalMentions || 0,
          positive: sentiment?.positive || 0,
          negative: sentiment?.negative || 0,
        };
      })
      .sort((a, b) => b.totalMentions - a.totalMentions);
  }, [brands, getSentimentByBrand]);

  const maxMentions = rankedBrands[0]?.totalMentions || 1;

  return (
    <div className="card-base p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-champagne-500" />
          <h3 className="section-title">声量排名</h3>
        </div>
        <span className="data-label">昨日总提及</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1">
        {rankedBrands.map((item, index) => {
          const percentage = (item.totalMentions / maxMentions) * 100;
          const isSelf = item.brand.id === selfBrand?.id;

          return (
            <div key={item.brand.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center
                      ${index === 0 ? 'bg-champagne-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-white' :
                        index === 2 ? 'bg-amber-600/70 text-white' :
                        'bg-gray-100 text-gray-500'}`}
                  >
                    {index + 1}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.brand.color }}
                  />
                  <span className={`text-sm font-medium ${
                    isSelf ? 'text-champagne-600' : 'text-navy-700'
                  }`}>
                    {item.brand.name}
                    {isSelf && (
                      <span className="ml-2 text-[10px] bg-champagne-100 text-champagne-600
                                       px-1.5 py-0.5 rounded">
                        自家
                      </span>
                    )}
                  </span>
                </div>
                <span className={`text-sm font-semibold font-serif ${
                  isSelf ? 'text-champagne-600' : 'text-navy-800'
                }`}>
                  {formatNumber(item.totalMentions)}
                </span>
              </div>

              <div className="relative h-6 bg-gray-50 rounded overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded transition-all duration-1000 ease-out
                    ${isSelf
                      ? 'bg-gradient-to-r from-champagne-400 to-champagne-500'
                      : 'bg-gradient-to-r from-navy-300 to-navy-400'
                    }`}
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-[11px] text-white/80 font-medium">
                    正面 {Math.round((item.positive / item.totalMentions) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <TrendingUp className="w-3.5 h-3.5 text-champagne-500" />
          <span>较前日</span>
        </div>
        <span className="text-xs font-medium text-sentiment-positive">
          整体 ↑ 12.3%
        </span>
      </div>
    </div>
  );
}

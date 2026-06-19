import { useState } from 'react';
import { PieChart, ChevronDown } from 'lucide-react';
import { useBrandStore } from '@/store/brandStore';
import { useDataStore } from '@/store/dataStore';
import { formatPercent } from '@/utils/helpers';

export default function SentimentChart() {
  const { getAllBrands, getSelfBrand } = useBrandStore();
  const { getSentimentByBrand } = useDataStore();
  const brands = getAllBrands();
  const selfBrand = getSelfBrand();

  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(
    selfBrand?.id || null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);
  const sentiment = selectedBrand ? getSentimentByBrand(selectedBrand.id) : null;

  const positive = sentiment?.positive || 0;
  const negative = sentiment?.negative || 0;
  const neutral = sentiment?.neutral || 0;
  const total = positive + negative + neutral;

  const positivePct = total > 0 ? (positive / total) * 100 : 0;
  const negativePct = total > 0 ? (negative / total) * 100 : 0;
  const neutralPct = total > 0 ? (neutral / total) * 100 : 0;

  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  const positiveDash = (positivePct / 100) * circumference;
  const negativeDash = (negativePct / 100) * circumference;

  const negativeOffset = -positiveDash;
  const neutralOffset = -(positiveDash + negativeDash);

  const handleSelectBrand = (brandId: string) => {
    setSelectedBrandId(brandId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="card-base p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-champagne-500" />
          <h3 className="section-title">情感分析</h3>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100
                       rounded border border-gray-200 transition-colors"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: selectedBrand?.color }}
            />
            <span className="text-navy-700">{selectedBrand?.name}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform
              ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200
                            rounded shadow-lg z-20 overflow-hidden">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                    hover:bg-gray-50 transition-colors
                    ${brand.id === selectedBrandId ? 'bg-champagne-50 text-champagne-700' : 'text-navy-700'}`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: brand.color }}
                  />
                  <span>{brand.name}</span>
                  {brand.isSelf && (
                    <span className="text-[10px] text-champagne-500 ml-auto">自家</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="12"
            />

            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#2d9a5e"
              strokeWidth="12"
              strokeDasharray={`${positiveDash} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="butt"
              className="transition-all duration-1000 ease-out"
            />

            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#d94c4c"
              strokeWidth="12"
              strokeDasharray={`${negativeDash} ${circumference}`}
              strokeDashoffset={negativeOffset}
              strokeLinecap="butt"
              className="transition-all duration-1000 ease-out"
            />

            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="12"
              strokeDasharray={`1000 ${circumference}`}
              strokeDashoffset={neutralOffset}
              strokeLinecap="butt"
              className="transition-all duration-1000 ease-out"
              style={{ opacity: neutralPct / 100 }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-serif font-bold text-navy-800">
              {Math.round(positivePct)}%
            </span>
            <span className="text-xs text-gray-500">正面占比</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center p-2 rounded bg-emerald-50/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-sentiment-positive" />
            <span className="text-xs text-gray-600">正面</span>
          </div>
          <span className="text-base font-serif font-semibold text-sentiment-positive">
            {formatPercent(positive, total)}
          </span>
        </div>
        <div className="text-center p-2 rounded bg-red-50/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-sentiment-negative" />
            <span className="text-xs text-gray-600">负面</span>
          </div>
          <span className="text-base font-serif font-semibold text-sentiment-negative">
            {formatPercent(negative, total)}
          </span>
        </div>
        <div className="text-center p-2 rounded bg-gray-50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-sentiment-neutral" />
            <span className="text-xs text-gray-600">中性</span>
          </div>
          <span className="text-base font-serif font-semibold text-sentiment-neutral">
            {formatPercent(neutral, total)}
          </span>
        </div>
      </div>
    </div>
  );
}

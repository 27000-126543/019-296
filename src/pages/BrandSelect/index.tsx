import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { useBrandStore } from '@/store/brandStore';

export default function BrandSelect() {
  const navigate = useNavigate();
  const { brandGroups, setSelectedGroup } = useBrandStore();

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroup(groupId);
    navigate('/dashboard');
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-champagne-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <header className="relative z-10 px-12 py-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-champagne-400 to-champagne-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold text-white tracking-wider">
              声量简报
            </h1>
            <p className="text-xs text-white/50">Brand Voice Briefing</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/60">
            <span className="text-champagne-400 font-medium">{dateStr}</span>
            <span className="mx-2 text-white/30">|</span>
            昨日数据已更新
          </p>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="font-serif text-3xl font-semibold text-white mb-3 tracking-wide">
            选择品牌组
          </h2>
          <p className="text-white/60 text-sm">
            请选择您负责的品牌组，查看昨日竞品声量概览
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-5xl">
          {brandGroups.map((group, index) => (
            <button
              key={group.id}
              onClick={() => handleSelectGroup(group.id)}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6
                         hover:bg-white/10 hover:border-champagne-400/50 transition-all duration-300
                         text-left animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-champagne-400/0 to-transparent opacity-0
                              group-hover:opacity-10 transition-opacity duration-300 rounded-lg" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-navy-700/80 flex items-center justify-center mb-4
                                group-hover:bg-champagne-400/20 transition-colors duration-300">
                  <Building2 className="w-6 h-6 text-champagne-400" />
                </div>

                <h3 className="font-serif text-lg font-semibold text-white mb-2 group-hover:text-champagne-300
                               transition-colors duration-300">
                  {group.name}
                </h3>
                <p className="text-sm text-white/50 mb-4 line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/40" />
                    <span className="text-xs text-white/50">
                      {group.brands.length} 个品牌
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-champagne-400
                                           group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <div className="mt-4 flex -space-x-2">
                  {group.brands.slice(0, 5).map((brand) => (
                    <div
                      key={brand.id}
                      className="w-7 h-7 rounded-full border-2 border-navy-800 flex items-center justify-center
                                 text-[10px] font-medium text-white"
                      style={{ backgroundColor: brand.color }}
                      title={brand.name}
                    >
                      {brand.name.charAt(0)}
                    </div>
                  ))}
                  {group.brands.length > 5 && (
                    <div className="w-7 h-7 rounded-full border-2 border-navy-800 bg-navy-600
                                    flex items-center justify-center text-[10px] text-white/70">
                      +{group.brands.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="relative z-10 px-12 py-6 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-white/30">
          <span>© 2026 声量简报系统 · 公关晨会专用</span>
          <span>数据更新时间：今日 08:00</span>
        </div>
      </footer>
    </div>
  );
}

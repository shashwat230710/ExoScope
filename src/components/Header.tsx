import React from 'react';
import { Menu, X, Orbit, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: 'classify' | 'habitability' | 'explore';
  onSelectTab: (tab: 'classify' | 'habitability' | 'explore') => void;
  onQuickSample?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onQuickSample
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: 'classify' | 'habitability' | 'explore'; label: string }[] = [
    { id: 'classify', label: 'Classify' },
    { id: 'habitability', label: 'Habitability' },
    { id: 'explore', label: 'Explore & Catalog' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B1020]/90 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single brand wordmark */}
          <button
            onClick={() => onSelectTab('classify')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-lg p-1 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-400/15 border border-teal-400/30 flex items-center justify-center text-teal-300 group-hover:scale-105 transition-transform">
              <Orbit className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0">
              ExoScope
            </span>
          </button>

          {/* Zone 2: 3 clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-teal-300 font-semibold'
                      : 'text-[#8892B0] hover:text-[#E6EAF5]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {onQuickSample && (
              <button
                onClick={onQuickSample}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E6EAF5] bg-[#121A33] hover:bg-[#182346] border border-[#1E293B] hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                title="Load a random held-out test candidate"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Random Sample
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#8892B0] hover:text-white hover:bg-[#121A33] cursor-pointer"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-[#1E293B] bg-[#0B1020] space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentTab === item.id
                  ? 'bg-teal-950/40 text-teal-300'
                  : 'text-[#8892B0] hover:text-[#E6EAF5] hover:bg-[#121A33]'
              }`}
            >
              {item.label}
            </button>
          ))}
          {onQuickSample && (
            <button
              onClick={() => {
                onQuickSample();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-teal-300 hover:bg-teal-950/30 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Try Random Sample
            </button>
          )}
        </div>
      )}
    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { Theme, BackgroundTheme } from '../types';
import { THEMES, BACKGROUNDS } from '../services/theme';

interface AppearanceMenuProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentBackground: BackgroundTheme;
  onBackgroundChange: (bg: BackgroundTheme) => void;
  isDark: boolean;
}

export function AppearanceMenu({
  currentTheme,
  onThemeChange,
  currentBackground,
  onBackgroundChange,
  isDark
}: AppearanceMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-all backdrop-blur-md border ${
          isDark 
            ? 'text-slate-300 hover:text-white hover:bg-white/10 border-white/5' 
            : 'text-slate-500 hover:text-slate-900 hover:bg-white border-transparent shadow-sm'
        } ${isOpen ? 'bg-white/10 ring-2 ring-indigo-500/50' : ''}`}
        title="Appearance Settings"
      >
        <Palette size={20} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-xl border backdrop-blur-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200 ${
          isDark 
            ? 'bg-slate-900/90 border-white/10 text-white' 
            : 'bg-white/90 border-slate-200 text-slate-900'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">Appearance</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* COLOR THEME SECTION */}
          <div className="mb-6">
            <p className={`text-xs font-medium mb-3 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Accent Color</p>
            <div className="grid grid-cols-5 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme)}
                  className={`w-full aspect-square rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    currentTheme.id === theme.id ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white' : ''
                  }`}
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                  title={theme.name}
                >
                  {currentTheme.id === theme.id && <Check size={12} className="text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>

          {/* BACKGROUND SECTION */}
          <div>
            <p className={`text-xs font-medium mb-3 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Background</p>
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onBackgroundChange(bg)}
                  className={`relative p-2 rounded-lg text-left text-xs font-medium transition-all border ${
                    currentBackground.id === bg.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                      : isDark 
                        ? 'border-white/5 hover:bg-white/5 text-slate-300' 
                        : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`w-full h-8 rounded mb-2 ${bg.className} border border-black/5`}></div>
                  {bg.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

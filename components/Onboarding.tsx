import React, { useState } from 'react';
import { Theme, BackgroundTheme } from '../types';
import { THEMES, BACKGROUNDS, getThemeColor } from '../services/theme';
import { 
  ArrowRight, 
  LayoutDashboard, 
  ArrowLeft, 
  Check,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Sunrise,
  Settings2
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (name: string, theme: Theme, background: BackgroundTheme) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0]);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundTheme>(BACKGROUNDS[0]);

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      onComplete(name, selectedTheme, selectedBackground);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const Logo = () => (
    <img 
      src="https://static.wixstatic.com/media/756a6a_da52fb55ba344f6382055c1308c97eba~mv2.png" 
      alt="Logo" 
      className="h-16 w-16 object-contain mb-6 rounded-xl shadow-lg bg-white p-1"
    />
  );

  // --- ABSTRACT MOCK COMPONENTS (NO TEXT) ---
  
  const Skeleton = ({ w, h, rounded = "rounded", className = "", opacity="opacity-100" }: { w: string, h: string, rounded?: string, className?: string, opacity?: string }) => (
     <div className={`${w} ${h} ${rounded} ${className} ${opacity}`} />
  );

  const MockHeader = ({ bg }: { bg: BackgroundTheme }) => {
    const isDark = bg.isDark;
    const headerClasses = isDark 
      ? 'bg-slate-900/40 border-white/10' 
      : 'bg-white/50 border-slate-200/50';
    const fill = isDark ? 'bg-white' : 'bg-slate-900';

    return (
      <div className={`h-14 w-full flex items-center justify-between px-4 border-b ${headerClasses} mb-6 shrink-0`}>
         <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-md ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
            <Skeleton w="w-24" h="h-4" className={fill} opacity="opacity-20" />
         </div>
         <div className="flex items-center gap-2">
            <Skeleton w="w-16" h="h-6" rounded="rounded-full" className={fill} opacity="opacity-10" />
            <Skeleton w="w-8" h="h-8" rounded="rounded-md" className={fill} opacity="opacity-10" />
         </div>
      </div>
    );
  };

  const MockStatCard = ({ icon: Icon, colorClass, bgClass, isDark }: any) => {
     // Use darker glass background for dark mode so it isn't white
     const cardBg = isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100';
     const textFill = isDark ? 'bg-white' : 'bg-slate-900';

     return (
        <div className={`p-3 rounded-lg border shadow-sm flex items-center justify-between ${cardBg}`}>
          <div className="space-y-2">
             <Skeleton w="w-10" h="h-2" className={textFill} opacity="opacity-20" />
             <Skeleton w="w-14" h="h-5" className={textFill} opacity="opacity-40" />
          </div>
          <div className={`p-2 rounded-full ${bgClass} opacity-80`}>
             <Icon className={colorClass} size={16} />
          </div>
        </div>
     );
  };

  const MockChart = ({ theme, isDark }: { theme: Theme, isDark: boolean }) => {
    // Colors derived from theme ranges for variety
    const cardBg = isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100';
    const lineFill = isDark ? 'bg-white' : 'bg-slate-900';
    
    // Sample data to show color range
    const dataPoints = [0.4, 0.6, 0.2, 0.8, 0.55, 0.95, 0.7];

    return (
      <div className={`rounded-xl p-4 border shadow-sm ${cardBg} mb-6 flex flex-col justify-end h-36 relative overflow-hidden`}>
         {/* Title placeholder */}
         <div className="absolute top-4 left-4 right-4 flex justify-between">
            <Skeleton w="w-24" h="h-3" className={lineFill} opacity="opacity-30" />
            <Skeleton w="w-16" h="h-3" className={lineFill} opacity="opacity-10" />
         </div>

         {/* Chart Bars with Theme Colors */}
         <div className="flex items-end justify-between gap-2 h-20 relative z-10 px-1 mt-6">
            {dataPoints.map((h, i) => (
               <div 
                 key={i} 
                 className="w-full rounded-t-sm opacity-90 transition-all duration-500" 
                 style={{ 
                   height: `${h * 100}%`, 
                   backgroundColor: getThemeColor(h, theme) 
                 }}
               ></div>
            ))}
         </div>
         
         {/* Baseline */}
         <div className={`absolute bottom-0 left-0 w-full h-px ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}></div>
      </div>
    );
  };

  const MockContentCard = ({ score, theme, isDark }: { score: number, theme: Theme, isDark: boolean }) => {
    const mainColor = getThemeColor(score, theme);
    const cardBg = isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-100';
    const textFill = isDark ? 'bg-white' : 'bg-slate-900';
    
    // Abstract Top Border Color
    const topBorder = `3px solid ${mainColor}`;

    return (
      <div className={`rounded-lg shadow-sm border overflow-hidden flex flex-col relative ${cardBg}`} style={{ borderTop: topBorder }}>
         <div className="p-3 space-y-3">
            <div className="flex justify-between items-center">
               <Skeleton w="w-16" h="h-3" className={textFill} opacity="opacity-30" />
               <Skeleton w="w-12" h="h-4" rounded="rounded-full" className={textFill} opacity="opacity-10" />
            </div>
            
            <div className="flex items-end gap-2">
               {/* Colored Score Block */}
               <div className="h-6 w-10 rounded" style={{ backgroundColor: mainColor, opacity: 0.9 }}></div>
               <Skeleton w="w-4" h="h-4" className={textFill} opacity="opacity-20" />
            </div>

            {/* Progress Bar */}
            <div className={`w-full rounded-full h-1.5 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
               <div className="h-1.5 rounded-full" style={{ width: `${score * 100}%`, backgroundColor: mainColor }}></div>
            </div>
         </div>
      </div>
    );
  }

  // --- STYLING HELPERS ---
  const isBgDark = selectedBackground.isDark;

  // The modal wrapper now takes the background class to reflect selection on BOTH sides
  const modalWrapperClass = `w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500 z-10 border transition-all duration-700 ${selectedBackground.className} ${isBgDark ? 'border-white/20' : 'border-slate-800/20'}`;

  // Left panel is semi-transparent to show the background
  const leftPanelClass = `w-full md:w-1/3 border-r flex flex-col h-full backdrop-blur-xl transition-colors duration-700 ${
      isBgDark 
      ? 'bg-slate-950/80 border-white/10 text-slate-100' 
      : 'bg-white/90 border-slate-200 text-slate-900'
  }`;

  // Text utilities
  const textTitle = isBgDark ? 'text-white' : 'text-slate-900';
  const textSub = isBgDark ? 'text-slate-400' : 'text-slate-500';
  const backBtn = isBgDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600';
  const nextBtn = isBgDark 
      ? 'bg-white text-slate-900 hover:bg-slate-200 shadow-slate-900/20' 
      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10';

  const renderAbstractPreview = () => (
    // Note: Background class removed from here since it's now on the parent
    <div className="w-full md:w-2/3 relative overflow-hidden flex flex-col">
      
      {/* Mockup Header */}
      <MockHeader bg={selectedBackground} />

      {/* Mockup Body Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar relative z-10">
          
          {/* 1. Mock Welcome Card */}
          <div className={`rounded-xl p-6 border shadow-sm mb-6 flex justify-between items-center relative overflow-hidden ${selectedBackground.isDark ? 'bg-slate-900/40 border-white/10' : 'bg-white border-slate-100'}`}>
            <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedBackground.isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                       <Sunrise size={18} className={selectedBackground.isDark ? 'text-white/60' : 'text-slate-400'} />
                    </div>
                    <Skeleton w="w-48" h="h-6" className={selectedBackground.isDark ? 'bg-white' : 'bg-slate-900'} opacity="opacity-30" />
                </div>
                <Skeleton w="w-64" h="h-3" className={selectedBackground.isDark ? 'bg-white' : 'bg-slate-900'} opacity="opacity-20" />
            </div>
            <div className={`p-2 rounded-full border ${selectedBackground.isDark ? 'border-white/10 text-white/20' : 'border-slate-100 text-slate-200'}`}>
               <Settings2 size={16} />
            </div>
          </div>

          {/* 2. Mock Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MockStatCard icon={BarChart3} colorClass="text-blue-500" bgClass="bg-blue-500/10" isDark={selectedBackground.isDark} />
            <MockStatCard icon={CheckCircle} colorClass="text-emerald-500" bgClass="bg-emerald-500/10" isDark={selectedBackground.isDark} />
            <MockStatCard icon={AlertCircle} colorClass="text-rose-500" bgClass="bg-rose-500/10" isDark={selectedBackground.isDark} />
          </div>

          {/* 3. Mock Chart */}
          <MockChart theme={selectedTheme} isDark={selectedBackground.isDark} />

          {/* 4. Mock Department Grid */}
          <Skeleton w="w-32" h="h-4" className={`${selectedBackground.isDark ? 'bg-white' : 'bg-slate-900'} mb-4`} opacity="opacity-40" />
          
          <div className="grid grid-cols-2 gap-4">
            <MockContentCard score={0.92} theme={selectedTheme} isDark={selectedBackground.isDark} />
            <MockContentCard score={0.65} theme={selectedTheme} isDark={selectedBackground.isDark} />
            <MockContentCard score={0.45} theme={selectedTheme} isDark={selectedBackground.isDark} />
            <MockContentCard score={0.78} theme={selectedTheme} isDark={selectedBackground.isDark} />
          </div>

      </div>

      {/* Overlay Badge */}
      <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 shadow-lg pointer-events-none flex items-center gap-2">
          <LayoutDashboard size={12} /> Preview
      </div>
    </div>
  );

  // --- MAIN RENDER ---

  return (
    <div className="min-h-screen flex items-center justify-center p-0 font-sans relative overflow-hidden bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] right-[0%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full h-full absolute inset-0 flex items-center justify-center p-4">
        
        {/* STEP 1: WELCOME & NAME */}
        {step === 1 && (
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 z-10">
            <div className="flex justify-center"><Logo /></div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">ERP Tracker</h1>
            <p className="text-slate-500 mb-8 font-light">Welcome to your new implementation dashboard.</p>
            
            <div className="text-left mb-8">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">What should we call you?</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name..."
                className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold text-lg"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: THEME SELECTION (IMMERSIVE SPLIT MOCKUP) */}
        {step === 2 && (
          <div className={modalWrapperClass}>
            
            {/* LEFT: CONTROLS (Glassy) */}
            <div className={leftPanelClass}>
                <div className="p-6 pb-2 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handleBack} className={`flex items-center gap-1 text-sm font-medium transition-colors ${backBtn}`}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className={`text-xs font-bold uppercase tracking-wider ${isBgDark ? 'text-slate-500' : 'text-slate-400'}`}>Step 2 of 3</div>
                    </div>
                    <h2 className={`text-2xl font-bold mb-1 ${textTitle}`}>Pick a Color Theme</h2>
                    <p className={`text-sm ${textSub}`}>Select the color palette for your charts and metrics.</p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-3">
                    {THEMES.map(theme => {
                        const isSelected = selectedTheme.id === theme.id;
                        const btnClass = isSelected
                           ? (isBgDark ? 'bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500/50' : 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20')
                           : (isBgDark ? 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-blue-300');
                        
                        return (
                          <button
                              key={theme.id}
                              onClick={() => setSelectedTheme(theme)}
                              className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${btnClass}`}
                          >
                              <span className={`text-sm font-semibold ${isSelected ? (isBgDark ? 'text-white' : 'text-slate-800') : (isBgDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600')}`}>
                                  {theme.name}
                              </span>
                              <div className="flex gap-1">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.ranges[0].color }}></div>
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.ranges[2].color }}></div>
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.ranges[4].color }}></div>
                              </div>
                          </button>
                        );
                    })}
                </div>

                <div className={`p-6 border-t shrink-0 ${isBgDark ? 'border-white/10' : 'border-slate-200 bg-white/50'}`}>
                     <button
                        onClick={handleNext}
                        className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 ${nextBtn}`}
                    >
                        Next: Background <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* RIGHT: ABSTRACT PREVIEW (NO TEXT) */}
            {renderAbstractPreview()}

          </div>
        )}

        {/* STEP 3: BACKGROUND SELECTION (IMMERSIVE SPLIT MOCKUP) */}
        {step === 3 && (
          <div className={modalWrapperClass}>
            
            {/* LEFT: CONTROLS (Glassy) */}
            <div className={leftPanelClass}>
                <div className="p-6 pb-2 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handleBack} className={`flex items-center gap-1 text-sm font-medium transition-colors ${backBtn}`}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className={`text-xs font-bold uppercase tracking-wider ${isBgDark ? 'text-slate-500' : 'text-slate-400'}`}>Step 3 of 3</div>
                    </div>
                    <h2 className={`text-2xl font-bold mb-1 ${textTitle}`}>Set the Mood</h2>
                    <p className={`text-sm ${textSub}`}>Choose a background style for your dashboard.</p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                        {BACKGROUNDS.map(bg => {
                            const isSelected = selectedBackground.id === bg.id;
                            const cardClass = isSelected
                                ? (isBgDark ? 'border-blue-500 ring-2 ring-blue-500/50 scale-[1.02]' : 'border-blue-500 ring-2 ring-blue-500/20 scale-[1.02]')
                                : (isBgDark ? 'border-white/10 hover:border-white/30 hover:scale-[1.02]' : 'border-slate-200 hover:border-blue-300 hover:scale-[1.02]');

                            return (
                                <button
                                    key={bg.id}
                                    onClick={() => setSelectedBackground(bg)}
                                    className={`relative group overflow-hidden rounded-xl border aspect-video transition-all text-left shadow-sm ${cardClass}`}
                                >
                                    <div className={`absolute inset-0 w-full h-full ${bg.className}`}></div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm z-10">
                                            <Check size={10} />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent">
                                        <span className="text-[10px] font-bold text-white shadow-sm">{bg.name}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={`p-6 border-t shrink-0 ${isBgDark ? 'border-white/10' : 'border-slate-200 bg-white/50'}`}>
                     <button
                        onClick={handleNext}
                        className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 ${nextBtn}`}
                    >
                        Finish Setup <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* RIGHT: ABSTRACT PREVIEW (NO TEXT) */}
            {renderAbstractPreview()}

          </div>
        )}

      </div>
    </div>
  );
};
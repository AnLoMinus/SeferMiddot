import React from 'react';
import { Book, Menu, X } from 'lucide-react';
import { Chapter } from '../types';

interface SidebarProps {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chapters, currentChapter, onSelectChapter, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-paper border-l border-gold/30 shadow-xl transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:shadow-none md:border-l-0 md:border-r
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gold/30 flex flex-col gap-2 bg-paper-dark">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-ink font-bold">תוכן העניינים</h2>
              <button onClick={onClose} className="md:hidden text-ink hover:text-gold-dark">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => (window as any).openChangelog()}
                  className="text-[10px] font-mono text-gold-dark bg-gold/10 px-2 py-0.5 rounded-full w-fit hover:bg-gold/20 transition-colors border border-gold/20"
                >
                  v0.1.0
                </button>
                <button 
                  onClick={() => (window as any).openAbout()}
                  className="text-[10px] font-sans text-ink bg-black/5 px-2 py-0.5 rounded-full w-fit hover:bg-black/10 transition-colors border border-black/10"
                >
                  אודות
                </button>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/20 text-gold-dark border border-gold/30">
                  סה״כ {chapters.filter(c => !c.isIntroduction).length} מידות • {chapters.reduce((acc, c) => acc + c.part1.length + c.part2.length, 0)} אמרות
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <nav className="space-y-1">
              {chapters.map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectChapter(chapter);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`
                    w-full text-right px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 relative overflow-hidden
                    ${chapter.isNewMida
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] text-purple-900 font-bold'
                      : currentChapter?.title === chapter.title 
                        ? 'bg-gold/20 text-gold-dark font-bold shadow-sm' 
                        : 'text-ink/80 hover:bg-gold/10 hover:text-ink'}
                  `}
                >
                  <Book size={16} className={chapter.isNewMida ? 'text-purple-600' : currentChapter?.title === chapter.title ? 'text-gold-dark' : 'text-gray-400'} />
                  <span className="font-serif text-lg">{chapter.title}</span>
                  {chapter.isNewMida && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-md">
                      חדש
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gold/30 bg-paper-dark text-center">
            <p className="text-xs text-gray-500 font-sans">רבי נחמן מברסלב</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
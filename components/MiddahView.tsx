import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chapter, Teaching, Highlight, ExpandedTeaching } from '../types';
import { Bookmark, Copy, Highlighter } from 'lucide-react';

interface MiddahViewProps {
  chapter: Chapter;
  bookmarks: string[];
  highlights: Highlight[];
  expandedTeachings?: ExpandedTeaching[];
  toggleBookmark: (id: string) => void;
  addHighlight: (teachingId: string, text: string) => void;
  removeHighlight: (id: string) => void;
}

const MiddahView: React.FC<MiddahViewProps> = ({ 
  chapter, 
  bookmarks, 
  highlights,
  expandedTeachings = [],
  toggleBookmark,
  addHighlight,
  removeHighlight
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ text: string, top: number, left: number, teachingId: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection(null);
        return;
      }

      const text = sel.toString().trim();
      if (text.length < 2) return;

      // Check if selection is inside a teaching card
      let node = sel.anchorNode;
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.parentNode;
      }
      const element = node as HTMLElement;
      const teachingCard = element?.closest('[data-teaching-id]');

      if (teachingCard) {
        const teachingId = teachingCard.getAttribute('data-teaching-id');
        if (teachingId) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          // Adjust for scrolling
          const top = rect.top + window.scrollY - 50;
          const left = rect.left + (rect.width / 2);

          setSelection({
            text,
            top,
            left,
            teachingId
          });
          return;
        }
      }
      setSelection(null);
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // Memoize highlights by teachingId for faster lookup
  const highlightsByTeachingId = useMemo(() => {
    const map: Record<string, Highlight[]> = {};
    highlights.forEach(h => {
      if (!map[h.teachingId]) map[h.teachingId] = [];
      map[h.teachingId].push(h);
    });
    return map;
  }, [highlights]);

  // Helper to highlight text
  const renderContentWithHighlights = (content: string, teachingId: string) => {
    const relevantHighlights = highlightsByTeachingId[teachingId];
    if (!relevantHighlights || relevantHighlights.length === 0) return content;

    // We sort by length descending to match longest phrases first
    const sortedHighlights = [...relevantHighlights].sort((a, b) => b.text.length - a.text.length);
    
    // Escape regex characters
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(${sortedHighlights.map(h => escapeRegExp(h.text)).join('|')})`, 'gi');
    
    const parts = content.split(pattern);

    return (
      <span>
        {parts.map((part, i) => {
          const highlight = sortedHighlights.find(h => h.text.toLowerCase() === part.toLowerCase());
          if (highlight) {
            return (
              <mark 
                key={i} 
                className="bg-gold/30 text-ink rounded px-0.5 cursor-pointer hover:bg-gold/50 transition-colors"
                title="לחץ להסרה"
                onClick={(e) => {
                  e.stopPropagation();
                  removeHighlight(highlight.id);
                }}
              >
                {part}
              </mark>
            );
          }
          return part;
        })}
      </span>
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const confirmHighlight = () => {
    if (selection) {
      addHighlight(selection.teachingId, selection.text);
      // Clear selection
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
      setSelection(null);
    }
  };

  const renderSection = (title: string | null, teachings: Teaching[]) => {
    if (!teachings || teachings.length === 0) return null;

    return (
      <div className="mb-12">
        {title && (
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gold/30 flex-1 max-w-xs"></div>
            <h3 className="mx-4 font-display text-2xl text-gold-dark font-bold">{title}</h3>
            <div className="h-px bg-gold/30 flex-1 max-w-xs"></div>
          </div>
        )}
        
        <div className="space-y-6">
          {teachings.map((teaching) => (
            <div 
              key={teaching.id} 
              id={teaching.id}
              data-teaching-id={teaching.id}
              className={`
                group relative bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-gold/30 transition-all duration-300
                ${bookmarks.includes(teaching.id) ? 'ring-1 ring-gold bg-amber-50/50' : ''}
              `}
            >
              <div className="flex gap-4">
                <span className="font-display text-2xl text-gold-dark w-8 shrink-0">{teaching.letter}.</span>
                <div className="flex-1">
                  <p className="font-serif text-xl leading-relaxed text-ink/90 select-text">
                    {renderContentWithHighlights(teaching.content, teaching.id)}
                  </p>
                  {teaching.author && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-px w-6 bg-gold/30"></div>
                      <span className="text-sm font-sans text-gold-dark/80 italic">
                        נכתב ע״י {teaching.author}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => toggleBookmark(teaching.id)}
                  className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${bookmarks.includes(teaching.id) ? 'text-gold' : 'text-gray-400'}`}
                  title={bookmarks.includes(teaching.id) ? "הסר סימניה" : "שמור סימניה"}
                >
                  <Bookmark size={18} fill={bookmarks.includes(teaching.id) ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => handleCopy(teaching.content, teaching.id)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-ink transition-colors relative"
                  title="העתק"
                >
                  {copyFeedback === teaching.id ? (
                    <span className="text-xs font-sans text-green-600 font-bold">הועתק!</span>
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-8 relative" ref={containerRef}>
      
      {/* Highlighting Popover */}
      {selection && (
        <div 
          className="fixed z-50 transform -translate-x-1/2 bg-ink text-paper px-4 py-2 rounded-full shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform animate-bounce"
          style={{ top: selection.top, left: selection.left }}
          onMouseDown={(e) => {
             e.preventDefault(); // Prevent losing selection before click
             confirmHighlight();
          }}
        >
          <Highlighter size={16} />
          <span className="font-sans font-bold text-sm">הדגש</span>
        </div>
      )}

      <header className="text-center mb-12 relative">
        {chapter.isNewMida && (
          <div className="inline-block mb-4 px-4 py-1 bg-purple-100 text-purple-800 rounded-full font-sans text-sm font-bold border border-purple-300 shadow-sm">
            ✨ מידה חדשה במאגר
          </div>
        )}
        <h1 className="font-display text-5xl md:text-6xl text-ink font-bold mb-4">{chapter.title}</h1>
        {!chapter.isIntroduction && (
          <div className={`w-24 h-1 mx-auto rounded-full ${chapter.isNewMida ? 'bg-purple-500' : 'bg-gold'}`}></div>
        )}
      </header>

      {chapter.isIntroduction ? (
        <article className="prose prose-xl prose-stone max-w-none font-serif leading-relaxed text-justify select-none">
           {chapter.part1.map(t => (
               <p key={t.id} className="whitespace-pre-line mb-6">{t.content}</p>
           ))}
        </article>
      ) : (
        <>
          {renderSection(chapter.hasParts ? 'חלק ראשון' : null, chapter.part1)}
          {renderSection(chapter.hasParts ? 'חלק שני' : null, chapter.part2)}

          {expandedTeachings.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-center mb-10">
                <div className="h-px bg-gold/50 flex-1 max-w-xs"></div>
                <div className="mx-6 flex flex-col items-center">
                  <h3 className="font-display text-3xl text-gold-dark font-bold">הרחבות וחידושים</h3>
                  <span className="text-sm font-sans text-gold-dark/60 mt-1">מאת לאון יעקובוב</span>
                </div>
                <div className="h-px bg-gold/50 flex-1 max-w-xs"></div>
              </div>

              <div className="space-y-8">
                {expandedTeachings.map((teaching, idx) => (
                  <div 
                    key={teaching.id || idx} 
                    className="bg-white/40 p-8 rounded-2xl border-2 border-gold/20 shadow-sm relative overflow-hidden group hover:border-gold/40 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <p className="font-serif text-2xl leading-relaxed text-ink/90 relative z-10 text-center">
                      {teaching.content}
                    </p>
                    <div className="mt-6 flex justify-center items-center gap-3">
                      <div className="h-px w-8 bg-gold/30"></div>
                      <span className="text-sm font-sans font-bold text-gold-dark uppercase tracking-widest">
                        {teaching.author}
                      </span>
                      <div className="h-px w-8 bg-gold/30"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MiddahView;
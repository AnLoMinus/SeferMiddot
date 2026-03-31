import React from 'react';
import { BookData, Chapter, Teaching, Highlight } from '../types';
import { Bookmark, Highlighter, ArrowLeft } from 'lucide-react';

interface BookmarksViewProps {
  data: BookData;
  bookmarks: string[];
  highlights: Highlight[];
  onNavigate: (chapter: Chapter, teachingId?: string) => void;
  onRemoveBookmark: (id: string) => void;
  onRemoveHighlight: (id: string) => void;
}

const BookmarksView: React.FC<BookmarksViewProps> = ({ 
  data, 
  bookmarks, 
  highlights, 
  onNavigate,
  onRemoveBookmark,
  onRemoveHighlight
}) => {
  
  // Helper to find teaching and chapter details
  const findTeachingDetails = (teachingId: string) => {
    for (const chapter of data.chapters) {
      const t1 = chapter.part1.find(t => t.id === teachingId);
      if (t1) return { chapter, teaching: t1, part: 'חלק ראשון' };
      const t2 = chapter.part2.find(t => t.id === teachingId);
      if (t2) return { chapter, teaching: t2, part: 'חלק שני' };
    }
    return null;
  };

  const savedTeachings = bookmarks
    .map(id => {
      const details = findTeachingDetails(id);
      if (!details) return null;
      return { id, ...details };
    })
    .filter(Boolean) as { id: string, chapter: Chapter, teaching: Teaching, part: string }[];

  const savedHighlights = highlights
    .map(h => {
      const details = findTeachingDetails(h.teachingId);
      if (!details) return null;
      return { highlight: h, ...details };
    })
    .filter(Boolean) as { highlight: Highlight, chapter: Chapter, teaching: Teaching, part: string }[];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="font-display text-4xl text-ink font-bold mb-8 text-center">השמירות שלי</h1>

      <div className="space-y-12">
        {/* Bookmarks Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-gold/30 pb-2">
            <Bookmark className="text-gold-dark" size={24} />
            <h2 className="font-serif text-2xl text-ink font-bold">סימניות ({savedTeachings.length})</h2>
          </div>

          {savedTeachings.length === 0 ? (
            <p className="text-gray-500 font-sans">אין סימניות שמורות.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedTeachings.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-transparent hover:border-gold/30 transition-all group relative"
                >
                  <div 
                    onClick={() => onNavigate(item.chapter, item.teaching.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-display text-xl font-bold text-ink">{item.chapter.title}</h3>
                        <span className="text-xs font-sans text-gray-400">{item.part} • אות {item.teaching.letter}</span>
                      </div>
                    </div>
                    <p className="font-serif text-lg text-gray-700 line-clamp-3">
                      {item.teaching.content}
                    </p>
                    {item.teaching.author && (
                      <div className="mt-2 text-xs font-sans text-gold-dark/80 italic">
                        נכתב ע״י {item.teaching.author}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(item.id);
                    }}
                    className="absolute top-4 left-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="הסר סימניה"
                  >
                    <Bookmark size={18} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Highlights Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-gold/30 pb-2">
            <Highlighter className="text-gold-dark" size={24} />
            <h2 className="font-serif text-2xl text-ink font-bold">הדגשות ({savedHighlights.length})</h2>
          </div>

          {savedHighlights.length === 0 ? (
            <p className="text-gray-500 font-sans">אין הדגשות שמורות.</p>
          ) : (
            <div className="space-y-4">
              {savedHighlights.map((item) => (
                <div 
                  key={item.highlight.id}
                  className="bg-amber-50/50 p-4 rounded-lg border-r-4 border-gold relative group"
                >
                  <div 
                    onClick={() => onNavigate(item.chapter, item.teaching.id)}
                    className="cursor-pointer"
                  >
                    <div className="mb-2 flex justify-between">
                       <span className="font-display text-lg text-ink/80">{item.chapter.title}</span>
                       <span className="text-xs font-sans text-gray-400">{new Date(item.highlight.date).toLocaleDateString('he-IL')}</span>
                    </div>
                    <p className="font-serif text-xl text-ink leading-relaxed">
                      "...<mark className="bg-gold/30 text-ink rounded px-1">{item.highlight.text}</mark>..."
                    </p>
                  </div>
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveHighlight(item.highlight.id);
                    }}
                    className="absolute top-2 left-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white/80 rounded-full shadow-sm"
                    title="מחק הדגשה"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// Helper icon
const XIcon = ({ size = 24 }: { size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default BookmarksView;
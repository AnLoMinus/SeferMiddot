import React, { useState, useMemo } from 'react';
import { BookData, Chapter } from '../types';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  data: BookData;
  onNavigate: (chapter: Chapter, teachingId: string) => void;
}

const Search: React.FC<SearchProps> = ({ data, onNavigate }) => {
  const [query, setQuery] = useState('');

  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    
    // Normalize query for search (optional: handle niqqud if text had it, but here text is plain)
    const normalizedQuery = query.trim();
    const res: { chapter: Chapter, content: string, part: string, id: string, author?: string }[] = [];
    
    data.chapters.forEach(chapter => {
      // Search in title
      if (chapter.title.includes(normalizedQuery)) {
        res.push({ 
            chapter, 
            content: `פרק: ${chapter.title}`, 
            part: 'כותרת', 
            id: `title-${chapter.title}` 
        });
      }

      // Search in Part 1
      chapter.part1.forEach(t => {
        if (t.content.includes(normalizedQuery)) {
          res.push({ chapter, content: t.content, part: 'חלק ראשון', id: t.id, author: t.author });
        }
      });

      // Search in Part 2
      chapter.part2.forEach(t => {
        if (t.content.includes(normalizedQuery)) {
          res.push({ chapter, content: t.content, part: 'חלק שני', id: t.id, author: t.author });
        }
      });
    });

    return res;
  }, [query, data]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    
    // Use Regex for case-insensitive (though Hebrew is single case) global match
    const escapedHighlight = escapeRegExp(highlight);
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-gold/40 font-bold px-0.5 rounded text-ink">{part}</span>
          ) : part
        )}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפש נושא, מילה או משפט..."
          className="w-full p-4 pr-12 rounded-xl border-2 border-gold/30 focus:border-gold outline-none font-sans text-lg shadow-sm bg-white"
          autoFocus
        />
        <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
      </div>

      <div className="space-y-4">
        {query.length > 1 && results.length === 0 && (
          <p className="text-center text-gray-500 font-sans mt-8">לא נמצאו תוצאות עבור "{query}"</p>
        )}

        {results.map((result) => (
          <div 
            key={result.id}
            onClick={() => onNavigate(result.chapter, result.id)}
            className="bg-white p-4 rounded-lg shadow-sm border border-transparent hover:border-gold/30 cursor-pointer transition-all hover:bg-amber-50/30"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display text-xl font-bold text-ink">{result.chapter.title}</h3>
              <span className="text-xs font-sans text-gold-dark bg-gold/10 px-2 py-1 rounded-full">
                {result.part}
              </span>
            </div>
            <p className="font-serif text-lg text-gray-700 leading-relaxed truncate">
              {highlightText(result.content, query)}
            </p>
            {result.author && (
              <div className="mt-2 text-xs font-sans text-gold-dark/80 italic">
                נכתב ע״י {result.author}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
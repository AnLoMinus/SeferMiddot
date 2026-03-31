import React, { useMemo } from 'react';
import { BookData, Teaching } from '../types';
import { Sparkles, BookOpen } from 'lucide-react';

interface WelcomeProps {
  data: BookData;
  onStart: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ data, onStart }) => {
  
  const randomTeaching = useMemo(() => {
    const allTeachings: { t: Teaching, title: string }[] = [];
    data.chapters.forEach(c => {
      if (c.isIntroduction) return;
      c.part1.forEach(t => allTeachings.push({ t, title: c.title }));
      c.part2.forEach(t => allTeachings.push({ t, title: c.title }));
    });
    
    if (allTeachings.length === 0) return null;
    return allTeachings[Math.floor(Math.random() * allTeachings.length)];
  }, [data]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
      <div className="mb-8 text-gold-dark animate-pulse">
        <BookOpen size={64} strokeWidth={1} />
      </div>
      
      <h1 className="font-display text-6xl md:text-8xl text-ink mb-2">ספר המידות</h1>
      <h2 className="font-serif text-2xl text-gray-500 mb-4">רבי נחמן מברסלב</h2>
      
      <div className="mb-12">
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-gold/10 text-gold-dark border border-gold/30 shadow-sm">
          סה״כ {data.chapters.filter(c => !c.isIntroduction).length} מידות • {data.chapters.reduce((acc, c) => acc + c.part1.length + c.part2.length, 0)} אמרות
        </span>
      </div>

      {randomTeaching && (
        <div className="max-w-2xl bg-white p-8 rounded-xl shadow-lg border-t-4 border-gold mb-12 transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center gap-2 mb-4 text-gold">
            <Sparkles size={16} />
            <span className="font-sans text-sm font-bold tracking-wider">אמרה יומית</span>
            <Sparkles size={16} />
          </div>
          <blockquote className="font-serif text-2xl text-ink/90 leading-relaxed mb-6">
            "{randomTeaching.t.content}"
          </blockquote>
          <cite className="font-display text-xl text-gray-500 not-italic flex flex-col items-center gap-1">
            <span>{randomTeaching.title}</span>
            {randomTeaching.t.author && (
              <span className="text-sm font-sans text-gold-dark/80 italic">
                נכתב ע״י {randomTeaching.t.author}
              </span>
            )}
          </cite>
        </div>
      )}

      <button
        onClick={onStart}
        className="bg-ink text-paper px-8 py-3 rounded-full font-sans font-bold text-lg hover:bg-gold-dark hover:text-white transition-all duration-300 shadow-md hover:shadow-xl flex items-center gap-2"
      >
        <BookOpen size={20} />
        התחל ללמוד
      </button>
    </div>
  );
};

export default Welcome;
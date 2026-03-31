import React, { useState, useEffect } from 'react';
import { BookData, Chapter, Teaching } from '../types';
import { Shuffle, ArrowRight, Quote } from 'lucide-react';

interface RandomViewProps {
  data: BookData;
  onNavigate: (chapter: Chapter, teachingId: string) => void;
}

const RandomView: React.FC<RandomViewProps> = ({ data, onNavigate }) => {
  const [randomItem, setRandomItem] = useState<{ chapter: Chapter, teaching: Teaching, part: string } | null>(null);

  const pickRandom = () => {
    const allItems: { chapter: Chapter, teaching: Teaching, part: string }[] = [];
    
    data.chapters.forEach(chapter => {
      if (chapter.isIntroduction) return;
      chapter.part1.forEach(t => allItems.push({ chapter, teaching: t, part: 'חלק ראשון' }));
      chapter.part2.forEach(t => allItems.push({ chapter, teaching: t, part: 'חלק שני' }));
    });

    if (allItems.length > 0) {
      const rand = allItems[Math.floor(Math.random() * allItems.length)];
      setRandomItem(rand);
    }
  };

  useEffect(() => {
    pickRandom();
  }, []); // Run once on mount

  if (!randomItem) return null;

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="text-gold-dark mb-6 animate-pulse">
        <Shuffle size={48} />
      </div>

      <h1 className="font-display text-4xl text-ink mb-2">לימוד אקראי</h1>
      <p className="font-sans text-gray-500 mb-12">השגחה פרטית בלימוד</p>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gold/20 w-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Quote size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <span className="bg-gold/10 text-gold-dark px-3 py-1 rounded-full text-sm font-sans font-bold">
               {randomItem.chapter.title}
             </span>
             <span className="text-gray-400 text-sm font-sans">
               {randomItem.part} • אות {randomItem.teaching.letter}
             </span>
          </div>

          <p className="font-serif text-3xl leading-relaxed text-ink/90 mb-8">
            "{randomItem.teaching.content}"
          </p>
          
          {randomItem.teaching.author && (
            <div className="mb-8 flex items-center gap-2">
              <div className="h-px w-6 bg-gold/30"></div>
              <span className="text-sm font-sans text-gold-dark/80 italic">
                נכתב ע״י {randomItem.teaching.author}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
             <button 
               onClick={() => onNavigate(randomItem.chapter, randomItem.teaching.id)}
               className="text-gray-500 hover:text-gold-dark font-sans text-sm flex items-center gap-1 transition-colors"
             >
               קרא בהקשר <ArrowRight size={16} className="rotate-180" />
             </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          // Small animation effect could go here
          pickRandom();
        }}
        className="mt-12 bg-ink text-paper px-8 py-3 rounded-full font-sans font-bold text-lg hover:bg-gold-dark hover:text-white transition-all duration-300 shadow-lg flex items-center gap-3"
      >
        <Shuffle size={20} />
        לימוד נוסף
      </button>
    </div>
  );
};

export default RandomView;
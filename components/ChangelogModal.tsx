import React, { useState, useEffect } from 'react';
import { X, History } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetch('/changelog.md')
        .then(res => res.text())
        .then(text => setContent(text))
        .catch(err => console.error("Failed to load changelog", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-bold text-ink mb-4 border-b-2 border-gold/30 pb-2">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold text-ink mt-6 mb-3">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold text-gold-dark mt-4 mb-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        const parts = line.substring(2).split('**');
        return (
          <li key={i} className="mr-6 list-disc text-gray-700 mb-1">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-ink">{part}</strong> : part)}
          </li>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-gray-700 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-paper w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gold/30">
        <div className="p-4 border-b border-gold/30 flex justify-between items-center bg-paper-dark">
          <div className="flex items-center gap-2">
            <History className="text-gold-dark" size={24} />
            <h2 className="font-display text-2xl font-bold text-ink">יומן אירועים ועדכונים</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 font-sans text-right" dir="rtl">
          {renderMarkdown(content)}
        </div>
        <div className="p-4 border-t border-gold/30 bg-paper-dark flex justify-center">
          <button 
            onClick={onClose}
            className="bg-ink text-paper px-8 py-2 rounded-full font-bold hover:bg-gold-dark transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;

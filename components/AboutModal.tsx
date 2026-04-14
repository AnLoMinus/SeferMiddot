import React from 'react';
import { X, Github, Linkedin, Facebook, Code, ExternalLink, Mail, Phone } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-paper rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gold/30">
        <div className="flex justify-between items-center p-4 border-b border-gold/20 bg-paper-dark">
          <h2 className="text-2xl font-display font-bold text-ink">אודות המערכת</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-ink hover:bg-black/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-ink">ספר המידות הדיגיטלי</h3>
            <p className="text-gray-600 text-sm">
              אפליקציה אינטראקטיבית ומתקדמת ללימוד, עיון וניהול מידות על פי "ספר המידות" של רבי נחמן מברסלב.
            </p>
          </div>

          <div className="bg-paper-dark p-4 rounded-xl border border-gold/20 space-y-4">
            <h4 className="font-bold text-ink text-lg border-b border-gold/20 pb-2">פיתוח ועיצוב</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-ink text-lg">לאון יעקובוב (AnLoMinus)</span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <a href="https://wa.me/972543285967" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors">
                  <Phone size={16} />
                  <span>054-328-5967 (WhatsApp)</span>
                </a>
                <a href="mailto:GlobalElite8200@gmail.com" className="flex items-center gap-2 text-gray-700 hover:text-gold-dark transition-colors">
                  <Mail size={16} />
                  <span>GlobalElite8200@gmail.com</span>
                </a>
                <a href="https://www.linkedin.com/in/anlominus/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </a>
                <a href="https://github.com/Anlominus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-ink transition-colors">
                  <Github size={16} />
                  <span>GitHub Profile</span>
                </a>
                <a href="https://github.com/AnLoMinus?tab=repositories" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-ink transition-colors">
                  <ExternalLink size={16} />
                  <span>GitHub Repositories</span>
                </a>
                <a href="https://www.facebook.com/AnlominusX" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-blue-500 transition-colors">
                  <Facebook size={16} />
                  <span>Facebook</span>
                </a>
                <a href="https://codepen.io/Anlominus" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-ink transition-colors">
                  <Code size={16} />
                  <span>CodePen</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gold/20">
            גרסה 0.1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;

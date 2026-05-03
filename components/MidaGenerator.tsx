import React, { useState } from 'react';
import { Download, Bot, Save } from 'lucide-react';
import { downloadAsMd } from '../src/lib/downloadUtils';

const MidaGenerator: React.FC = () => {
  // Algorithm State
  const [midaName, setMidaName] = useState('');
  const [neighborMida, setNeighborMida] = useState('');
  const [instructions, setInstructions] = useState('');
  const [algorithm, setAlgorithm] = useState('');

  // Likut State
  const [generatedContent, setGeneratedContent] = useState('');

  const generateAlgorithm = () => {
    const prompt = `**הנחיה ליצירת ערך חדש: "מידת ${midaName}" (על פי מתודולוגיית ספר המידות)**
עליך לפעול כחוקר תורני הבקיא בתנ"ך ובחז"ל, כדי לבנות פרק חדש בשם "מידת ${midaName}". עליך להציג את ${midaName} כמידה שיש לאחוז בה או לברוח ממנה (בהתאם לטבעה), תוך פירוט הנזק/התועלת שהיא גורמת לקומת האדם.

**עקרונות היצירה:**
1. **מבנה א"ב ומספור:** סדר את ההנהגות לפי אותיות (א, ב, ג...).
2. **שילוב "א"ב ישן" ו"א"ב חדש":** 
    - עבור כל אות, הבא משפט המבוסס על "חלק א'" – מקור גלוי (פסוק או מאמר חז"ל).
    - הוסף תובנה של "חלק ב'" – "השגות גבוהות ונוראות" המגלות את השורש הרוחני.
3. **סודות ספר היצירה:** התאם כל היגד לכוחה של האות לפי ספר היצירה.
4. **תפיסת "קומה שלימה":** נסח את המשפטים כך שכל אות תחשוף פגם/תיקון ב"איבר" אחר של המידה. 
5. **שימוש במידות שכנות:** ציין כיצד ניתן להיעזר במידות הקיימות בספר שהן "שכנות" למידת ${midaName} (למשל: ${neighborMida}).
6. **סגנון:** לשון קצרה, נחרצת ומעוררת.
7. **דגשים נוספים:** ${instructions}

**המטרה:** ליצור כלי שיעזור לאדם "לבקש ממי שהרחמים שלו..." ולהינצל/להתחזק במידה זו.`;

    setAlgorithm(prompt);
  };

  const generateLikut = async () => {
    // In a real scenario, this would call a Gemini API endpoint.
    // For now, we simulate the structure based on the algorithm.
    const mockContent = `# מידת ${midaName}

### א'
**חלק א' (א"ב ישן):** [כאן יבוא המקור הגלוי...]
**חלק ב' (א"ב חדש):** [כאן תבוא ההשגה הרוחנית...]
**ספר היצירה:** [חיבור לאות א'...]

### ב'
[וכך הלאה...]
`;
    setGeneratedContent(mockContent);
  };

  return (
    <div className="p-6 bg-paper min-h-screen text-ink" dir="rtl">
      <h1 className="text-3xl font-display font-bold mb-6">מפעל האלגוריתמים והליקוטים</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Algorithm Factory */}
        <div className="bg-paper-dark p-6 rounded-xl border border-gold/30">
          <h2 className="text-xl font-bold mb-4 font-display">מפעל האלגוריתמים</h2>
          <div className="space-y-4">
            <input type="text" placeholder="שם המידה" value={midaName} onChange={(e) => setMidaName(e.target.value)} className="w-full p-2 rounded bg-paper" />
            <input type="text" placeholder="מידה שכנה" value={neighborMida} onChange={(e) => setNeighborMida(e.target.value)} className="w-full p-2 rounded bg-paper" />
            <textarea placeholder="דגשים נוספים" value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full p-2 rounded bg-paper h-24" />
            <button onClick={generateAlgorithm} className="w-full bg-ink text-paper py-2 rounded font-bold hover:bg-gold-dark transition-colors">צור אלגוריתם</button>
            {algorithm && (
              <div className="mt-4 p-4 bg-paper rounded border border-gold/20 text-sm whitespace-pre-wrap">
                {algorithm}
                <button onClick={() => downloadAsMd(`${midaName}_algorithm`, algorithm)} className="mt-2 flex items-center gap-2 text-gold-dark hover:underline">
                  <Download size={16} /> הורד כקובץ md
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Likut Factory */}
        <div className="bg-paper-dark p-6 rounded-xl border border-gold/30">
          <h2 className="text-xl font-bold mb-4 font-display">מפעל הליקוטים</h2>
          <div className="space-y-4">
            <textarea placeholder="הדבק כאן את האלגוריתם שנוצר..." className="w-full p-2 rounded bg-paper h-32" />
            <button onClick={generateLikut} className="w-full bg-gold-dark text-paper py-2 rounded font-bold hover:bg-gold transition-colors flex items-center justify-center gap-2">
              <Bot size={20} /> צור ליקוט
            </button>
            {generatedContent && (
              <div className="mt-4 p-4 bg-paper rounded border border-gold/20 text-sm whitespace-pre-wrap">
                {generatedContent}
                <button onClick={() => downloadAsMd(midaName, generatedContent)} className="mt-2 flex items-center gap-2 text-gold-dark hover:underline">
                  <Save size={16} /> הורד ליקוט לתיקיית new_midot
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidaGenerator;

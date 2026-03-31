import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, History, Plus, MessageSquare, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { BookData, ChatMessage, ChatHistory } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';

interface ChatViewProps {
  data: BookData;
}

const ChatView: React.FC<ChatViewProps> = ({ data }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const histories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatHistory));
      setChatHistories(histories);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'chats'));

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !auth.currentUser) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const systemInstruction = `אתה עוזר חכם המבוסס על ספר המידות של רבי נחמן מברסלב. 
        השתמש במידע הבא כדי לענות על שאלות המשתמש: ${JSON.stringify(data.chapters.map(c => ({ title: c.title, content: c.part1.map(t => t.content).join(' ') })))}
        ענה תמיד בעברית, בצורה מכובדת ומעמיקה. אם המידע לא נמצא בספר, ציין זאת אך נסה להביא תובנות ברוח רבי נחמן.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: newMessages.map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model', 
          parts: [{ text: m.content }] 
        })),
        config: {
          systemInstruction
        }
      });

      const aiMessage: ChatMessage = {
        role: 'model',
        content: response.text || "מצטער, לא הצלחתי לעבד את התשובה.",
        timestamp: Date.now()
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      // Save to Firestore
      if (currentChatId) {
        await updateDoc(doc(db, 'chats', currentChatId), {
          messages: finalMessages,
          lastUpdated: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, 'chats'), {
          userId: auth.currentUser.uid,
          title: input.substring(0, 30) + '...',
          messages: finalMessages,
          createdAt: serverTimestamp()
        });
        setCurrentChatId(docRef.id);
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', content: "אירעה שגיאה בתקשורת עם ה-AI.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const loadChat = (chat: ChatHistory) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
  };

  const deleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'chats', id));
      if (currentChatId === id) startNewChat();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `chats/${id}`);
    }
  };

  return (
    <div className="flex h-full bg-paper overflow-hidden">
      {/* Chat History Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-l border-gold/30 bg-paper-dark">
        <div className="p-4 border-b border-gold/30">
          <button 
            onClick={startNewChat}
            className="w-full py-2 bg-gold/20 text-gold-dark rounded-lg font-bold hover:bg-gold/30 transition-colors flex items-center justify-center gap-2"
          >
            <History size={18} />
            שיחה חדשה
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatHistories.map(chat => (
            <div 
              key={chat.id}
              onClick={() => loadChat(chat)}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition-colors ${currentChatId === chat.id ? 'bg-gold/20 text-gold-dark' : 'hover:bg-black/5'}`}
            >
              <span className="truncate text-sm font-sans">{chat.title}</span>
              <button 
                onClick={(e) => deleteChat(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-paper">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Bot size={64} className="text-gold mb-4" />
              <h2 className="text-2xl font-display font-bold">שאל את רבי נחמן</h2>
              <p className="max-w-md mt-2">כאן תוכל לשאול שאלות על ספר המידות, לקבל תובנות וללמוד בצורה אינטראקטיבית.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-ink text-paper' : 'bg-gold/20 text-gold-dark'}`}>
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-right leading-relaxed ${m.role === 'user' ? 'bg-gold/10 text-ink rounded-tr-none' : 'bg-paper-dark text-ink rounded-tl-none border border-gold/20'}`}>
                <p className="font-serif text-lg whitespace-pre-wrap">{m.content}</p>
                <span className="text-[10px] opacity-40 mt-2 block">{new Date(m.timestamp).toLocaleTimeString('he-IL')}</span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center animate-pulse">
                <Bot size={20} />
              </div>
              <div className="bg-paper-dark p-4 rounded-2xl rounded-tl-none border border-gold/20">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gold-dark rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gold-dark rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gold-dark rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gold/30 bg-paper-dark">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="שאל שאלה..."
              className="w-full p-4 pr-12 rounded-xl border border-gold/30 focus:border-gold outline-none font-sans text-lg shadow-sm bg-white resize-none min-h-[60px] max-h-[200px]"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${!input.trim() || isLoading ? 'text-gray-300' : 'bg-ink text-paper hover:bg-gold-dark'}`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2">ה-AI עשוי לטעות. מומלץ לעיין במקורות בספר.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;

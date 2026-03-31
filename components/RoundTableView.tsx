import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, MessageCircle, User as UserIcon } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { DiscussionMessage } from '../types';

const RoundTableView: React.FC = () => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'discussions'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscussionMessage));
      setMessages(msgs);
      
      // Extract unique users for presence simulation
      const users = Array.from(new Set(msgs.map(m => m.userName)));
      setActiveUsers(users);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'discussions'));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !auth.currentUser) return;

    const messageData = {
      roomId: 'general',
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'משתמש אנונימי',
      message: input,
      timestamp: serverTimestamp()
    };

    setInput('');
    try {
      await addDoc(collection(db, 'discussions'), messageData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'discussions');
    }
  };

  return (
    <div className="flex h-full bg-paper overflow-hidden">
      {/* Active Users Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-l border-gold/30 bg-paper-dark">
        <div className="p-4 border-b border-gold/30 flex items-center gap-2">
          <Users className="text-gold-dark" size={20} />
          <h2 className="font-display text-xl font-bold text-ink">נוכחים בשולחן</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeUsers.map((user, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gold/5 border border-gold/10">
              <div className="w-8 h-8 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center">
                <UserIcon size={16} />
              </div>
              <span className="font-sans text-sm font-bold text-ink">{user}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full ml-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Discussion Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-paper">
        <div className="p-4 border-b border-gold/30 bg-paper-dark flex items-center gap-3">
          <MessageCircle className="text-gold-dark" size={24} />
          <div>
            <h2 className="font-display text-xl font-bold text-ink">שולחן הדיונים</h2>
            <p className="text-xs text-gray-500 font-sans">שיחה פתוחה בזמן אמת על ספר המידות</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
          {messages.map((m, i) => (
            <div key={m.id} className={`flex flex-col ${m.userId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-2">
                <span className="text-[10px] font-bold text-gold-dark">{m.userName}</span>
                <span className="text-[8px] text-gray-400">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString('he-IL') : ''}</span>
              </div>
              <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-right leading-relaxed ${m.userId === auth.currentUser?.uid ? 'bg-gold/10 text-ink rounded-tr-none' : 'bg-paper-dark text-ink rounded-tl-none border border-gold/20'}`}>
                <p className="font-sans text-base">{m.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gold/30 bg-paper-dark">
          <div className="max-w-4xl mx-auto relative flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="כתוב הודעה..."
              className="flex-1 p-3 pr-4 rounded-xl border border-gold/30 focus:border-gold outline-none font-sans text-base shadow-sm bg-white"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-3 rounded-xl transition-colors ${!input.trim() ? 'text-gray-300' : 'bg-ink text-paper hover:bg-gold-dark'}`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundTableView;

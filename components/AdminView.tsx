import React, { useState, useEffect } from 'react';
import { Users, History, MessageSquare, Shield, Search, Trash2, Eye, PlusCircle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, limit, addDoc } from 'firebase/firestore';
import { UserProfile, AdminLog, ChatHistory, ExpandedTeaching } from '../types';

const AdminView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [expandedTeachings, setExpandedTeachings] = useState<ExpandedTeaching[]>([]);
  const [newTeaching, setNewTeaching] = useState({ chapterTitle: '', content: '', author: 'לאון יעקובוב' });
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'chats' | 'expanded'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const usersUnsubscribe = onSnapshot(query(collection(db, 'users'), orderBy('lastActive', 'desc')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    const logsUnsubscribe = onSnapshot(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminLog)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'logs'));

    const chatsUnsubscribe = onSnapshot(query(collection(db, 'chats'), orderBy('createdAt', 'desc'), limit(100)), (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatHistory)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'chats'));

    const expandedUnsubscribe = onSnapshot(query(collection(db, 'expanded_teachings'), orderBy('createdAt', 'desc')), (snapshot) => {
      setExpandedTeachings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpandedTeaching)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expanded_teachings'));

    return () => {
      usersUnsubscribe();
      logsUnsubscribe();
      chatsUnsubscribe();
      expandedUnsubscribe();
    };
  }, []);

  const addExpandedTeaching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeaching.chapterTitle || !newTeaching.content) return;

    try {
      await addDoc(collection(db, 'expanded_teachings'), {
        ...newTeaching,
        createdAt: Date.now()
      });
      setNewTeaching({ ...newTeaching, content: '' });
      alert("החידוש נוסף בהצלחה!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'expanded_teachings');
    }
  };

  const deleteExpandedTeaching = async (id: string) => {
    if (window.confirm("האם למחוק חידוש זה?")) {
      try {
        await deleteDoc(doc(db, 'expanded_teachings', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `expanded_teachings/${id}`);
      }
    }
  };

  const deleteUser = async (uid: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק משתמש זה?")) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
      }
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.displayName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Shield className="text-gold-dark" size={48} />
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">ניהול מערכת</h1>
          <p className="text-gray-500 font-sans">צפייה במשתמשים, היסטוריה ופעילות המערכת</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gold/30 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-bold transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'border-b-2 border-gold text-gold-dark bg-gold/5' : 'text-gray-500 hover:text-ink'}`}
        >
          <Users size={18} />
          משתמשים ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-3 font-bold transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-b-2 border-gold text-gold-dark bg-gold/5' : 'text-gray-500 hover:text-ink'}`}
        >
          <History size={18} />
          יומן פעילות ({logs.length})
        </button>
        <button 
          onClick={() => setActiveTab('chats')}
          className={`px-6 py-3 font-bold transition-colors flex items-center gap-2 ${activeTab === 'chats' ? 'border-b-2 border-gold text-gold-dark bg-gold/5' : 'text-gray-500 hover:text-ink'}`}
        >
          <MessageSquare size={18} />
          שיחות AI ({chats.length})
        </button>
        <button 
          onClick={() => setActiveTab('expanded')}
          className={`px-6 py-3 font-bold transition-colors flex items-center gap-2 ${activeTab === 'expanded' ? 'border-b-2 border-gold text-gold-dark bg-gold/5' : 'text-gray-500 hover:text-ink'}`}
        >
          <PlusCircle size={18} />
          הרחבות ({expandedTeachings.length})
        </button>
      </div>

      {activeTab === 'expanded' && (
        <div className="space-y-6 mb-8">
          <form onSubmit={addExpandedTeaching} className="bg-white p-6 rounded-2xl border border-gold/30 shadow-sm">
            <h3 className="font-display text-xl font-bold mb-4 text-ink">הוספת חידוש חדש (לאון יעקובוב)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">שם הפרק (מדויק מהספר)</label>
                <input
                  type="text"
                  value={newTeaching.chapterTitle}
                  onChange={(e) => setNewTeaching({ ...newTeaching, chapterTitle: e.target.value })}
                  className="w-full bg-paper border border-gold/30 rounded-xl px-4 py-2 focus:border-gold outline-none font-sans"
                  placeholder="למשל: התבודדות"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">מחבר</label>
                <input
                  type="text"
                  value={newTeaching.author}
                  onChange={(e) => setNewTeaching({ ...newTeaching, author: e.target.value })}
                  className="w-full bg-paper border border-gold/30 rounded-xl px-4 py-2 focus:border-gold outline-none font-sans"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">תוכן החידוש (עם ניקוד)</label>
              <textarea
                value={newTeaching.content}
                onChange={(e) => setNewTeaching({ ...newTeaching, content: e.target.value })}
                className="w-full bg-paper border border-gold/30 rounded-xl px-4 py-2 h-32 focus:border-gold outline-none font-sans resize-none"
                placeholder="הכנס את התוכן כאן..."
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gold-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-gold transition-colors shadow-md flex items-center gap-2"
            >
              <PlusCircle size={20} />
              הוסף חידוש למאגר
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-gold/30 shadow-sm overflow-hidden">
            <div className="p-4 bg-paper-dark border-b border-gold/30 font-bold">חידושים קיימים</div>
            <div className="divide-y divide-gold/10">
              {expandedTeachings.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-sans">אין חידושים במאגר עדיין</div>
              ) : (
                expandedTeachings.map((teaching) => (
                  <div key={teaching.id} className="p-6 hover:bg-gold/5 transition-colors flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gold-dark bg-gold/10 px-3 py-1 rounded-full text-sm">{teaching.chapterTitle}</span>
                        <span className="text-xs text-gray-400 font-sans">{new Date(teaching.createdAt).toLocaleString('he-IL')}</span>
                      </div>
                      <p className="text-ink text-lg leading-relaxed mb-3">{teaching.content}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-sans">
                        <span className="font-bold">מאת:</span> {teaching.author}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteExpandedTeaching(teaching.id!)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="מחק חידוש"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {activeTab !== 'expanded' && (
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש לפי שם או אימייל..."
            className="w-full p-3 pr-10 rounded-xl border border-gold/30 focus:border-gold outline-none font-sans bg-white shadow-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gold/30 overflow-hidden">
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right font-sans">
              <thead className="bg-paper-dark border-b border-gold/30">
                <tr>
                  <th className="p-4">משתמש</th>
                  <th className="p-4">אימייל</th>
                  <th className="p-4">תפקיד</th>
                  <th className="p-4">פעילות אחרונה</th>
                  <th className="p-4 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.uid} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-gold/30" />
                      <span className="font-bold">{user.displayName}</span>
                    </td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(user.lastActive).toLocaleString('he-IL')}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => deleteUser(user.uid)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="מחק משתמש"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-4 space-y-4">
            {logs.map(log => (
              <div key={log.id} className="p-4 bg-paper-dark rounded-xl border border-gold/20 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-ink">{log.userEmail}</span>
                    <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold-dark rounded-full font-mono">{log.action}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{log.details}</p>
                </div>
                <span className="text-xs text-gray-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString('he-IL')}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {chats.map(chat => (
              <div key={chat.id} className="p-4 bg-paper-dark rounded-xl border border-gold/20 hover:border-gold transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-ink truncate flex-1">{chat.title}</h3>
                  <Eye className="text-gold-dark opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{chat.messages.length} הודעות</span>
                  <span>{new Date(chat.createdAt).toLocaleDateString('he-IL')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;

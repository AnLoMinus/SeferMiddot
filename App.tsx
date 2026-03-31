import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Search as SearchIcon, Home, Book, Bookmark as BookmarkIcon, Shuffle, LogIn, LogOut, MessageSquare, Shield, Users, History, Bot } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MiddahView from './components/MiddahView';
import Welcome from './components/Welcome';
import Search from './components/Search';
import BookmarksView from './components/BookmarksView';
import RandomView from './components/RandomView';
import ChatView from './components/ChatView';
import AdminView from './components/AdminView';
import RoundTableView from './components/RoundTableView';
import ChangelogModal from './components/ChangelogModal';
import { parseText } from './services/textParser';
import { BookData, Chapter, ViewMode, Highlight, UserProfile, ExpandedTeaching } from './types';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const App: React.FC = () => {
  const [data, setData] = useState<BookData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.HOME);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [expandedTeachings, setExpandedTeachings] = useState<ExpandedTeaching[]>([]);

  // Expose changelog toggle to window for Sidebar access
  useEffect(() => {
    (window as any).openChangelog = () => setIsChangelogOpen(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const parsedData = await parseText();
        setData(parsedData);
        
        const savedBookmarks = localStorage.getItem('seferBookmarks');
        if (savedBookmarks) {
          try {
            setBookmarks(JSON.parse(savedBookmarks));
          } catch (e) {
            console.error("Failed to parse bookmarks", e);
            localStorage.removeItem('seferBookmarks');
          }
        }
        const savedHighlights = localStorage.getItem('seferHighlights');
        if (savedHighlights) {
          try {
            setHighlights(JSON.parse(savedHighlights));
          } catch (e) {
            console.error("Failed to parse highlights", e);
            localStorage.removeItem('seferHighlights');
          }
        }
      } catch (err) {
        console.error("Critical error during app initialization", err);
        setError("אירעה שגיאה בטעינת הספר. אנא נסה לרענן את הדף.");
      }
    };
    init();

    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Sync user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        let profile: UserProfile;
        if (!userDoc.exists()) {
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'משתמש',
            photoURL: firebaseUser.photoURL || '',
            role: firebaseUser.email === 'quadcosmos@gmail.com' ? 'admin' : 'user',
            lastActive: Date.now()
          };
          await setDoc(userRef, { ...profile, lastActive: serverTimestamp() });
        } else {
          profile = { id: userDoc.id, ...userDoc.data() } as any;
          await setDoc(userRef, { lastActive: serverTimestamp() }, { merge: true });
        }
        setUserProfile(profile);

        // Log activity
        await setDoc(doc(collection(db, 'logs')), {
          userId: firebaseUser.uid,
          userEmail: firebaseUser.email,
          action: 'LOGIN',
          details: 'User logged in to the system',
          timestamp: Date.now()
        });
      } else {
        setUserProfile(null);
      }
    });

    // Listen to Expanded Teachings (Leon Yakobov additions)
    const unsubscribeExpanded = onSnapshot(query(collection(db, 'expanded_teachings'), orderBy('createdAt', 'asc')), (snapshot) => {
      setExpandedTeachings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpandedTeaching)));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeExpanded();
    };
  }, []);

  // Merge expanded teachings into the book data
  const enrichedData = useMemo(() => {
    if (!data) return null;
    const newData = { ...data, chapters: data.chapters.map(c => ({ ...c })) };
    
    expandedTeachings.forEach(et => {
      const chapter = newData.chapters.find(c => c.title === et.chapterTitle);
      if (chapter) {
        chapter.part1.push({
          id: `expanded-${et.id}`,
          letter: 'חידוש',
          content: et.content,
          author: et.author || 'לאון יעקובוב'
        });
      }
    });
    return newData;
  }, [data, expandedTeachings]);

  const toggleBookmark = (id: string) => {
    const newBookmarks = bookmarks.includes(id)
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    localStorage.setItem('seferBookmarks', JSON.stringify(newBookmarks));
  };

  const addHighlight = (teachingId: string, text: string) => {
    const newHighlight: Highlight = {
        id: Date.now().toString(),
        teachingId,
        text,
        date: Date.now()
    };
    const newHighlights = [...highlights, newHighlight];
    setHighlights(newHighlights);
    localStorage.setItem('seferHighlights', JSON.stringify(newHighlights));
  };

  const removeHighlight = (id: string) => {
    const newHighlights = highlights.filter(h => h.id !== id);
    setHighlights(newHighlights);
    localStorage.setItem('seferHighlights', JSON.stringify(newHighlights));
  };

  const handleChapterSelect = (chapter: Chapter, teachingId?: string) => {
    setCurrentChapter(chapter);
    setViewMode(ViewMode.READING);
    setSidebarOpen(false);
    
    if (teachingId) {
      setTimeout(() => {
        const el = document.getElementById(teachingId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const mainContent = useMemo(() => {
    if (error) return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-red-500 mb-4">
          <Menu size={48} />
        </div>
        <p className="font-display text-xl text-ink mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-ink text-paper px-6 py-2 rounded-full font-sans font-bold hover:bg-gold-dark transition-colors">רענן דף</button>
      </div>
    );

    if (!enrichedData) return (
      <div className="flex-1 flex items-center justify-center bg-paper h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="font-display text-xl text-ink">טוען את ספר המידות...</span>
        </div>
      </div>
    );

    switch (viewMode) {
      case ViewMode.HOME:
        return <Welcome data={enrichedData} onStart={() => setSidebarOpen(true)} />;
      case ViewMode.SEARCH:
        return <Search data={enrichedData} onNavigate={handleChapterSelect} />;
      case ViewMode.BOOKMARKS:
        return (
          <BookmarksView 
            data={enrichedData} 
            bookmarks={bookmarks} 
            highlights={highlights}
            onNavigate={handleChapterSelect} 
            onRemoveBookmark={(id) => toggleBookmark(id)}
            onRemoveHighlight={removeHighlight}
          />
        );
      case ViewMode.RANDOM:
          return <RandomView data={enrichedData} onNavigate={handleChapterSelect} />;
      case ViewMode.CHAT:
          return <ChatView data={enrichedData} />;
      case ViewMode.ADMIN:
          return <AdminView />;
      case ViewMode.ROUND_TABLE:
          return <RoundTableView />;
      case ViewMode.READING:
        if (currentChapter) {
          const chapterExpanded = expandedTeachings.filter(t => t.chapterTitle === currentChapter.title);
          return (
            <MiddahView 
              chapter={currentChapter} 
              bookmarks={bookmarks} 
              highlights={highlights}
              expandedTeachings={chapterExpanded}
              toggleBookmark={toggleBookmark} 
              addHighlight={addHighlight}
              removeHighlight={removeHighlight}
            />
          );
        }
        return <Welcome data={enrichedData} onStart={() => setSidebarOpen(true)} />;
      default:
        return null;
    }
  }, [viewMode, enrichedData, error, currentChapter, bookmarks, highlights]);

  return (
    <div className="flex h-screen bg-paper overflow-hidden" dir="rtl">
      {!enrichedData && !error ? (
        <div className="flex-1 flex items-center justify-center bg-paper">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <span className="font-display text-xl text-ink">טוען את ספר המידות...</span>
          </div>
        </div>
      ) : (
        <>
          {enrichedData && (
            <Sidebar 
              chapters={enrichedData.chapters}
              currentChapter={currentChapter}
              onSelectChapter={(c) => handleChapterSelect(c)}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 bg-paper-dark border-b border-gold/30 flex items-center justify-between px-4 md:px-8 shadow-sm z-30">
              <div className="flex items-center gap-3">
                {enrichedData && (
                  <button onClick={() => setSidebarOpen(true)} className="md:hidden text-ink hover:text-gold-dark p-2">
                    <Menu size={24} />
                  </button>
                )}
                <span className="font-display text-2xl font-bold text-ink hidden md:block">ספר המידות</span>
              </div>

              {enrichedData && (
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                  <button onClick={() => setViewMode(ViewMode.HOME)} className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.HOME ? 'text-gold-dark bg-gold/10' : 'text-gray-500 hover:bg-black/5'}`} title="דף הבית"><Home size={20} /></button>
                  <button onClick={() => setViewMode(ViewMode.SEARCH)} className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.SEARCH ? 'text-gold-dark bg-gold/10' : 'text-gray-500 hover:bg-black/5'}`} title="חיפוש"><SearchIcon size={20} /></button>
                  <button onClick={() => setViewMode(ViewMode.BOOKMARKS)} className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.BOOKMARKS ? 'text-gold-dark bg-gold/10' : 'text-gray-500 hover:bg-black/5'}`} title="סימניות והדגשות"><BookmarkIcon size={20} /></button>
                  <button onClick={() => setViewMode(ViewMode.RANDOM)} className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.RANDOM ? 'text-gold-dark bg-gold/10' : 'text-gray-500 hover:bg-black/5'}`} title="לימוד אקראי"><Shuffle size={20} /></button>
                  
                  {user && (
                    <>
                      <button onClick={() => setViewMode(ViewMode.CHAT)} className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.CHAT ? 'text-gold-dark bg-gold/10' : 'text-gray-500 hover:bg-black/5'}`} title="שאל את רבי נחמן"><Bot size={20} /></button>
                      <button onClick={() => setViewMode(ViewMode.ROUND_TABLE)} className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.ROUND_TABLE ? 'text-gold-dark bg-gold/10' : 'text-gray-500 hover:bg-black/5'}`} title="שולחן הדיונים"><Users size={20} /></button>
                    </>
                  )}

                  {userProfile?.role === 'admin' && (
                    <button onClick={() => setViewMode(ViewMode.ADMIN)} className={`p-2 rounded-full transition-colors ${viewMode === ViewMode.ADMIN ? 'text-gold-dark bg-gold/10' : 'text-gray-500 hover:bg-black/5'}`} title="ניהול מערכת"><Shield size={20} /></button>
                  )}

                  <div className="h-6 w-px bg-gold/30 mx-1" />

                  {user ? (
                    <div className="flex items-center gap-2">
                      <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gold/30 hidden sm:block" />
                      <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="התנתק"><LogOut size={20} /></button>
                    </div>
                  ) : (
                    <button onClick={signInWithGoogle} className="flex items-center gap-2 bg-ink text-paper px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gold-dark transition-colors"><LogIn size={18} /><span>התחבר</span></button>
                  )}
                </div>
              )}
            </header>

            <main className="flex-1 overflow-y-auto relative scroll-smooth">
              {mainContent}
            </main>
          </div>
        </>
      )}

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
    </div>
  );
};

export default App;
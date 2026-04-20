import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Search, ChevronRight, Gavel, BookOpen, AlertCircle, Info, Menu, X, ArrowLeft, Filter, ChevronDown, Scale, ScrollText, Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DOCUMENTS, allLawArticles } from './data/lawData';
import { Chapter, Article, DocumentData } from './types';

function DocumentPane({
  docData,
  allArticles,
  selectedId,
  expandedArticleId,
  searchQuery,
  onSelect,
  onToggleArticle,
  onClearSearch,
  isSidebarOpen
}: {
  docData: DocumentData;
  allArticles: Article[];
  selectedId: string;
  expandedArticleId: string | null;
  searchQuery: string;
  onSelect: (id: string, articleId?: string) => void;
  onToggleArticle: (id: string) => void;
  onClearSearch: () => void;
  isSidebarOpen: boolean;
}) {
  const isLuat = docData.id === 'luat';
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allArticles.filter(art => 
      art.title.toLowerCase().includes(query) || 
      art.content.toLowerCase().includes(query)
    );
  }, [allArticles, searchQuery]);

  const currentView = useMemo(() => {
    const chapter = docData.chapters.find(ch => ch.id === selectedId);
    if (chapter) return { type: 'chapter' as const, data: chapter };
    
    for (const ch of docData.chapters) {
      const section = ch.sections?.find(s => s.id === selectedId);
      if (section) return { type: 'section' as const, data: section, parent: ch };
    }
    return null;
  }, [selectedId, docData]);

  const currentArticles = useMemo(() => {
    if (!currentView) return [];
    if (currentView.type === 'section') {
      return currentView.data.articles || [];
    }
    if (currentView.type === 'chapter') {
      const list: Article[] = [];
      if (currentView.data.articles) list.push(...currentView.data.articles);
      if (currentView.data.sections) {
        currentView.data.sections.forEach(s => list.push(...(s.articles || [])));
      }
      return list;
    }
    return [];
  }, [currentView]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-deep-yellow/30 text-ink-900 border-b-2 border-deep-yellow px-0.5 rounded-sm font-bold">{part}</mark> 
            : part
        )}
      </>
    );
  };

  return (
    <div ref={contentRef} className="flex-1 overflow-y-auto p-4 lg:px-10 lg:pt-0 lg:pb-12 scroll-smooth h-full bg-slate-900">
      <div className="w-full h-full pt-0 pb-20 mt-4 px-4 lg:px-0 flex flex-col">
        <div className={`mx-auto w-full transition-all duration-700 ease-in-out ${isSidebarOpen ? 'max-w-4xl lg:max-w-5xl' : 'max-w-5xl lg:max-w-6xl'}`}>
        {searchQuery.trim() ? (
          /* Search Results */
          <div className="space-y-0">
            {filteredArticles.length > 0 ? (
              <div className="space-y-0">
                {filteredArticles.map(art => {
                  // Find where this article belongs
                  let parentId = "";
                  docData.chapters.forEach(ch => {
                    if (ch.articles?.find(a => a.id === art.id)) parentId = ch.id;
                    ch.sections?.forEach(s => {
                      if (s.articles.find(a => a.id === art.id)) parentId = s.id;
                    });
                  });

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={art.id}
                      className="bg-white rounded-xl border border-ink-900/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-visible mb-4 last:mb-0"
                    >
                      <button 
                        onClick={() => onToggleArticle(art.id)}
                        className={`w-full text-left p-5 lg:p-6 flex items-center justify-between gap-4 transition-colors ${expandedArticleId === art.id ? 'bg-deep-yellow text-white sticky top-0 z-20 shadow-xl before:content-[""] before:absolute before:inset-x-0 before:bottom-full before:h-24 before:bg-slate-900' : 'hover:bg-cream-50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`font-bold px-3 py-1 border rounded-lg transition-all shrink-0 whitespace-nowrap ${expandedArticleId === art.id ? 'border-slate-200/50 bg-white/10 text-ink-900' : 'border-slate-200 text-ink-800'} text-lg lg:text-xl tracking-tight`}>
                            Điều {art.id.split('D')[1]}
                          </div>
                          <h2 className={`font-bold text-lg lg:text-xl tracking-tight text-ink-900`}>
                            {highlightMatch(art.title.split('.')[1] || art.title, searchQuery)}
                          </h2>
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-300 shrink-0 ${expandedArticleId === art.id ? 'rotate-180 text-ink-900' : 'text-slate-300'}`} />
                      </button>

                      <AnimatePresence>
                        {expandedArticleId === art.id ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 lg:px-8 pb-8 pt-4 border-t border-ink-900/5">
                              <div className="pr-4">
                                <p className="text-ink-800 leading-relaxed text-base lg:text-lg whitespace-pre-wrap font-medium selection:bg-deep-yellow/30 text-justify">
                                  {highlightMatch(art.content, searchQuery)}
                                </p>
                              </div>
                              <div className="mt-6 pt-6 border-t border-ink-900/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-deep-yellow-dark/60 text-[9px] font-black uppercase tracking-[0.2em]">
                                  <Info size={12} />
                                  TRÍCH LUẬT ĐẤU THẦU 2023
                                </div>
                                <button 
                                  onClick={() => { onSelect(parentId, art.id); onClearSearch(); }}
                                  className="text-amber-700 hover:text-amber-900 text-[10px] font-bold underline decoration-dotted underline-offset-4"
                                >
                                  Xem trong chương mục gốc
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="px-5 lg:px-8 pb-6 pt-0">
                             <div className="text-slate-500 text-sm leading-relaxed line-clamp-2 italic border-l-2 border-slate-100 pl-4 py-1 text-justify">
                                {(() => {
                                  const content = art.content;
                                  const query = searchQuery.toLowerCase();
                                  const index = content.toLowerCase().indexOf(query);
                                  if (index === -1) return highlightMatch(content.substring(0, 250) + (content.length > 250 ? '...' : ''), searchQuery);
                                  const start = Math.max(0, index - 80);
                                  const end = Math.min(content.length, index + 150);
                                  let snippet = content.substring(start, end);
                                  if (start > 0) snippet = '...' + snippet;
                                  if (end < content.length) snippet = snippet + '...';
                                  return highlightMatch(snippet, searchQuery);
                                })()}
                             </div>
                             <button 
                               onClick={() => onToggleArticle(art.id)}
                               className="mt-3 text-[10px] font-bold text-deep-yellow-dark flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest"
                             >
                               Xem toàn bộ nội dung <ChevronRight size={12} />
                             </button>
                          </div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Không tìm thấy kết quả</h3>
                <p className="text-slate-500 mt-1">Hãy thử từ khóa khác.</p>
              </div>
            )}
          </div>
        ) : currentView ? (
          <div className="space-y-0">
            <div className="space-y-0">
              {currentArticles.map((art) => (
                <div key={art.id} id={`article-${art.id}`} className="scroll-mt-0 bg-white rounded-xl border border-ink-900/5 shadow-sm hover:shadow-md transition-all duration-500 overflow-visible mb-4 last:mb-0">
                  <button 
                    onClick={() => onToggleArticle(art.id)}
                    className={`w-full text-left p-3 lg:py-4 lg:px-5 flex items-center justify-between gap-4 transition-colors rounded-xl ${expandedArticleId === art.id ? 'bg-deep-yellow sticky top-0 z-20 shadow-xl' : 'hover:bg-cream-50'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`font-bold px-3 py-1 border rounded-lg transition-all shrink-0 whitespace-nowrap ${expandedArticleId === art.id ? 'border-slate-200/50 bg-white/10 text-white' : 'border-slate-200 text-ink-800'} text-base lg:text-lg tracking-tight`}>
                        Điều {art.id.split('D')[1]}
                      </div>
                      <h2 className={`font-bold text-base lg:text-lg tracking-tight ${expandedArticleId === art.id ? 'text-white' : 'text-ink-900'}`}>
                        {highlightMatch(art.title.split('.')[1] || art.title, searchQuery)}
                      </h2>
                    </div>
                    <ChevronDown size={24} className={`transition-transform duration-500 shrink-0 ${expandedArticleId === art.id ? 'rotate-180 text-white' : 'text-slate-300'}`} />
                  </button>

                  <AnimatePresence>
                    {expandedArticleId === art.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 lg:px-10 pb-10 pt-5 border-t border-ink-900/5">
                          <div className="pr-4">
                            <p className="text-ink-800 leading-relaxed text-sm lg:text-base whitespace-pre-wrap font-medium selection:bg-deep-yellow/30 text-justify">
                              {highlightMatch(art.content, searchQuery)}
                            </p>
                          </div>
                          <div className="mt-10 pt-8 border-t border-ink-900/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-deep-yellow-dark/60 text-[10px] font-black uppercase tracking-[0.2em]">
                              <Info size={14} />
                              TRÍCH LUẬT ĐẤU THẦU 2023
                            </div>
                            <div className="text-ink-900/20 italic text-xs">
                              Original Source Verfied
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-bold text-slate-400">Chọn một mục để xem chi tiết</h3>
          </div>
        )}
      </div>
    </div>
  </div>
);
}

export default function App() {
  const [selectedLuatId, setSelectedLuatId] = useState<string>(DOCUMENTS.find(d => d.id === 'luat')?.chapters[0].id || "");
  const [expandedLuatArticleId, setExpandedLuatArticleId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showLegalBasis, setShowLegalBasis] = useState(false);

  // Chapters with expanded sections in sidebar
  const [expandedSidebarChapters, setExpandedSidebarChapters] = useState<string[]>([]);

  // Sidebar Resizing
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 260 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize as any);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize as any);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize as any);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const toggleSidebarChapter = (e: any, chapterId: string) => {
    e.stopPropagation();
    setExpandedSidebarChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleSelectLuat = (id: string, articleId?: string) => {
    setSelectedLuatId(id);
    if (!searchQuery) {
      setExpandedLuatArticleId(null);
    }
    if (articleId) {
      setExpandedLuatArticleId(articleId);
      setTimeout(() => {
        const el = document.getElementById(`article-${articleId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen bg-slate-200/60 font-sans text-ink-900 overflow-hidden ${isResizing ? 'select-none cursor-col-resize' : ''}`} id="app-container">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ marginLeft: isSidebarOpen ? 0 : -sidebarWidth }}
        transition={{ duration: isResizing ? 0 : 0.3, ease: 'easeInOut' }}
        style={{ width: sidebarWidth }}
        className={`fixed lg:relative z-50 h-full bg-cream-100 border-r border-ink-900/5 flex flex-col shadow-2xl lg:shadow-none shrink-0 overflow-visible`}
        id="sidebar"
      >
        {/* Resize Handle */}
        <div 
          onMouseDown={startResizing}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-deep-yellow/30 active:bg-deep-yellow/50 transition-colors z-50 hidden lg:block ${isResizing ? 'bg-deep-yellow/50' : ''}`}
        />

        <div className="p-8 border-b border-ink-900/5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-deep-yellow rounded-full flex items-center justify-center text-white shadow-xl shadow-deep-yellow/20 shrink-0">
              <BookOpen size={24} strokeWidth={1.5} />
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-ink-900/5 rounded-full shrink-0">
              <X size={20} />
            </button>
          </div>
          <div>
            <h1 className="font-bold text-2xl leading-none text-ink-900 tracking-tight uppercase">Luật Đấu Thầu</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-[2px] w-4 bg-deep-yellow" />
              <p className="text-[10px] text-deep-yellow-dark font-black tracking-[0.1em]">VBHN số 74/VBHN-VPQH ngày 25/3/2026</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
          <div className="space-y-1">
            <button
              onClick={() => setShowLegalBasis(!showLegalBasis)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                showLegalBasis 
                  ? 'bg-white text-ink-900 shadow-xl shadow-ink-900/5 ring-1 ring-ink-900/5' 
                  : 'bg-white/50 border border-ink-900/5 hover:bg-white hover:shadow-md text-ink-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors bg-cream-100 text-deep-yellow-dark`}>
                  <Scale size={20} />
                </div>
                <span className={`font-bold transition-all ${showLegalBasis ? 'text-lg' : 'text-sm'}`}>Pháp lý</span>
              </div>
              <ChevronRight size={18} className={`transition-transform duration-300 ${showLegalBasis ? 'rotate-90 text-slate-400' : 'text-slate-300'}`} />
            </button>
            <AnimatePresence>
              {showLegalBasis && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 space-y-4 bg-white rounded-2xl mt-1 border border-ink-900/5 shadow-sm">
                    <p className="text-xs text-ink-800/60 font-medium leading-relaxed italic">
                      Nội dung tra cứu này được hợp nhất bởi các Luật:
                    </p>
                    <ul className="space-y-4">
                      {[
                        "Luật Đấu thầu số 22/2023/QH15",
                        "Luật số 57/2024/QH15",
                        "Luật số 90/2025/QH15",
                        "Luật An ninh mạng số 116/2025/QH15",
                        "Luật Công nghệ cao số 133/2025/QH15",
                        "Luật Phục hồi, phá sản số 142/2025/QH15"
                      ].map((law, idx) => (
                        <li key={idx} className="flex gap-3 items-start">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-deep-yellow shrink-0" />
                          <span className="text-sm text-ink-900 font-medium leading-snug italic">
                            {law}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-px bg-ink-900/5 mx-2 my-2" />

          {DOCUMENTS.filter(d => d.id === 'luat').map((doc) => {
            const filteredChapters = searchQuery.trim() 
              ? doc.chapters.filter(ch => 
                  ch.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (ch.sections?.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                  (ch.articles?.some(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                  (ch.sections?.some(s => s.articles.some(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()))))
                )
              : doc.chapters;

            return (
              <div key={doc.id} className="space-y-1">
                {filteredChapters.map((chapter) => {
                  const isSelected = selectedLuatId === chapter.id;
                  const isExpanded = expandedSidebarChapters.includes(chapter.id);
                  const hasSections = chapter.sections && chapter.sections.length > 0;

                  return (
                    <div key={chapter.id} className="mb-2">
                      <button
                        onClick={() => handleSelectLuat(chapter.id)}
                        className={`w-full text-left px-4 py-4 rounded-xl text-sm transition-all duration-300 flex items-center gap-3 group relative ${
                          isSelected && !searchQuery
                            ? 'bg-deep-yellow text-white font-bold shadow-lg shadow-deep-yellow/20'
                            : 'text-ink-800 hover:bg-ink-900/5 font-semibold'
                        }`}
                      >
                        <div 
                           className="p-1 rounded-md shrink-0 transition-colors"
                           onClick={hasSections ? (e) => toggleSidebarChapter(e, chapter.id) : undefined}
                        >
                          <ChevronRight 
                            size={14} 
                            className={`transition-transform duration-300 ${isSelected ? 'text-white' : 'text-slate-400'} ${isExpanded ? 'rotate-90' : ''} ${!hasSections ? 'opacity-0' : ''}`} 
                          />
                        </div>
                        <span className="text-base tracking-tight leading-snug whitespace-normal break-words py-1">{chapter.title.split(':')[0]}</span>
                      </button>
                      
                      <AnimatePresence>
                        {hasSections && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-ink-900/5 mx-2 rounded-xl overflow-hidden mt-1"
                          >
                            <div className="px-2 py-2 space-y-1">
                              {chapter.sections!.map((section) => {
                                const isSectionSelected = selectedLuatId === section.id;
                                return (
                                  <button
                                    key={section.id}
                                    onClick={() => handleSelectLuat(section.id)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs transition-all duration-200 block font-medium whitespace-normal break-words ${
                                      isSectionSelected && !searchQuery
                                        ? 'text-deep-yellow-dark font-black bg-white shadow-sm'
                                        : 'text-ink-800/60 hover:text-ink-900 hover:bg-white/50'
                                    }`}
                                  >
                                    {section.title}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="p-6 border-t border-ink-900/5 mt-auto">
          <button 
            onClick={() => setShowDisclaimer(true)}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-white border border-ink-900/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-ink-800 hover:bg-cream-50 transition-all shadow-sm hover:shadow-md"
          >
            <AlertCircle size={14} />
            Miễn trừ trách nhiệm
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle background texture/overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] opacity-20 pointer-events-none" />

        <header 
          className="shrink-0 bg-cream-100 backdrop-blur-xl border-b border-ink-900/5 p-4 lg:p-8 flex items-center gap-6 z-30 relative overflow-hidden"
        >
          {/* Decorative Snowflakes */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0.1, scale: 0.5 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                  y: [0, 10, 0]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                className="absolute text-deep-yellow/20 blur-[0.5px]"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                <Snowflake size={Math.random() * 15 + 10} strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 bg-white border border-ink-900/5 shadow-sm hover:shadow-md hover:bg-cream-50 rounded-2xl shrink-0 transition-all z-20 text-ink-900"
          >
            <Menu size={24} />
          </button>

          <div className={`flex-1 relative mx-auto flex gap-3 z-10 transition-all duration-500 ${isSidebarOpen ? 'max-w-4xl' : 'max-w-7xl'}`}>
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-deep-yellow transition-colors" size={20} />
              <input
                type="text"
                placeholder='Tìm kiếm chương, điều, nội dung...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-ink-900/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-deep-yellow/10 focus:border-deep-yellow/50 transition-all text-base shadow-sm text-ink-900 font-medium placeholder:text-slate-400"
              />
            </div>
            {searchQuery && (
               <button 
                 onClick={() => setSearchQuery("")}
                 className="bg-deep-yellow hover:bg-deep-yellow-hover px-8 py-4 rounded-2xl font-bold text-sm text-white transition-all flex items-center gap-3 shrink-0 shadow-lg shadow-deep-yellow/20"
               >
                 <ArrowLeft size={18} />
                 Xóa tìm kiếm
               </button>
            )}
          </div>
        </header>

        {/* Single Pane */}
        <div className="flex-1 flex overflow-hidden z-10">
           <div className="flex-1 h-full relative">
             <DocumentPane 
                docData={DOCUMENTS[0]} 
                allArticles={allLawArticles} 
                selectedId={selectedLuatId}
                expandedArticleId={expandedLuatArticleId}
                searchQuery={searchQuery}
                onSelect={handleSelectLuat}
                onToggleArticle={(id) => setExpandedLuatArticleId(prev => prev === id ? null : id)}
                onClearSearch={() => setSearchQuery("")}
                isSidebarOpen={isSidebarOpen}
             />
           </div>
        </div>
      </div>

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisclaimer(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <button 
                onClick={() => setShowDisclaimer(false)}
                className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Miễn trừ trách nhiệm</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                Ứng dụng này được tạo ra nhằm mục đích tham khảo và tra cứu nhanh. Mặc dù chúng tôi cố gắng cập nhật nội dung mới nhất, chúng tôi không chịu trách nhiệm về độ chính xác tuyệt đối của văn bản.
                Vui lòng đối chiếu với các văn bản quy phạm pháp luật chính thức được ban hành bởi cơ quan nhà nước có thẩm quyền trước khi áp dụng vào thực tế.
              </p>
              <button 
                onClick={() => setShowDisclaimer(false)}
                className="mt-8 w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
              >
                Tôi đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

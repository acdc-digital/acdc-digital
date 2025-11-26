// BOOKS CONSOLE - Library management interface for sidebar
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/books/BooksConsole.tsx

"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Star,
  Clock,
  CheckCircle,
  BookmarkPlus,
  ChevronDown,
  ChevronRight,
  Filter
} from "lucide-react";
import { useEditorStore } from "@/lib/store";

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  status: 'reading' | 'completed' | 'want-to-read' | 'paused';
  progress: number;
  rating?: number;
  genre: string[];
  dateAdded: string;
  lastRead?: string;
}

type FilterType = 'all' | 'reading' | 'completed' | 'want-to-read' | 'paused';

export function BooksConsole() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [filter, setFilter] = useState<FilterType>('all');
  const { openTab } = useEditorStore();

  // Mock book library data
  const mockBooks: Book[] = [
    {
      id: 1,
      title: "The Pragmatic Programmer",
      author: "David Thomas, Andrew Hunt",
      cover: "/placeholder-book.jpg",
      status: "reading",
      progress: 45,
      rating: 5,
      genre: ["Programming", "Software Development"],
      dateAdded: "2024-01-15",
      lastRead: "2024-08-18"
    },
    {
      id: 2,
      title: "Clean Architecture",
      author: "Robert C. Martin",
      cover: "/placeholder-book.jpg",
      status: "completed",
      progress: 100,
      rating: 4,
      genre: ["Programming", "Architecture"],
      dateAdded: "2024-02-01",
      lastRead: "2024-07-20"
    },
    {
      id: 3,
      title: "Atomic Habits",
      author: "James Clear",
      cover: "/placeholder-book.jpg",
      status: "want-to-read",
      progress: 0,
      genre: ["Self-Help", "Productivity"],
      dateAdded: "2024-08-10"
    },
    {
      id: 4,
      title: "Design Patterns",
      author: "Gang of Four",
      cover: "/placeholder-book.jpg",
      status: "paused",
      progress: 23,
      rating: 4,
      genre: ["Programming", "Design"],
      dateAdded: "2024-03-15",
      lastRead: "2024-06-10"
    },
    {
      id: 5,
      title: "You Don't Know JS",
      author: "Kyle Simpson",
      cover: "/placeholder-book.jpg",
      status: "reading",
      progress: 67,
      rating: 5,
      genre: ["Programming", "JavaScript"],
      dateAdded: "2024-07-01",
      lastRead: "2024-08-19"
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleBookClick = (book: Book) => {
    openTab({
      id: `book-${book.id}`,
      title: book.title,
      type: 'books'
    });
  };

  // Group books by status
  const readingBooks = mockBooks.filter(book => book.status === 'reading');
  const completedBooks = mockBooks.filter(book => book.status === 'completed');
  const wantToReadBooks = mockBooks.filter(book => book.status === 'want-to-read');
  const pausedBooks = mockBooks.filter(book => book.status === 'paused');

  const getFilterStats = () => {
    return {
      all: mockBooks.length,
      reading: mockBooks.filter(b => b.status === 'reading').length,
      completed: mockBooks.filter(b => b.status === 'completed').length,
      'want-to-read': mockBooks.filter(b => b.status === 'want-to-read').length,
      paused: mockBooks.filter(b => b.status === 'paused').length
    };
  };

  const stats = getFilterStats();

  return (
    <div className="h-full bg-[#181818] text-[#cccccc] flex flex-col">
      <div className="p-2">
        <div className="flex items-center justify-between text-xs uppercase text-[#858585] px-2 py-1">
          <span>Books</span>
        </div>

        {/* Book Library Sections */}
        <div className="space-y-1 mt-2">

          {/* Library Overview */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('overview') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <BookOpen className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Overview</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
              </div>
            </button>
            
            {expandedSections.has('overview') && (
              <div className="px-2 pb-2 space-y-2">
                <div className="h-px bg-[#2d2d2d]" />
                
                {/* Overview Statistics */}
                <div className="text-[10px] text-[#858585] space-y-1">
                  <div className="flex justify-between">
                    <span>Total Books:</span>
                    <span className="text-[#cccccc]">{mockBooks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currently Reading:</span>
                    <span className="text-[#cccccc]">{stats.reading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="text-[#cccccc]">{stats.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Want to Read:</span>
                    <span className="text-[#cccccc]">{stats['want-to-read']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paused:</span>
                    <span className="text-[#cccccc]">{stats.paused}</span>
                  </div>
                </div>

                <div className="h-px bg-[#2d2d2d]" />

                {/* Quick Actions */}
                <div className="space-y-1">
                  <div className="text-xs text-[#858585] mb-1 px-1">Quick Actions</div>
                  <button className="w-full flex items-center gap-2 px-1 py-1 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]/30 rounded transition-colors">
                    <Plus className="w-3 h-3" />
                    <span>Add New Book</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-1 py-1 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d2d]/30 rounded transition-colors">
                    <Search className="w-3 h-3" />
                    <span>Search Library</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
            <button
              onClick={() => toggleSection('filters')}
              className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
            >
              {expandedSections.has('filters') ? 
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
              }
              <Filter className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-xs font-medium flex-1 text-left">Status Filter</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#858585] capitalize">{filter === 'want-to-read' ? 'Want to Read' : filter}</span>
              </div>
            </button>
            
            {expandedSections.has('filters') && (
              <div className="px-2 pb-2 space-y-2">
                <div className="h-px bg-[#2d2d2d]" />
                
                {/* Filter Actions */}
                <div className="space-y-1">
                  <div className="text-xs text-[#858585] mb-1 px-1">Reading Status</div>
                  
                  {[
                    { id: 'all', label: 'All Books', icon: BookOpen },
                    { id: 'reading', label: 'Reading', icon: Clock },
                    { id: 'completed', label: 'Completed', icon: CheckCircle },
                    { id: 'want-to-read', label: 'Want to Read', icon: BookmarkPlus },
                    { id: 'paused', label: 'Paused', icon: BookOpen },
                  ].map((filterOption) => {
                    const Icon = filterOption.icon;
                    const isActive = filter === filterOption.id;
                    const count = stats[filterOption.id as keyof typeof stats];
                    
                    return (
                      <div key={filterOption.id} className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3 text-[#858585]" />
                          <span className="text-xs text-[#858585]">{filterOption.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#cccccc]">{count}</span>
                          <button
                            onClick={() => setFilter(filterOption.id as FilterType)}
                            className={`text-xs underline-offset-2 hover:underline ${
                              isActive 
                                ? 'text-[#007acc] font-medium' 
                                : 'text-[#858585] hover:text-[#cccccc]'
                            }`}
                          >
                            {isActive ? 'Active' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Currently Reading */}
          {readingBooks.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('reading')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('reading') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium flex-1 text-left">Currently Reading</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{readingBooks.length}</span>
                </div>
              </button>
              
              {expandedSections.has('reading') && (
                <div className="px-2 pb-2 space-y-2">
                  <div className="h-px bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {readingBooks.map((book) => (
                      <div 
                        key={book.id} 
                        onClick={() => handleBookClick(book)}
                        className="flex items-center justify-between px-1 py-1 hover:bg-[#2d2d2d]/30 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <BookOpen className="w-3 h-3 text-[#858585]" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#cccccc] truncate">{book.title}</div>
                            <div className="text-[10px] text-[#858585] truncate">{book.author}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#858585]">{book.progress}%</span>
                          {book.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-[#858585]">{book.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed Books */}
          {completedBooks.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('completed')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('completed') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-medium flex-1 text-left">Completed</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{completedBooks.length}</span>
                </div>
              </button>
              
              {expandedSections.has('completed') && (
                <div className="px-2 pb-2 space-y-2">
                  <div className="h-px bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {completedBooks.slice(0, 5).map((book) => (
                      <div 
                        key={book.id} 
                        onClick={() => handleBookClick(book)}
                        className="flex items-center justify-between px-1 py-1 hover:bg-[#2d2d2d]/30 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#cccccc] truncate">{book.title}</div>
                            <div className="text-[10px] text-[#858585] truncate">{book.author}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {book.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-[#858585]">{book.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {completedBooks.length > 5 && (
                      <div className="text-xs text-[#858585] text-center pt-1">
                        +{completedBooks.length - 5} more completed
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Want to Read */}
          {wantToReadBooks.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('wantToRead')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('wantToRead') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <BookmarkPlus className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-medium flex-1 text-left">Want to Read</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{wantToReadBooks.length}</span>
                </div>
              </button>
              
              {expandedSections.has('wantToRead') && (
                <div className="px-2 pb-2 space-y-2">
                  <div className="h-px bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {wantToReadBooks.slice(0, 5).map((book) => (
                      <div 
                        key={book.id} 
                        onClick={() => handleBookClick(book)}
                        className="flex items-center justify-between px-1 py-1 hover:bg-[#2d2d2d]/30 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <BookmarkPlus className="w-3 h-3 text-yellow-400" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#cccccc] truncate">{book.title}</div>
                            <div className="text-[10px] text-[#858585] truncate">{book.author}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#858585]">
                            {new Date(book.dateAdded).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {wantToReadBooks.length > 5 && (
                      <div className="text-xs text-[#858585] text-center pt-1">
                        +{wantToReadBooks.length - 5} more in wishlist
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paused Books */}
          {pausedBooks.length > 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d]">
              <button
                onClick={() => toggleSection('paused')}
                className="w-full flex items-center gap-2 p-2 hover:bg-[#2d2d2d]/30 transition-colors"
              >
                {expandedSections.has('paused') ? 
                  <ChevronDown className="w-3.5 h-3.5 text-[#858585]" /> : 
                  <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                }
                <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium flex-1 text-left">Paused</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#cccccc]">{pausedBooks.length}</span>
                </div>
              </button>
              
              {expandedSections.has('paused') && (
                <div className="px-2 pb-2 space-y-2">
                  <div className="h-px bg-[#2d2d2d]" />
                  
                  <div className="space-y-1">
                    {pausedBooks.map((book) => (
                      <div 
                        key={book.id} 
                        onClick={() => handleBookClick(book)}
                        className="flex items-center justify-between px-1 py-1 hover:bg-[#2d2d2d]/30 rounded cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <BookOpen className="w-3 h-3 text-orange-400" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#cccccc] truncate">{book.title}</div>
                            <div className="text-[10px] text-[#858585] truncate">{book.author}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#858585]">{book.progress}%</span>
                          {book.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-[#858585]">{book.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {mockBooks.length === 0 && (
            <div className="rounded bg-[#1e1e1e] border border-[#2d2d2d] p-4">
              <div className="text-center">
                <BookOpen className="w-8 h-8 text-[#858585] mx-auto mb-2" />
                <p className="text-sm text-[#858585] mb-1">No books in library</p>
                <p className="text-xs text-[#858585]">
                  Add your first book to get started
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

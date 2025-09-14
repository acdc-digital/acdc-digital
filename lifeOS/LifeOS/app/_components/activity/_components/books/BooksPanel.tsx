// BOOKS PANEL - Detailed book view with personal notes and blog-style posts
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/activity/_components/books/BooksPanel.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Plus, User, Edit3 } from "lucide-react";
import { useState } from "react";

interface BookNote {
  id: number;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

interface Book {
  id: number;
  title: string;
  author: string;
  type: string;
  pages: number;
  publishDate: string;
  isbn: string;
  genre: string[];
  synopsis: string;
  cover: string;
  status: string;
  progress: number;
  rating: number;
  notes: BookNote[];
}

export function BooksPanel() {
  const [currentProgress, setCurrentProgress] = useState(45);
  const [pagesRead, setPagesRead] = useState(158); // 45% of 352 pages
  const [currentStatus, setCurrentStatus] = useState<'not-started' | 'reading' | 'complete' | 'incomplete'>('reading');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  
  // Initialize notes state with mock data
  const [notes, setNotes] = useState<BookNote[]>([
    {
      id: 1,
      title: "Chapter 2 Insights",
      content: "The concept of 'Don't Repeat Yourself' really resonated with me. I've been guilty of copy-pasting code without thinking about the long-term maintenance implications.",
      date: "2025-08-18",
      tags: ["DRY", "best-practices"]
    },
    {
      id: 2,
      title: "Orthogonality Notes",
      content: "The orthogonality principle is fascinating. When systems are orthogonal, changes in one area don't affect others. This makes debugging and testing so much easier.",
      date: "2025-08-19",
      tags: ["architecture", "design"]
    }
  ]);
  // Mock book data with detailed information
  const mockBooks: Book[] = [
    {
      id: 1,
      title: "The Pragmatic Programmer",
      author: "David Thomas, Andrew Hunt",
      type: "Paperback",
      pages: 352,
      publishDate: "1999-10-20",
      isbn: "978-0201616224",
      genre: ["Programming", "Software Development"],
      synopsis: "Straight from the programming trenches, The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process--taking a requirement and producing working, maintainable code that delights its users.",
      cover: "/placeholder-book.jpg",
      status: "reading",
      progress: 45,
      rating: 5,
      notes: [
        {
          id: 1,
          title: "Chapter 2 Insights",
          content: "The concept of 'Don't Repeat Yourself' really resonated with me. I've been guilty of copy-pasting code without thinking about the long-term maintenance implications.",
          date: "2025-08-18",
          tags: ["DRY", "best-practices"]
        },
        {
          id: 2,
          title: "Orthogonality Notes",
          content: "The orthogonality principle is fascinating. When systems are orthogonal, changes in one area don't affect others. This makes debugging and testing so much easier.",
          date: "2025-08-19",
          tags: ["architecture", "design"]
        }
      ]
    }
  ];

  const currentBook = mockBooks[0];

  const handleAddNote = () => {
    setIsAddingNote(true);
  };

  const handleSaveNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    
    // Create new note
    const newNote: BookNote = {
      id: Math.max(...notes.map(n => n.id), 0) + 1, // Generate unique ID
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      tags: newNoteTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    // Add note to beginning of list (most recent first)
    setNotes(prevNotes => [newNote, ...prevNotes]);
    
    // Reset form
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTags('');
    setIsAddingNote(false);
  };

  const handleCancelNote = () => {
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTags('');
    setIsAddingNote(false);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    setCurrentProgress(newProgress);
    setPagesRead(Math.round((newProgress / 100) * currentBook.pages));
  };

  const handlePagesReadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pages = parseInt(e.target.value) || 0;
    const maxPages = currentBook.pages;
    const clampedPages = Math.min(Math.max(pages, 0), maxPages);
    setPagesRead(clampedPages);
    setCurrentProgress(Math.round((clampedPages / maxPages) * 100));
  };

  const handleStatusChange = (newStatus: 'not-started' | 'reading' | 'complete' | 'incomplete') => {
    setCurrentStatus(newStatus);
    // TODO: Update the book status in the database/store
    console.log('Status changed to:', newStatus);
  };

  if (!currentBook) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-[#454545]">
          <h3 className="text-[#cccccc] font-medium mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BOOKS
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[#858585]">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No books selected</p>
            <Button className="mt-4 bg-[#007acc] hover:bg-[#005a9e]">
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#454545]">
        <h3 className="text-[#cccccc] font-medium mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          BOOK DETAILS
        </h3>
        
        {/* IDE Style Status Selector */}
        <div className="flex items-center gap-2 text-xs font-['SF_Pro_Display','SF_Pro_Text','-apple-system','system-ui','sans-serif']">
          <span className="text-[#858585] font-normal">Status:</span>
          
          <div className="flex items-center gap-2">
            {/* Status Dots */}
            <div className="flex gap-1.5">
              {/* Not Started - Soft Blue */}
              <button
                onClick={() => handleStatusChange('not-started')}
                className={`w-3 h-3 rounded-full border-1 transition-all duration-200 ${
                  currentStatus === 'not-started'
                    ? 'bg-blue-300 border-blue-300'
                    : 'bg-transparent border-blue-300 hover:bg-blue-300/20'
                }`}
                title="Not Started"
              />
              
              {/* Reading - Soft Yellow */}
              <button
                onClick={() => handleStatusChange('reading')}
                className={`w-3 h-3 rounded-full border-1 transition-all duration-200 ${
                  currentStatus === 'reading'
                    ? 'bg-yellow-300 border-yellow-300'
                    : 'bg-transparent border-yellow-300 hover:bg-yellow-300/20'
                }`}
                title="Reading"
              />
              
              {/* Complete - Soft Green */}
              <button
                onClick={() => handleStatusChange('complete')}
                className={`w-3 h-3 rounded-full border-1 transition-all duration-200 ${
                  currentStatus === 'complete'
                    ? 'bg-green-300 border-green-300'
                    : 'bg-transparent border-green-300 hover:bg-green-300/20'
                }`}
                title="Complete"
              />
              
              {/* Incomplete - Soft Red */}
              <button
                onClick={() => handleStatusChange('incomplete')}
                className={`w-3 h-3 rounded-full border-1 transition-all duration-200 ${
                  currentStatus === 'incomplete'
                    ? 'bg-red-300 border-red-300'
                    : 'bg-transparent border-red-300 hover:bg-red-300/20'
                }`}
                title="Incomplete"
              />
            </div>
            
            {/* Active Status Text */}
            <span className="text-[#cccccc] capitalize font-normal">
              {currentStatus === 'not-started' ? 'not started' :
               currentStatus === 'complete' ? 'complete' :
               currentStatus}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Two-column layout */}
          <div className="flex gap-6">
            
            {/* First Column: Book Cover + Basic Details side by side */}
            <div className="w-120 flex-shrink-0">
              <div className="flex gap-4">
                {/* Book Cover */}
                <div className="w-40 h-48 bg-[#2d2d2d] rounded flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 text-[#858585]" />
                </div>
                
                {/* Book Details beside cover */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="text-[#cccccc] font-semibold text-base leading-tight">
                      {currentBook.title}
                    </h4>
                    <p className="text-[#858585] text-sm flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {currentBook.author}
                    </p>
                  </div>
                  
                  {/* Essential Book Metadata */}
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-[#cccccc]">Type:</span>
                    </div>
                    <div className="text-[#858585]">{currentBook.type}</div>
                    
                    <div>
                      <span className="text-[#cccccc]">Pages:</span>
                    </div>
                    <div className="text-[#858585]">{currentBook.pages}</div>
                    
                    <div>
                      <span className="text-[#cccccc]">Published:</span>
                    </div>
                    <div className="text-[#858585]">{new Date(currentBook.publishDate).getFullYear()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Column: Synopsis + Progress */}
            <div className="flex-1 space-y-4 mr-12">
              
              {/* Synopsis */}
              <div>
                <h5 className="text-[#cccccc] font-medium text-sm mb-2">Synopsis</h5>
                <p className="text-[#858585] text-sm leading-relaxed">
                  {currentBook.synopsis}
                </p>
              </div>

              {/* Reading Progress - Interactive */}
              {currentBook.status === 'reading' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#cccccc]">Reading Progress</span>
                    <span className="text-[#007acc]">{currentProgress}%</span>
                  </div>
                  
                  {/* Progress Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentProgress}
                      onChange={handleProgressChange}
                      title="Reading progress slider"
                      aria-label="Reading progress percentage"
                      className="w-full h-2 bg-[#2d2d30] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#007acc] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb:active]:bg-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[#007acc] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb:active]:bg-white"
                    />
                    
                    {/* Pages Input */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#cccccc]">Pages:</span>
                      <input
                        type="number"
                        min="0"
                        max={currentBook.pages}
                        value={pagesRead}
                        onChange={handlePagesReadChange}
                        title="Pages read input"
                        aria-label="Pages read"
                        className="w-16 px-2 py-1 bg-[#2d2d30] border border-[#3e3e42] rounded text-[#cccccc] text-center focus:outline-none focus:border-[#007acc]"
                      />
                      <span className="text-[#888888]">of {currentBook.pages}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invisible separator for vertical spacing - matches background color for clean look */}
          <div className="border-t border-[#1e1e1e] my-6"></div>

          {/* Full-width Notes Section Row */}
          <div>
            <div className="flex items-center justify-between mb-3 mr-12">
              <h5 className="text-[#cccccc] font-medium text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Reading Notes & Thoughts
              </h5>
              <Button
                size="sm"
                onClick={handleAddNote}
                className="bg-[#1e1e1e] hover:bg-[#252526] text-[#cccccc] border border-[#454545] hover:border-[#007acc] transition-all duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Note
              </Button>
            </div>

            {/* Add Note Form - IDE Style */}
            {isAddingNote && (
              <div className="mb-6 mr-12 border border-[#2d2d30] rounded-lg p-4">
                <div className="space-y-4 text-sm">
                  {/* Note Title */}
                  <div>
                    <Input
                      id="note-title"
                      placeholder="Note title..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="bg-transparent border-none text-[#cccccc] placeholder:text-[#858585] focus:ring-0 focus:outline-none p-0 text-base font-medium h-auto"
                    />
                    <div className="h-px bg-[#454545] mt-2"></div>
                  </div>

                  {/* Note Content */}
                  <div className="mt-4">
                    <textarea
                      id="note-content"
                      placeholder="Write your thoughts and insights..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={6}
                      className="w-full bg-transparent border-none text-[#cccccc] placeholder:text-[#858585] focus:ring-0 focus:outline-none resize-none text-sm leading-relaxed p-0"
                    />
                  </div>

                  {/* Tags */}
                  <div className="pt-2 border-t border-[#454545]">
                    <Input
                      id="note-tags"
                      placeholder="Tags (comma-separated)"
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                      className="bg-transparent border-none text-[#858585] placeholder:text-[#858585] focus:ring-0 focus:outline-none p-0 text-xs h-auto"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelNote}
                      className="text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30] px-3 py-1 h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
                      className="bg-[#007acc] hover:bg-[#005a9e] text-white disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 h-7 text-xs"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List - IDE Style */}
            <div className="space-y-4 mr-12">
              {notes.map((note: BookNote) => (
                <div
                  key={note.id}
                  className="border border-[#2d2d30] rounded-lg p-3 hover:bg-[#252526] transition-colors cursor-pointer"
                >
                  {/* Note Header */}
                  <div className="flex justify-between items-start mb-2">
                    <h6 className="text-[#cccccc] font-medium text-base">
                      {note.title}
                    </h6>
                    <span className="text-xs text-[#858585] font-mono">
                      {new Date(note.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* Note Content */}
                  <div className="text-[#cccccc] text-sm leading-relaxed mb-2 whitespace-pre-line">
                    {note.content}
                  </div>
                  
                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {notes.length === 0 && !isAddingNote && (
                <div className="text-center py-12 text-[#858585] text-sm">
                  <Edit3 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="mb-1">No reading notes yet</p>
                  <p className="text-xs opacity-75">Click &ldquo;Add Note&rdquo; above to start capturing your thoughts</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          {/* Invisible separator for vertical spacing - matches background color for clean look */}
          <div className="pt-6 border-t border-[#1e1e1e] mr-12">
            <h6 className="text-[#858585] font-medium text-xs mb-2 uppercase tracking-wide">Additional Information</h6>
            
            <div className="space-y-1 text-xs">
              {/* ISBN */}
              <div className="flex items-center gap-2">
                <span className="text-[#858585]">ISBN:</span>
                <span className="text-[#cccccc]">{currentBook.isbn}</span>
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-[#858585]">Status:</span>
                <span className="text-[#cccccc] capitalize">
                  {currentStatus === 'not-started' ? 'not started' :
                   currentStatus === 'complete' ? 'complete' :
                   currentStatus}
                </span>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-[#858585]">My Rating:</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < currentBook.rating
                          ? 'text-yellow-400'
                          : 'text-[#454545]'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Genres */}
              <div className="flex items-center gap-2">
                <span className="text-[#858585]">Genres:</span>
                <div className="flex gap-1">
                  {currentBook.genre.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-1.5 py-0.5 bg-[#2d2d2d] text-[#858585] text-xs rounded"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

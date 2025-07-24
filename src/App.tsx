import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Edit2, Trash2, Grid3X3, List, Layout, CheckCircle } from 'lucide-react';
import { calculateTimeRemaining, formatTimeRemaining, formatDateTimeForInput } from './utils';
import { Board, Note, DONE_BOARD_ID } from './types';
import { completeNote, uncompleteNote, formatCompletionDate } from './noteHelpers';
import { Checkbox } from './Checkbox';

const StickyNotesApp = () => {
  // Load saved data from localStorage or use defaults
  const loadFromStorage = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const [boards, setBoards] = useState<Board[]>(() => {
    const savedBoards = loadFromStorage('stickyNotes_boards', [
      { id: 1, name: 'Marketing Campaign', color: 'bg-black border-2 border-green-500' },
      { id: 2, name: 'Product Development', color: 'bg-black border-2 border-green-500' }
    ]);

    // Ensure Done board exists
    const hasDoneBoard = savedBoards.some((b: Board) => b.id === DONE_BOARD_ID);
    if (!hasDoneBoard) {
      return [
        ...savedBoards,
        { id: DONE_BOARD_ID, name: 'Done', color: 'bg-black border-2 border-green-600', isDoneBoard: true }
      ];
    }
    return savedBoards;
  });

  const [notes, setNotes] = useState<Note[]>(() =>
    loadFromStorage('stickyNotes_notes', [
      { id: 1, boardId: 1, content: 'Review Q4 marketing budget', color: 'bg-black border-green-400 text-green-400', x: 20, y: 20, createdAt: new Date('2024-01-15').toISOString(), dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, boardId: 1, content: 'Schedule social media posts', color: 'bg-black border-green-400 text-green-400', x: 180, y: 40, createdAt: new Date('2024-01-16').toISOString(), dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, boardId: 2, content: 'User testing feedback review', color: 'bg-black border-green-400 text-green-400', x: 30, y: 60, createdAt: new Date('2024-01-17').toISOString() }
    ])
  );

  const [selectedBoard, setSelectedBoard] = useState(() => {
    const saved = loadFromStorage('stickyNotes_selectedBoard', 1);
    // Ensure the selected board exists and is not the Done board
    const boardExists = loadFromStorage('stickyNotes_boards', []).some((b: any) => b.id === saved && b.id !== DONE_BOARD_ID);
    if (boardExists) {
      return saved;
    }
    // Find the first regular board
    const regularBoards = loadFromStorage('stickyNotes_boards', []).filter((b: any) => b.id !== DONE_BOARD_ID);
    return regularBoards[0]?.id || 1;
  });

  const [viewMode, setViewMode] = useState(() =>
    loadFromStorage('stickyNotes_viewMode', 'board')
  );

  const [draggedNote, setDraggedNote] = useState<any>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);


  const boardColors = [
    'bg-black border-2 border-green-500',
    'bg-black border-2 border-green-500',
    'bg-black border-2 border-green-500',
    'bg-black border-2 border-green-500',
    'bg-black border-2 border-green-500',
    'bg-black border-2 border-green-500'
  ];

  // Show save indicator when data changes
  const showSaved = () => {
    if (!isInitialLoad) {
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);
    }
  };

  // Mark initial load as complete
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('stickyNotes_boards', JSON.stringify(boards));
    showSaved();
  }, [boards]);

  useEffect(() => {
    localStorage.setItem('stickyNotes_notes', JSON.stringify(notes));
    showSaved();
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('stickyNotes_selectedBoard', JSON.stringify(selectedBoard));
  }, [selectedBoard]);

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('stickyNotes_viewMode', JSON.stringify(viewMode));
  }, [viewMode]);

  // Clear all saved data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all boards and notes? This action cannot be undone.')) {
      localStorage.removeItem('stickyNotes_boards');
      localStorage.removeItem('stickyNotes_notes');
      localStorage.removeItem('stickyNotes_selectedBoard');

      // Reset to default state
      setBoards([
        { id: 1, name: 'Marketing Campaign', color: 'bg-black border-2 border-green-500' },
        { id: 2, name: 'Product Development', color: 'bg-black border-2 border-green-500' },
        { id: DONE_BOARD_ID, name: 'Done', color: 'bg-black border-2 border-green-600', isDoneBoard: true }
      ]);
      setNotes([
        { id: 1, boardId: 1, content: 'Review Q4 marketing budget', color: 'bg-black border-green-400 text-green-400', x: 20, y: 20, createdAt: new Date('2024-01-15').toISOString(), dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 2, boardId: 1, content: 'Schedule social media posts', color: 'bg-black border-green-400 text-green-400', x: 180, y: 40, createdAt: new Date('2024-01-16').toISOString(), dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, boardId: 2, content: 'User testing feedback review', color: 'bg-black border-green-400 text-green-400', x: 30, y: 60, createdAt: new Date('2024-01-17').toISOString() }
      ]);
      setSelectedBoard(1);
    }
  };

  const [expandedNote, setExpandedNote] = useState<number | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteDueDate, setNewNoteDueDate] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-black border-green-400 text-green-400');
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoard, setEditingBoard] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editingNoteDueDate, setEditingNoteDueDate] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [gridPattern, setGridPattern] = useState('');
  const boardRef = useRef<HTMLDivElement>(null);

  // Generate dynamic grid pattern
  const generateGridPattern = () => {
    if (!boardRef.current) return;

    // Get actual board dimensions
    const rect = boardRef.current.getBoundingClientRect();
    const boardWidth = rect.width;
    const boardHeight = rect.height;

    const cols = Math.ceil(boardWidth / 24); // Each '+  ' is about 24px wide
    const rows = Math.ceil(boardHeight / 16); // Each row is about 16px high

    const pattern = Array(rows).fill(null)
      .map(() => '+  '.repeat(cols))
      .join('\n');

    setGridPattern(pattern);
  };

  // Update grid pattern on mount and window resize
  useEffect(() => {
    // Small delay to ensure board is rendered
    const timer = setTimeout(generateGridPattern, 100);

    const handleResize = () => {
      setTimeout(generateGridPattern, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Regenerate grid when board changes
  useEffect(() => {
    setTimeout(generateGridPattern, 100);
  }, [selectedBoard]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle note completion toggle
  const toggleNoteCompletion = (noteId: number) => {
    setNotes(prevNotes => {
      return prevNotes.map(note => {
        if (note.id === noteId) {
          if (note.completed) {
            // Uncomplete the note
            return uncompleteNote(note);
          } else {
            // Complete the note
            return completeNote(note, boards);
          }
        }
        return note;
      });
    });
  };

  // Countdown Timer Component
  const CountdownDisplay = ({ dueDate, isExpanded = false }: { dueDate?: string, isExpanded?: boolean }) => {
    if (!dueDate) return null;

    const timeRemaining = calculateTimeRemaining(dueDate);
    const formattedTime = formatTimeRemaining(timeRemaining);

    return (
      <div className={`font-mono ${isExpanded ? 'text-[10px]' : 'text-[9px]'} ${timeRemaining.isOverdue ? 'text-red-400' : 'text-yellow-400'}`}>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-green-600">[</span>
          <span className="font-bold whitespace-nowrap">
            {timeRemaining.isOverdue ? 'OVERDUE' : 'DUE IN'}
          </span>
          <span className="text-green-600">]</span>
          <span className="font-bold whitespace-nowrap">
            {formattedTime}
          </span>
        </div>
      </div>
    );
  };

  // Format date and time in terminal style
  const formatDateTime = (date: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNum = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day} ${month} ${dateNum} ${year} | ${hours}:${minutes}:${seconds}`;
  };

  const addNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now(),
        boardId: selectedBoard,
        content: newNoteContent,
        color: selectedColor,
        x: Math.random() * 300 + 20,
        y: Math.random() * 200 + 20,
        createdAt: new Date().toISOString(),
        completed: false,
        ...(newNoteDueDate && { dueDate: newNoteDueDate })
      };
      setNotes([...notes, newNote]);
      setNewNoteContent('');
      setNewNoteDueDate('');
      setIsAddingNote(false);
    }
  };

  const addBoard = () => {
    if (newBoardName.trim()) {
      const newBoard = {
        id: Date.now(),
        name: newBoardName,
        color: boardColors[Math.floor(Math.random() * boardColors.length)]
      };
      setBoards([...boards, newBoard]);
      setNewBoardName('');
      setIsAddingBoard(false);
      setSelectedBoard(newBoard.id);
    }
  };

  const deleteNote = (noteId: number) => {
    setNotes(notes.filter(note => note.id !== noteId));
    setExpandedNote(null);
  };

  const deleteBoard = (boardId: number) => {
    const regularBoards = boards.filter(b => b.id !== DONE_BOARD_ID);
    if (regularBoards.length > 1 && boardId !== DONE_BOARD_ID) {
      setBoards(boards.filter(board => board.id !== boardId));
      setNotes(notes.filter(note => note.boardId !== boardId));
      if (selectedBoard === boardId) {
        const remainingBoard = boards.find(b => b.id !== boardId && b.id !== DONE_BOARD_ID);
        if (remainingBoard) {
          setSelectedBoard(remainingBoard.id);
        }
      }
    }
  };

  const updateBoard = (boardId: number, newName: string) => {
    setBoards(boards.map(board =>
      board.id === boardId ? { ...board, name: newName } : board
    ));
    setEditingBoard(null);
  };

  const updateNote = (noteId: number, newContent: string, newDueDate?: string) => {
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        const updatedNote = { ...note, content: newContent };
        if (newDueDate !== undefined) {
          if (newDueDate && newDueDate.trim()) {
            updatedNote.dueDate = newDueDate;
          } else {
            delete updatedNote.dueDate;
          }
        }
        return updatedNote;
      }
      return note;
    }));
    setEditingNote(null);
    setEditingNoteDueDate('');
  };

  const handleDragStart = (e: React.DragEvent, note: Note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, boardId: number) => {
    e.preventDefault();
    if (draggedNote) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 75;
      const y = e.clientY - rect.top - 75;

      setNotes(notes.map(note =>
        note.id === draggedNote.id
          ? { ...note, boardId, x: Math.max(0, Math.min(x, rect.width - 150)), y: Math.max(0, Math.min(y, rect.height - 150)) }
          : note
      ));
      setDraggedNote(null);
    }
  };

  const currentBoard = boards.find(b => b.id === selectedBoard);
  const boardNotes = notes.filter(note => note.boardId === selectedBoard);

  // If somehow the Done board is selected in board view, switch to first regular board
  useEffect(() => {
    if (viewMode === 'board' && selectedBoard === DONE_BOARD_ID) {
      const regularBoards = boards.filter(b => b.id !== DONE_BOARD_ID);
      if (regularBoards.length > 0) {
        setSelectedBoard(regularBoards[0].id);
      }
    }
  }, [viewMode, selectedBoard, boards]);

  // ListView Component
  const ListView = () => (
    <div className="space-y-6">
      {/* Add Note Button for List View */}
      <div className="flex justify-between items-center">
        <h2 className="text-green-400 font-mono text-lg">[ALL BOARDS & NOTES]</h2>
        <button
          onClick={() => setIsAddingNote(true)}
          className="bg-black border border-green-400 text-green-400 hover:bg-green-900 hover:shadow-[0_0_15px_rgba(74,222,128,0.5)] px-4 py-2 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          [ADD NOTE]
        </button>
      </div>

      {boards.filter(board => board.id !== DONE_BOARD_ID).map(board => {
        const boardNotes = notes.filter(note => note.boardId === board.id);

        return (
          <div key={board.id} className="border border-green-600 bg-black">
            {/* Board Header */}
            <div className="bg-green-900 border-b border-green-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {editingBoard === board.id ? (
                    <input
                      type="text"
                      defaultValue={board.name}
                      className="bg-transparent outline-none text-green-100 font-mono text-lg border-b border-green-400"
                      onBlur={(e) => updateBoard(board.id, (e.target as HTMLInputElement).value)}
                      onKeyPress={(e) => e.key === 'Enter' && updateBoard(board.id, (e.target as HTMLInputElement).value)}
                      autoFocus
                    />
                  ) : (
                    <>
                      <h3 className="text-green-100 font-mono text-lg flex items-center gap-2">
                        {board.isDoneBoard && <CheckCircle size={16} />}
                        [{board.name}]
                      </h3>
                      {!board.isDoneBoard && (
                        <button
                          onClick={() => setEditingBoard(board.id)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-300 text-sm font-mono">
                    {boardNotes.length} notes
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBoard(board.id);
                      setViewMode('board');
                    }}
                    className="text-green-400 hover:text-green-300 transition-colors px-2 py-1 border border-green-600 hover:border-green-400 text-xs"
                  >
                    [VIEW BOARD]
                  </button>
                  {boards.length > 1 && !board.isDoneBoard && (
                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notes List */}
            <div className="p-4">
              {boardNotes.length === 0 ? (
                <div className="text-green-600 font-mono text-sm italic text-center py-8">
                  {"> No notes in this board"}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {boardNotes.map(note => (
                    <div
                      key={note.id}
                      className={`${note.color} border-2 p-4 transition-all hover:shadow-[0_0_10px_rgba(74,222,128,0.3)] cursor-pointer`}
                      onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                    >
                      <div className="relative">
                        <div className="absolute -top-2 -left-2 text-xs opacity-50">╔═╗</div>
                        <div className="absolute -bottom-2 -right-2 text-xs opacity-50">╚═╝</div>

                        {editingNote === note.id ? (
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              defaultValue={note.content}
                              className="w-full h-20 bg-transparent resize-none outline-none text-sm font-mono border border-green-600 p-2"
                              ref={(el) => {
                                if (el) {
                                  el.focus();
                                }
                              }}
                            />
                            <div className="space-y-1">
                              <label className="block text-green-400 text-xs font-mono">
                                [DUE DATE/TIME]
                              </label>
                              <input
                                type="datetime-local"
                                defaultValue={note.dueDate ? note.dueDate.slice(0, 16) : ''}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                min={formatDateTimeForInput(new Date())}
                                className="w-full bg-transparent border border-green-600 text-green-300 font-mono text-xs p-1 pr-2 outline-none overflow-x-auto"
                                style={{ WebkitAppearance: 'none', minWidth: '100%' }}
                                placeholder="Optional due date"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const textarea = e.currentTarget.parentElement?.parentElement?.querySelector('textarea') as HTMLTextAreaElement;
                                  const dateInput = e.currentTarget.parentElement?.parentElement?.querySelector('input[type="datetime-local"]') as HTMLInputElement;
                                  updateNote(note.id, textarea?.value || note.content, dateInput?.value || undefined);
                                }}
                                className="bg-green-900 border border-green-400 text-green-100 p-1 hover:bg-green-800 transition-colors flex-1 text-xs"
                              >
                                [SAVE]
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNote(null);
                                  setEditingNoteDueDate('');
                                }}
                                className="bg-red-900 border border-red-400 text-red-100 p-1 hover:bg-red-800 transition-colors text-xs"
                              >
                                [CANCEL]
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={note.completed || false}
                                onChange={() => toggleNoteCompletion(note.id)}
                                size="medium"
                              />
                              <p className="font-mono text-sm leading-relaxed flex-1">
                                {note.content}
                              </p>
                            </div>
                            <div className="space-y-1">
                              {board.id === DONE_BOARD_ID ? (
                                <>
                                  <div className="text-xs text-yellow-400">
                                    <span className="text-green-600">[FROM]</span> {note.originalBoardName}
                                  </div>
                                  <div className="text-xs text-green-300 border-t border-green-800 pt-2">
                                    <span className="text-green-600">[COMPLETED]</span> {note.completedAt ? formatCompletionDate(note.completedAt) : 'Unknown'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <CountdownDisplay dueDate={note.dueDate} isExpanded={true} />
                                  <div className="text-xs text-green-300 border-t border-green-800 pt-2">
                                    <span className="text-green-600">[CREATED]</span> {new Date(note.createdAt).toLocaleDateString()}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3 pt-2 border-t border-green-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNote(note.id);
                            }}
                            className="bg-black border border-green-400 text-green-400 p-1 hover:bg-green-900 transition-colors flex-1 text-xs"
                          >
                            <Edit2 size={12} className="mx-auto" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="bg-red-900 border border-red-400 text-red-100 p-1 hover:bg-red-800 transition-colors flex-1 text-xs"
                          >
                            <Trash2 size={12} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Board Section in List View */}
      <div className="border border-green-800 border-dashed bg-black/50">
        <button
          onClick={() => setIsAddingBoard(true)}
          className="w-full p-8 text-green-600 hover:text-green-400 hover:bg-green-900/20 transition-all flex items-center justify-center gap-3"
        >
          <Plus size={24} />
          <span className="font-mono">[CREATE NEW BOARD]</span>
        </button>
      </div>
    </div>
  );

  // DoneView Component
  const DoneView = () => {
    const doneNotes = notes.filter(note => note.boardId === DONE_BOARD_ID);

    return (
      <div className="space-y-6">
        <h2 className="text-green-400 font-mono text-lg flex items-center gap-2">
          <CheckCircle size={20} />
          [COMPLETED NOTES]
        </h2>

        {doneNotes.length === 0 ? (
          <div className="border border-green-600 bg-black p-8 text-center">
            <div className="text-green-600 font-mono text-sm italic">
              {"> No completed notes yet"}
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {doneNotes.map(note => (
              <div
                key={note.id}
                className={`${note.color} border-2 p-4 transition-all hover:shadow-[0_0_10px_rgba(74,222,128,0.3)] cursor-pointer`}
                onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
              >
                <div className="relative">
                  <div className="absolute -top-2 -left-2 text-xs opacity-50">╔═╗</div>
                  <div className="absolute -bottom-2 -right-2 text-xs opacity-50">╚═╝</div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={true}
                        onChange={() => toggleNoteCompletion(note.id)}
                        size="medium"
                      />
                      <p className="font-mono text-sm leading-relaxed flex-1">
                        {note.content}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-yellow-400">
                        <span className="text-green-600">[FROM]</span> {note.originalBoardName}
                      </div>
                      <div className="text-xs text-green-300 border-t border-green-800 pt-2">
                        <span className="text-green-600">[COMPLETED]</span> {note.completedAt ? formatCompletionDate(note.completedAt) : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-2 border-t border-green-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="bg-red-900 border border-red-400 text-red-100 p-1 hover:bg-red-800 transition-colors flex-1 text-xs"
                    >
                      <Trash2 size={12} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* ASCII Art Header */}
        <div className="mb-6">
          <pre className="text-green-400 text-xs leading-none select-none">
            {`╔═══════════════════════════════════════════════════════════════════════════╗
║  ____  _   _      _         _   _       _                                 ║
║ / ___|| |_(_) ___| | ___   _| \\ | | ___ | |_ ___  ___                     ║
║ \\___ \\| __| |/ __| |/ / | | |  \\| |/ _ \\| __/ _ \\/ __|                    ║
║  ___) | |_| | (__|   <| |_| | |\\  | (_) | ||  __/\\__ \\                    ║
║ |____/ \\__|_|\\___|_|\\_\\\\__, |_| \\_|\\___/ \\__\\___||___/                    ║
║                        |___/                                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ ${formatDateTime(currentTime).padEnd(73)} ║
╚═══════════════════════════════════════════════════════════════════════════╝`}
          </pre>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex border border-green-600">
              <button
                onClick={() => setViewMode('board')}
                className={`px-4 py-2 font-mono text-sm transition-all flex items-center gap-2 ${viewMode === 'board'
                  ? 'bg-green-900 text-green-100 border-r border-green-400'
                  : 'bg-black text-green-600 hover:text-green-400 border-r border-green-600'
                  }`}
              >
                <Layout size={16} />
                [BOARD VIEW]
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 font-mono text-sm transition-all flex items-center gap-2 ${viewMode === 'list'
                  ? 'bg-green-900 text-green-100 border-r border-green-400'
                  : 'bg-black text-green-600 hover:text-green-400 border-r border-green-600'
                  }`}
              >
                <List size={16} />
                [LIST VIEW]
              </button>
              <button
                onClick={() => setViewMode('done')}
                className={`px-4 py-2 font-mono text-sm transition-all flex items-center gap-2 ${viewMode === 'done'
                  ? 'bg-green-900 text-green-100'
                  : 'bg-black text-green-600 hover:text-green-400'
                  }`}
              >
                <CheckCircle size={16} />
                [DONE VIEW]
              </button>
            </div>

            {/* Save Indicator */}
            <div className={`transition-opacity duration-500 ${showSaveIndicator ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-xs text-black bg-green-400 px-3 py-1">
                [✓ SAVED]
              </span>
            </div>
          </div>
          {/* Clear Data Button */}
          <button
            onClick={clearAllData}
            className="text-xs text-red-400 hover:bg-red-900 px-3 py-1 border border-red-600 hover:border-red-400 transition-colors"
          >
            [CLEAR ALL DATA]
          </button>
        </div>

        {/* Conditional View Rendering */}
        {viewMode === 'list' ? (
          <ListView />
        ) : viewMode === 'done' ? (
          <DoneView />
        ) : (
          <>
            {/* Board Tabs - Only show in board view */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 pt-3 px-3">
              {boards.filter(board => board.id !== DONE_BOARD_ID).map(board => (
                <div key={board.id} className="relative group">
                  <button
                    onClick={() => setSelectedBoard(board.id)}
                    className={`px-4 py-2 font-mono text-sm transition-all border ${selectedBoard === board.id
                      ? 'bg-green-900 text-green-100 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                      : 'bg-black text-green-600 border-green-800 hover:border-green-600 hover:text-green-400'
                      }`}
                  >
                    {editingBoard === board.id ? (
                      <input
                        type="text"
                        defaultValue={board.name}
                        className="bg-transparent outline-none text-green-100"
                        onBlur={(e) => updateBoard(board.id, (e.target as HTMLInputElement).value)}
                        onKeyPress={(e) => e.key === 'Enter' && updateBoard(board.id, (e.target as HTMLInputElement).value)}
                        autoFocus
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        {board.isDoneBoard && <CheckCircle size={14} />}
                        [{board.name}]
                        {!board.isDoneBoard && (
                          <Edit2
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBoard(board.id);
                            }}
                          />
                        )}
                      </span>
                    )}
                  </button>
                  {boards.length > 1 && !board.isDoneBoard && (
                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="absolute -top-1 -right-1 bg-red-900 text-red-100 border border-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setIsAddingBoard(true)}
                className="px-4 py-2 bg-black border border-green-800 text-green-600 hover:border-green-400 hover:text-green-300 transition-all flex items-center gap-2 text-sm"
              >
                <Plus size={18} />
                [NEW BOARD]
              </button>
            </div>

            {/* Board Container with ASCII Border - Only show in board view */}
            <div className="relative overflow-hidden">
              <div className="text-green-500 text-xs leading-none select-none font-mono whitespace-pre overflow-hidden">
                <div className="flex">
                  <span>┌</span>
                  <span className="flex-1 overflow-hidden">{'─'.repeat(200)}</span>
                  <span>┐</span>
                </div>
              </div>
              <div
                ref={boardRef}
                className={`relative ${currentBoard?.color} p-6 min-h-[600px] transition-colors duration-300`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, selectedBoard)}
              >
                {/* ASCII Grid Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <pre className="text-green-600 text-xs leading-tight">
                    {gridPattern}
                  </pre>
                </div>

                {/* Add Note Button */}
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="absolute top-4 right-4 bg-black border border-green-400 text-green-400 hover:bg-green-900 hover:shadow-[0_0_15px_rgba(74,222,128,0.5)] p-3 transition-all z-10"
                >
                  <Plus size={24} />
                </button>

                {/* Sticky Notes */}
                {boardNotes.map(note => {
                  const isOverdue = note.dueDate && calculateTimeRemaining(note.dueDate).isOverdue;

                  return (
                    <div
                      key={note.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, note)}
                      style={{
                        left: `${note.x}px`,
                        top: `${note.y}px`,
                        transform: expandedNote === note.id ? 'scale(1.8)' : 'scale(1)',
                        zIndex: expandedNote === note.id ? 20 : 10
                      }}
                      className={`absolute w-40 h-40 ${isOverdue ? 'bg-red-900/80 border-red-400 text-red-100' : note.color} border-2 ${expandedNote === note.id ? 'p-3' : 'p-2'} cursor-pointer transition-all duration-300 ${expandedNote === note.id ? 'shadow-[0_0_30px_rgba(74,222,128,0.6)]' :
                        isOverdue ? 'shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_20px_rgba(239,68,68,0.7)]' :
                          'hover:shadow-[0_0_10px_rgba(74,222,128,0.3)]'
                        } ${expandedNote === note.id ? 'z-20' : 'hover:scale-105'} ${isOverdue ? 'animate-pulse' : ''}`}
                      onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                    >
                      <div className="relative h-full">
                        <div className="absolute -top-2 -left-2 text-xs opacity-50">╔═╗</div>
                        <div className="absolute -bottom-2 -right-2 text-xs opacity-50">╚═╝</div>

                        {editingNote === note.id ? (
                          <div className="flex flex-col h-full gap-1" onClick={(e) => e.stopPropagation()}>
                            <textarea
                              defaultValue={note.content}
                              className="flex-1 bg-transparent resize-none outline-none text-[10px] font-mono border border-green-600 p-1"
                              ref={(el) => {
                                if (el) {
                                  el.focus();
                                }
                              }}
                            />
                            <div className="space-y-1">
                              <label className="text-green-400 text-[9px] font-mono">[DUE DATE/TIME]</label>
                              <input
                                type="datetime-local"
                                defaultValue={note.dueDate ? new Date(note.dueDate).toISOString().slice(0, 16) : ''}
                                onChange={(e) => setEditingNoteDueDate(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                min={formatDateTimeForInput(new Date())}
                                className="w-full bg-transparent border border-green-600 text-green-300 font-mono text-[9px] p-0.5 pr-2 outline-none overflow-x-auto"
                                style={{ WebkitAppearance: 'none', minWidth: '100%' }}
                                placeholder="Optional"
                              />
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const textarea = e.currentTarget.parentElement?.parentElement?.querySelector('textarea') as HTMLTextAreaElement;
                                  const dateInput = e.currentTarget.parentElement?.parentElement?.querySelector('input[type="datetime-local"]') as HTMLInputElement;
                                  updateNote(note.id, textarea?.value || note.content, dateInput?.value || undefined);
                                }}
                                className="bg-green-900 border border-green-400 text-green-100 p-0.5 hover:bg-green-800 transition-colors flex-1 text-[10px]"
                              >
                                [✓]
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNote(null);
                                  setEditingNoteDueDate('');
                                }}
                                className="bg-red-900 border border-red-400 text-red-100 p-0.5 hover:bg-red-800 transition-colors text-[10px]"
                              >
                                [✗]
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col h-full">
                            {/* Checkbox in top-right corner */}
                            <div className="absolute top-1 right-1">
                              <Checkbox
                                checked={note.completed || false}
                                onChange={() => toggleNoteCompletion(note.id)}
                                size="small"
                              />
                            </div>

                            <p className={`font-mono ${expandedNote === note.id ? 'text-[11px] leading-relaxed' : 'text-[10px] leading-tight'} ${expandedNote === note.id ? '' : 'line-clamp-3'} flex-1 overflow-hidden pr-5`}>
                              {note.content}
                            </p>
                            <div className={`${expandedNote === note.id ? 'mt-2' : 'mt-auto'} space-y-1`}>
                              {selectedBoard === DONE_BOARD_ID ? (
                                <>
                                  <div className={`${expandedNote === note.id ? 'text-[10px]' : 'text-[9px]'} text-yellow-400`}>
                                    <span className="text-green-600">[FROM]</span> {note.originalBoardName}
                                  </div>
                                  <div className={`${expandedNote === note.id ? 'text-[10px]' : 'text-[9px]'} text-green-300 border-t border-green-800 pt-1`}>
                                    <span className="text-green-600">[COMPLETED]</span> {note.completedAt ? formatCompletionDate(note.completedAt) : 'Unknown'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <CountdownDisplay dueDate={note.dueDate} isExpanded={expandedNote === note.id} />
                                  <div className={`${expandedNote === note.id ? 'text-[10px]' : 'text-[9px]'} text-green-300 border-t border-green-800 pt-1`}>
                                    <span className="text-green-600">[CREATED]</span> {new Date(note.createdAt).toLocaleDateString()}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {expandedNote === note.id && (
                          <div className="absolute -bottom-10 left-0 right-0 flex gap-2 justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNote(note.id);
                              }}
                              className="bg-black border border-green-400 text-green-400 px-3 py-1 hover:bg-green-900 transition-colors text-xs font-mono shadow-lg"
                            >
                              [EDIT]
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                              className="bg-black border border-red-400 text-red-400 px-3 py-1 hover:bg-red-900 transition-colors text-xs font-mono shadow-lg"
                            >
                              [DELETE]
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-green-500 text-xs leading-none select-none font-mono whitespace-pre overflow-hidden">
                <div className="flex">
                  <span>└</span>
                  <span className="flex-1 overflow-hidden">{'─'.repeat(200)}</span>
                  <span>┘</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Note Modal */}
        {isAddingNote && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setIsAddingNote(false)}>
            <div className="bg-black border-2 border-green-400 p-6 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(74,222,128,0.5)]" onClick={(e) => e.stopPropagation()}>
              <pre className="text-green-400 text-xs mb-4">
                {`╔════════════════════════╗
║     ADD NEW NOTE       ║
╚════════════════════════╝`}
              </pre>

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full p-3 bg-black border border-green-600 text-green-300 resize-none h-32 mb-4 font-mono text-sm placeholder-green-800 outline-none focus:border-green-400"
                autoFocus
              />

              <div className="mb-4">
                <label className="block text-green-400 text-sm font-mono mb-2">
                  [DUE DATE/TIME] <span className="text-green-600">(OPTIONAL)</span>
                </label>
                <input
                  type="datetime-local"
                  value={newNoteDueDate}
                  onChange={(e) => setNewNoteDueDate(e.target.value)}
                  min={formatDateTimeForInput(new Date())}
                  className="w-full p-2 bg-black border border-green-600 text-green-300 font-mono text-sm outline-none focus:border-green-400"
                />
              </div>

              {viewMode === 'list' && (
                <div className="mb-4">
                  <label className="block text-green-400 text-sm font-mono mb-2">Select Board:</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(Number(e.target.value))}
                    className="w-full p-2 bg-black border border-green-600 text-green-300 font-mono text-sm outline-none focus:border-green-400"
                  >
                    {boards.filter(board => !board.isDoneBoard).map(board => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={addNote}
                  className="flex-1 bg-green-900 text-green-100 py-2 border border-green-400 hover:bg-green-800 transition-colors font-mono text-sm"
                >
                  [CREATE]
                </button>
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 bg-black border border-red-600 text-red-400 hover:border-red-400 transition-colors font-mono text-sm"
                >
                  [CANCEL]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Board Modal */}
        {isAddingBoard && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setIsAddingBoard(false)}>
            <div className="bg-black border-2 border-green-400 p-6 max-w-md w-full mx-4 shadow-[0_0_30px_rgba(74,222,128,0.5)]" onClick={(e) => e.stopPropagation()}>
              <pre className="text-green-400 text-xs mb-4">
                {`╔════════════════════════╗
║   CREATE NEW BOARD     ║
╚════════════════════════╝`}
              </pre>

              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name..."
                className="w-full p-3 bg-black border border-green-600 text-green-300 mb-4 font-mono text-sm placeholder-green-800 outline-none focus:border-green-400"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && addBoard()}
              />

              <div className="flex gap-2">
                <button
                  onClick={addBoard}
                  className="flex-1 bg-green-900 text-green-100 py-2 border border-green-400 hover:bg-green-800 transition-colors font-mono text-sm"
                >
                  [CREATE]
                </button>
                <button
                  onClick={() => setIsAddingBoard(false)}
                  className="px-4 py-2 bg-black border border-red-600 text-red-400 hover:border-red-400 transition-colors font-mono text-sm"
                >
                  [CANCEL]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyNotesApp;
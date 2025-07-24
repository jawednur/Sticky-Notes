import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check, Trash2, Grid3X3 } from 'lucide-react';

const StickyNotesApp = () => {
  const [boards, setBoards] = useState([
    { id: 1, name: 'Marketing Campaign', color: 'bg-blue-100' },
    { id: 2, name: 'Product Development', color: 'bg-green-100' }
  ]);

  const [notes, setNotes] = useState([
    { id: 1, boardId: 1, content: 'Review Q4 marketing budget', color: 'bg-yellow-200', x: 20, y: 20 },
    { id: 2, boardId: 1, content: 'Schedule social media posts', color: 'bg-pink-200', x: 180, y: 40 },
    { id: 3, boardId: 2, content: 'User testing feedback review', color: 'bg-blue-200', x: 30, y: 60 }
  ]);

  const [selectedBoard, setSelectedBoard] = useState(1);
  const [expandedNote, setExpandedNote] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-yellow-200');
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [draggedNote, setDraggedNote] = useState(null);

  const noteColors = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-orange-200'];
  const boardColors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-red-100', 'bg-yellow-100', 'bg-gray-100'];

  const addNote = () => {
    if (newNoteContent.trim()) {
      const newNote = {
        id: Date.now(),
        boardId: selectedBoard,
        content: newNoteContent,
        color: selectedColor,
        x: Math.random() * 300 + 20,
        y: Math.random() * 200 + 20
      };
      setNotes([...notes, newNote]);
      setNewNoteContent('');
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

  const deleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
    setExpandedNote(null);
  };

  const deleteBoard = (boardId) => {
    if (boards.length > 1) {
      setBoards(boards.filter(board => board.id !== boardId));
      setNotes(notes.filter(note => note.boardId !== boardId));
      if (selectedBoard === boardId) {
        setSelectedBoard(boards.find(b => b.id !== boardId).id);
      }
    }
  };

  const updateBoard = (boardId, newName) => {
    setBoards(boards.map(board =>
      board.id === boardId ? { ...board, name: newName } : board
    ));
    setEditingBoard(null);
  };

  const updateNote = (noteId, newContent) => {
    setNotes(notes.map(note =>
      note.id === noteId ? { ...note, content: newContent } : note
    ));
    setEditingNote(null);
  };

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, boardId) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Digital Sticky Notes</h1>
          <p className="text-gray-600">Organize your thoughts across different project boards</p>
        </div>

        {/* Board Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {boards.map(board => (
            <div key={board.id} className="relative group">
              <button
                onClick={() => setSelectedBoard(board.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedBoard === board.id
                    ? 'bg-white shadow-md text-gray-800 scale-105'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
              >
                {editingBoard === board.id ? (
                  <input
                    type="text"
                    defaultValue={board.name}
                    className="bg-transparent outline-none"
                    onBlur={(e) => updateBoard(board.id, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && updateBoard(board.id, e.target.value)}
                    autoFocus
                  />
                ) : (
                  <span className="flex items-center gap-2">
                    {board.name}
                    <Edit2
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBoard(board.id);
                      }}
                    />
                  </span>
                )}
              </button>
              {boards.length > 1 && (
                <button
                  onClick={() => deleteBoard(board.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setIsAddingBoard(true)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            New Board
          </button>
        </div>

        {/* Board Container */}
        <div
          className={`relative ${currentBoard?.color} rounded-xl p-6 min-h-[600px] shadow-xl transition-colors duration-300`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, selectedBoard)}
        >
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 opacity-5">
            <Grid3X3 className="w-full h-full" />
          </div>

          {/* Add Note Button */}
          <button
            onClick={() => setIsAddingNote(true)}
            className="absolute top-4 right-4 bg-white shadow-lg rounded-full p-3 hover:scale-110 transition-transform z-10"
          >
            <Plus size={24} className="text-gray-700" />
          </button>

          {/* Sticky Notes */}
          {boardNotes.map(note => (
            <div
              key={note.id}
              draggable
              onDragStart={(e) => handleDragStart(e, note)}
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                transform: expandedNote === note.id ? 'scale(2)' : 'scale(1)',
                zIndex: expandedNote === note.id ? 20 : 10
              }}
              className={`absolute w-40 h-40 ${note.color} rounded-lg shadow-lg p-3 cursor-pointer transition-all duration-300 hover:shadow-xl ${expandedNote === note.id ? 'z-20' : 'hover:scale-105'
                }`}
              onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
            >
              <div className="relative h-full">
                {editingNote === note.id ? (
                  <textarea
                    defaultValue={note.content}
                    className="w-full h-full bg-transparent resize-none outline-none text-sm"
                    onBlur={(e) => updateNote(note.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <p className={`text-gray-800 ${expandedNote === note.id ? 'text-sm' : 'text-xs'} line-clamp-6`}>
                    {note.content}
                  </p>
                )}

                {expandedNote === note.id && (
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNote(note.id);
                      }}
                      className="bg-white rounded-full p-1 shadow hover:shadow-md transition-shadow"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="bg-red-500 text-white rounded-full p-1 shadow hover:shadow-md transition-shadow"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Paper corner effect */}
              <div className="absolute bottom-0 right-0 w-6 h-6">
                <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[24px] border-t-transparent border-r-[24px] border-r-white/30"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Note Modal */}
        {isAddingNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAddingNote(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold mb-4">Add New Note</h3>

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="What do you need to remember?"
                className="w-full p-3 border rounded-lg resize-none h-32 mb-4"
                autoFocus
              />

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Choose color:</p>
                <div className="flex gap-2">
                  {noteColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 ${color} rounded-lg ${selectedColor === color ? 'ring-2 ring-gray-800 ring-offset-2' : ''
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addNote}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Note
                </button>
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Board Modal */}
        {isAddingBoard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAddingBoard(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold mb-4">Create New Board</h3>

              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name (e.g., Weekly Tasks)"
                className="w-full p-3 border rounded-lg mb-4"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && addBoard()}
              />

              <div className="flex gap-2">
                <button
                  onClick={addBoard}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Board
                </button>
                <button
                  onClick={() => setIsAddingBoard(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
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
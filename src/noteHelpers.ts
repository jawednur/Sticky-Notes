import { Note, Board, DONE_BOARD_ID } from './types';

export const completeNote = (
    note: Note,
    boards: Board[]
): Note => {
    const originalBoard = boards.find(b => b.id === note.boardId);

    return {
        ...note,
        completed: true,
        completedAt: new Date().toISOString(),
        originalBoardId: note.boardId,
        originalBoardName: originalBoard?.name || 'Unknown Board',
        boardId: DONE_BOARD_ID,
        // Reset position for done board
        x: Math.random() * 300 + 20,
        y: Math.random() * 200 + 20,
    };
};

export const uncompleteNote = (note: Note): Note => {
    if (!note.originalBoardId) return note;

    return {
        ...note,
        completed: false,
        completedAt: undefined,
        boardId: note.originalBoardId,
        originalBoardId: undefined,
        originalBoardName: undefined,
        // Reset position for original board
        x: Math.random() * 300 + 20,
        y: Math.random() * 200 + 20,
    };
};

export const formatCompletionDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes} min ago`;
        }
        return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}; 
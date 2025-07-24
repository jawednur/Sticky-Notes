export interface Board {
    id: number;
    name: string;
    color: string;
    isDoneBoard?: boolean;
}

export interface Note {
    id: number;
    boardId: number;
    content: string;
    color: string;
    x: number;
    y: number;
    createdAt: string;
    dueDate?: string;
    completed?: boolean;
    completedAt?: string;
    originalBoardId?: number;
    originalBoardName?: string;
}

export interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
}

export const DONE_BOARD_ID = -1; // Special ID for the done board 
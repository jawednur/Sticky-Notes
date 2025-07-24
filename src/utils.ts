// Utility functions for countdown timer and date formatting

export interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
    totalSeconds: number;
}

export const calculateTimeRemaining = (dueDate: string): TimeRemaining => {
    const now = new Date().getTime();
    const due = new Date(dueDate).getTime();
    const difference = due - now;

    const isOverdue = difference < 0;
    const absDifference = Math.abs(difference);

    const days = Math.floor(absDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDifference % (1000 * 60)) / 1000);

    return {
        days,
        hours,
        minutes,
        seconds,
        isOverdue,
        totalSeconds: Math.floor(absDifference / 1000)
    };
};

export const formatTimeRemaining = (timeRemaining: TimeRemaining): string => {
  const { days, hours, minutes, seconds } = timeRemaining;
  
  // Format with leading zeros for terminal-style display
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  if (days > 0) {
    return `${days}d:${pad(hours)}h:${pad(minutes)}m:${pad(seconds)}s`;
  } else if (hours > 0) {
    return `${hours}h:${pad(minutes)}m:${pad(seconds)}s`;
  } else if (minutes > 0) {
    return `${minutes}m:${pad(seconds)}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatDateTimeForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
}; 
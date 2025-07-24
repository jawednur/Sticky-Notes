import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: 'small' | 'medium';
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, size = 'small' }) => {
    const sizeClasses = size === 'small'
        ? 'w-4 h-4 text-[10px]'
        : 'w-5 h-5 text-xs';

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onChange(!checked);
            }}
            className={`${sizeClasses} border border-green-400 bg-black hover:bg-green-900/30 transition-all flex items-center justify-center cursor-pointer`}
        >
            {checked && (
                <Check size={size === 'small' ? 12 : 16} className="text-green-400" />
            )}
        </button>
    );
}; 
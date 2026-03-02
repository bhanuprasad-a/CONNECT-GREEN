import React from 'react';

const PrimaryButton = ({ children, onClick, className = '', type = 'button', ...props }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`flex justify-center py-2.5 px-4 rounded-md shadow-[0_0_15px_rgba(34,197,94,0.3)] text-sm font-medium text-darkBg bg-neonGreen hover:bg-accentGreen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neonGreen focus:ring-offset-darkBg transition-all ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default PrimaryButton;

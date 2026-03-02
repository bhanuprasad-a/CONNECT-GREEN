import React from 'react';

const InputField = ({ label, type = 'text', name, value, onChange, required = false, minLength, placeholder = '', className = '' }) => {
    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-stone-300">{label}</label>}
            <div className="mt-1">
                <input
                    type={type}
                    name={name}
                    required={required}
                    value={value}
                    onChange={onChange}
                    minLength={minLength}
                    placeholder={placeholder}
                    className="appearance-none block w-full px-3 py-2 border border-stone-700 rounded-md shadow-sm placeholder-stone-500 bg-darkBg text-white focus:outline-none focus:ring-neonGreen focus:border-neonGreen sm:text-sm"
                />
            </div>
        </div>
    );
};

export default InputField;

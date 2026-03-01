'use client';

import { useState, useEffect } from 'react';

export default function CurrencyInput({
    value,
    onChange,
    placeholder = '0',
    className = 'form-input',
    disabled = false,
    min = 0,
}) {
    const [displayValue, setDisplayValue] = useState('');

    // Sincronize display value with actual numeric value
    useEffect(() => {
        if (value === undefined || value === null || value === '') {
            setDisplayValue('');
            return;
        }

        // Format numeric value with dots
        const formatted = new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 0
        }).format(value);

        setDisplayValue(formatted);
    }, [value]);

    const handleChange = (e) => {
        // Remove all non-digit characters
        const rawValue = e.target.value.replace(/\D/g, '');

        if (rawValue === '') {
            setDisplayValue('');
            onChange(0);
            return;
        }

        const numValue = parseInt(rawValue, 10);

        // Format for display
        const formatted = new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 0
        }).format(numValue);

        setDisplayValue(formatted);
        onChange(numValue);
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            className={className}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            min={min}
        />
    );
}

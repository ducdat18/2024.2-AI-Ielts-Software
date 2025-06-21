import React from 'react';
import { FieldError } from './FieldError';

interface TextInputProps {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'date';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  ...props
}) => {
  return (
    <div className="form-field space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
        }`}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        {...props}
      />
      {error && <FieldError message={error} />}
    </div>
  );
};

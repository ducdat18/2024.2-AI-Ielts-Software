import React from 'react';
import { FieldError } from './FieldError';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  options,
  error,
  disabled = false,
  required = false,
}) => {
  return (
    <div className="form-field space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label} {required && '*'}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
        }`}
        disabled={disabled}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <FieldError message={error} />}
    </div>
  );
};

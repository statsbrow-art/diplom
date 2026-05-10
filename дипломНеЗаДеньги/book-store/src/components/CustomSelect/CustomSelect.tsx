import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './CustomSelect.css';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Выберите...',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-wrapper" ref={selectRef}>
      {label && <label className="custom-select-label">{label}</label>}
      <div 
        className={`custom-select ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="custom-select-trigger">
          <span className={selectedOption ? '' : 'placeholder'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={18} className="custom-select-arrow" />
        </div>
        
        <div className="custom-select-options">
          {options.map(option => (
            <div
              key={option.value}
              className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.value);
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={16} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomSelect;


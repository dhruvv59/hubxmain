"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  allowCustomInput?: boolean;
  onCustomInput?: (inputValue: string) => void;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  searchPlaceholder = "Search...",
  allowCustomInput = false,
  onCustomInput
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [customText, setCustomText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Get selected label
  const selectedOption = options.find(opt => opt.id === value);
  const selectedLabel = selectedOption?.label || customText || placeholder;

  // Reset search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      inputRef.current?.focus();
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Handle clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          // Select from filtered options
          onChange(filteredOptions[highlightedIndex].id);
          setIsOpen(false);
        } else if (allowCustomInput && search.trim()) {
          // Allow custom input if no options match
          setCustomText(search.trim());
          onCustomInput?.(search.trim());
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Main Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-11 px-4 rounded-lg border border-gray-200 text-sm font-bold text-left flex items-center justify-between transition-all",
          disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white text-gray-900 hover:border-indigo-300",
          isOpen && "border-indigo-500 ring-1 ring-indigo-500"
        )}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white rounded-t-lg">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="max-h-[250px] overflow-y-auto"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-sm text-left transition-colors",
                    index === highlightedIndex
                      ? "bg-indigo-500 text-white font-semibold"
                      : value === option.id
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {option.label}
                </button>
              ))
            ) : allowCustomInput && search.trim() ? (
              <button
                type="button"
                onClick={() => {
                  setCustomText(search.trim());
                  onCustomInput?.(search.trim());
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-sm text-left transition-colors font-semibold",
                  highlightedIndex === 0
                    ? "bg-indigo-500 text-white"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                )}
              >
                + Use "{search.trim()}"
              </button>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                {allowCustomInput && search.trim()
                  ? "No matches. Press Enter to add custom value."
                  : "No options found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

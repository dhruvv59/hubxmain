"use client";

import React from "react";

interface MathSymbolsToolbarProps {
  onInsertSymbol: (symbol: string) => void;
}

export function MathSymbolsToolbar({ onInsertSymbol }: MathSymbolsToolbarProps) {
  const symbols = ["(", ")", "[", "]", "{", "}", "²", "³", "±", "×", "÷", "≤", "≥", "√", "π", "|"];

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-2">
      <span className="text-[11px] font-semibold text-gray-500 w-full sm:w-auto">Math symbols:</span>
      {symbols.map((symbol) => (
        <button
          key={symbol}
          type="button"
          onClick={() => onInsertSymbol(symbol)}
          className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded border border-gray-200 bg-white text-xs font-semibold text-gray-800 hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex-shrink-0"
          title={`Insert ${symbol}`}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
}

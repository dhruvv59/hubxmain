"use client";

import React from "react";
import { MATH_SYMBOLS } from "@/types/question-bank";

interface MathSymbolsToolbarProps {
  onInsertSymbol: (symbol: string) => void;
}

export function MathSymbolsToolbar({ onInsertSymbol }: MathSymbolsToolbarProps) {
  const commonSymbols = ["²", "³", "±", "×", "÷", "≤", "≥", "√", "π"];

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg overflow-x-auto flex-wrap">
      <span className="text-xs font-medium text-gray-600 mr-2 whitespace-nowrap">Math:</span>
      {commonSymbols.map((symbol) => (
        <button
          key={symbol}
          type="button"
          onClick={() => onInsertSymbol(symbol)}
          className="px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 hover:border-gray-400 transition-colors min-w-[32px]"
          title={`Insert ${symbol}`}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
}

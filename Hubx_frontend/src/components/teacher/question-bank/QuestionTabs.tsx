"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { QuestionBankQuestion } from "@/types/question-bank";
import { cn } from "@/lib/utils";

interface QuestionTabsProps {
  questions: QuestionBankQuestion[];
  activeIndex: number;
  onTabClick: (index: number) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
}

export function QuestionTabs({
  questions,
  activeIndex,
  onTabClick,
  onAddQuestion,
  onRemoveQuestion,
}: QuestionTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-0">
          {questions.map((question, index) => (
            <div
              key={question.id || index}
              className={cn(
                "relative group",
                index === activeIndex && "border-b-2 border-[#6366f1]"
              )}
            >
              <button
                onClick={() => onTabClick(index)}
                className={cn(
                  "px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                  index === activeIndex
                    ? "text-[#6366f1] border-[#6366f1]"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                )}
              >
                Question {index + 1}
              </button>

              {questions.length > 1 && (
                <button
                  onClick={() => onRemoveQuestion(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                  title="Remove this question"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Add Question Button */}
          <button
            onClick={onAddQuestion}
            className="px-3 py-4 text-gray-600 hover:text-[#6366f1] transition-colors border-b-2 border-transparent hover:border-[#6366f1] flex items-center gap-1"
            title="Add new question"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

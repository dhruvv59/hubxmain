"use client";

import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css"; // Ensure CSS is imported
import { X } from "lucide-react";

interface MathPreviewModalProps {
    text: string;
    onClose: () => void;
    title?: string;
}

export function MathPreviewModal({ text, onClose, title = "Math Preview" }: MathPreviewModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            try {
                // Render the text mixed with math
                // This is a simple implementation. For complex mixed content, you might need a parser like 'react-latex-next' or similar.
                // However, if the text is pure latex or standard text with delimiters, we can try to render it.
                // If the user inputs raw latex without delimiters, we might wrap it.
                // Let's assume the user uses standard delimiters or just wants to see the latex rendered.

                // Basic rendering: render the string. If it fails, show raw text.
                // But katex.render expects an element.
                // We can use 'renderToString' and set HTML.

                // Auto-render extension is often used for mixed text. Since we don't have it explicitly imported,
                // we will try to render the whole block if it looks like math, or just display text.
                // Actually, for a "Math Preview", usually we render the content.

                // Let's try to render assuming it might contain $...$ or just be latex.
                // A simple approach without auto-render extension is tricky for mixed text.
                // Given the context is likely "Type Question", it might be mixed.

                // If we can't reliably mix, let's just render it as a block for now or assume delimiters.
                // If 'katex' is installed, we can use `katex.render(text, element, { throwOnError: false })`.

                katex.render(text, containerRef.current, {
                    throwOnError: false,
                    displayMode: false, // inline by default
                    output: "html",
                });
            } catch (e) {
                console.error("Katex error:", e);
                if (containerRef.current) containerRef.current.innerText = text;
            }
        }
    }, [text]);

    // Handle Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[60vh]">
                    <div
                        ref={containerRef}
                        className="text-lg text-gray-800 leading-relaxed break-words"
                    >
                        {/* Katex content will be injected here */}
                    </div>
                    {text.trim() === "" && (
                        <p className="text-gray-400 italic text-center">No content to preview</p>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

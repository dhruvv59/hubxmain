"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Compass, Sparkles } from "lucide-react";

export function Banners() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Approved Excursion - Left Card (Spans 2 columns on md) */}
            <Link href="/teacher/excursion" className="md:col-span-2">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#fef3c7] via-[#e0f2fe] to-[#fbcfe8] shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer h-full">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border-2 border-black flex items-center justify-center bg-yellow-50 flex-shrink-0">
                                <Compass className="w-6 h-6 text-black flex-shrink-0" />
                            </div>
                            <p className="text-base font-black text-gray-900 italic">Approved Excursion</p>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-black flex items-center justify-center bg-gray-900 flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
                    </div>
                </div>
            </Link>

            {/* AI Smart Generator - Right Card (1 column) */}
            <Link href="/teacher/x-factor" className="md:col-span-1">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#f3e8ff] via-[#fae8ff] to-[#fce7f3] shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer h-full">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full border-2 border-purple-300 flex items-center justify-center bg-purple-50 flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-[#9333ea] flex-shrink-0 fill-current" />
                            </div>
                            <div className="flex flex-col">
                                {/* <p className="text-xs font-bold text-gray-700 uppercase tracking-widest italic">AI Smart</p> */}
                                <p className="text-base font-black text-gray-900 italic">X-Factor</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full border-2 border-purple-300 flex items-center justify-center bg-purple-100 flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    </div>
                </div>
            </Link>
        </div>
    );
}

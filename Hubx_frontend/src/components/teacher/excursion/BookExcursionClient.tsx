"use client";

import React, { useState } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { BookExcursionForm } from "@/components/teacher/excursion/BookExcursionForm";
import { ExcursionSummary } from "@/components/teacher/excursion/ExcursionSummary";
import { BookExcursionSuccess } from "@/components/teacher/excursion/BookExcursionSuccess";
import { useRouter } from "next/navigation";

export default function BookExcursionClient() {
    const router = useRouter();
    const [isSubmitted, setIsSubmitted] = useState(false);

    // State management for lifting state up
    const [bookingData, setBookingData] = useState({
        standard: "",
        students: "",
        date: undefined as Date | undefined,
        timeSlot: ""
    });

    const handleSubmit = () => {
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col h-full max-w-7xl mx-auto w-full items-center justify-center">
                <BookExcursionSuccess />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center gap-3 text-gray-900 mb-1">
                    <button
                        onClick={() => router.back()}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <h1 className="text-2xl font-bold">Book Excursion</h1>
                </div>
                <p className="text-gray-500 text-sm ml-10">
                    Find available date and time slot and book your visit
                </p>
            </div>

            {/* Main Content Layout */}
            <div className="flex gap-8 items-start">

                {/* Left Side: Form */}
                <div className="flex-1">
                    <BookExcursionForm
                        companyNameInitial="Glenmark"
                        companyTypeInitial="Biotechnology"
                        onUpdate={setBookingData}
                        onSubmit={handleSubmit}
                    />
                </div>

                {/* Right Side: Summary Sticky */}
                <div className="w-[320px] sticky top-6 space-y-4">
                    <ExcursionSummary
                        companyName="Glenmark"
                        companyType="Biotechnology"
                        standard={bookingData.standard}
                        students={bookingData.students}
                        date={bookingData.date}
                        timeSlot={bookingData.timeSlot}
                    />

                    {/* Warning Card */}
                    <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-2xl p-4 flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4 text-[#f43f5e]" />
                        </div>
                        <p className="text-xs text-[#881337] font-medium leading-relaxed">
                            After submitting this booking, it will be sent to the company for approval. Once approved, you can send consent forms to all students.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

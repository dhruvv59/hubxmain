"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExcursionConsentFormPage() {
    const router = useRouter();

    const handleSend = () => {
        // In a real app, this would trigger an email or process
        router.push("/teacher/excursion");
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full pb-10">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center gap-3 text-gray-900 mb-1">
                    <button
                        onClick={() => router.back()}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <h1 className="text-2xl font-bold">Excursion Consent Form</h1>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 p-4 sm:p-6 md:p-8 shadow-sm">

                {/* Company Header */}
                <div className="bg-[#f9fafb] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
                        {/* Placeholder logo G */}
                        <div className="text-2xl font-black text-red-600">G</div>
                        {/* Replace with Image if available: <Image src="..." ... /> */}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Glenmark</h2>
                        <p className="text-sm text-gray-500 font-medium">Biotechnology</p>
                    </div>
                </div>

                {/* Excursion Details */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Excursion Details</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-8">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Date</p>
                            <p className="text-sm font-bold text-gray-900">Friday, 10th January</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Time</p>
                            <p className="text-sm font-bold text-gray-900">2pm</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Duration</p>
                            <p className="text-sm font-bold text-gray-900">3hrs</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Standard</p>
                            <p className="text-sm font-bold text-gray-900">9th</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Students</p>
                            <p className="text-sm font-bold text-gray-900">30</p>
                        </div>
                    </div>
                </div>

                {/* Excursion Agenda */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Excursion Agenda</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 font-medium pl-1">
                        <li>Company overview and history</li>
                        <li>Tour of development labs</li>
                        <li>Interactive coding session</li>
                        <li>Q&A with engineers</li>
                    </ol>
                </div>

                {/* Important Instructions */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Important Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 font-medium pl-1">
                        <li>Bring student ID card</li>
                        <li>Wear formal attire</li>
                        <li>No photography in restricted areas</li>
                        <li>Maintain discipline</li>
                    </ol>
                </div>

                {/* Parent/Guardian Consent */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Parent/Guardian Consent</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-3xl">
                        I hereby give permission for my child to participate in the educational excursion to
                        Tech Innovators Ltdon the specified date. I understand the nature of the visit and agree to the
                        terms and instructions outlined above.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Student Name</label>
                            <div className="h-12 bg-[#f9fafb] rounded-xl w-full border border-gray-100/50"></div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Parent/Guardian Name</label>
                            <div className="h-12 bg-[#f9fafb] rounded-xl w-full border border-gray-100/50"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer Button */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleSend}
                    className="bg-[#5356e3] hover:bg-[#4338ca] text-white font-bold text-sm py-3 px-8 rounded-lg shadow-sm transition-colors"
                >
                    Send Consent Form
                </button>
            </div>
        </div>
    );
}

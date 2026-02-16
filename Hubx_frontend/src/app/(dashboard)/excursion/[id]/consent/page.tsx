import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ExcursionConsentPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] p-6 lg:p-12 font-sans flex flex-col items-center">

            {/* Header */}
            <div className="w-full max-w-3xl flex items-center gap-4 mb-8">
                <Link href="/excursion" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Excursion Consent Form</h1>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-3xl bg-white rounded-[2rem] p-8 lg:p-12 shadow-sm border border-gray-100">

                {/* Company Header */}
                <div className="bg-gray-50 rounded-2xl p-6 flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                        G
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Glenmark</h2>
                        <p className="text-gray-500">Biotechnology</p>
                    </div>
                </div>

                {/* Excursion Details */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Excursion Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <div>
                            <span className="block text-xs text-gray-500 font-medium mb-1">Date</span>
                            <span className="block text-sm font-bold text-gray-800">Friday, 10th January</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 font-medium mb-1">Time</span>
                            <span className="block text-sm font-bold text-gray-800">2pm</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 font-medium mb-1">Duration</span>
                            <span className="block text-sm font-bold text-gray-800">3hrs</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 font-medium mb-1">Standard</span>
                            <span className="block text-sm font-bold text-gray-800">9th</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500 font-medium mb-1">Students</span>
                            <span className="block text-sm font-bold text-gray-800">30</span>
                        </div>
                    </div>
                </div>

                {/* Excursion Agenda */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Excursion Agenda</h3>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600 font-medium marker:text-gray-400 marker:mr-2">
                        <li>Company overview and history</li>
                        <li>Tour of development labs</li>
                        <li>Interactive coding session</li>
                        <li>Q&A with engineers</li>
                    </ol>
                </div>

                {/* Important Instructions */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Important Instructions</h3>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600 font-medium marker:text-gray-400 marker:mr-2">
                        <li>Bring student ID card</li>
                        <li>Wear formal attire</li>
                        <li>No photography in restricted areas</li>
                        <li>Maintain discipline</li>
                    </ol>
                </div>

                {/* Parent/Guardian Consent */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Parent/Guardian Consent</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        I hereby give permission for my child to participate in the educational excursion to Tech Innovators Ltdon the specified date. I understand the nature of the visit and agree to the terms and instructions outlined above.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Student Name</label>
                            <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Parent/Guardian Name</label>
                            <input type="text" className="w-full bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 mt-8">
                <button className="px-10 py-3 rounded-lg bg-red-400 text-white font-bold text-sm hover:bg-red-500 transition-all shadow-lg shadow-red-200">
                    Reject
                </button>
                <button className="px-10 py-3 rounded-lg bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
                    Approve
                </button>
            </div>

        </div>
    );
}

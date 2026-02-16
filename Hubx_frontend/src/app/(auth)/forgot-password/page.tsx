"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mb-6">
                        <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 14l-1 1-1 1H6v4l-4-4V7a1 1 0 011-1h3z" />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">Forgot Password?</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please contact your school administrator or support team to reset your password.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="text-sm font-medium text-gray-900">Support Contacts:</h3>
                        <ul className="mt-2 text-sm text-gray-600 space-y-1">
                            <li>• Email: support@hubx.com</li>
                            <li>• Phone: +91 98765 43210</li>
                        </ul>
                    </div>

                    <div className="mt-6">
                        <Link
                            href="/login"
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

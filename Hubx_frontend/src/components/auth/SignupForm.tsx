"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { register, RegisterData } from "@/services/auth";
import { cn } from "@/lib/utils";

export function SignupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // User Type State
    const [userType, setUserType] = useState<"student" | "organisation">("student");

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsLoading(true);

        const target = event.target as typeof event.target & {
            firstName: { value: string };
            lastName: { value: string };
            email: { value: string };
            password: { value: string };
        };

        const data: RegisterData = {
            firstName: target.firstName.value,
            lastName: target.lastName.value,
            email: target.email.value,
            password: target.password.value,
            role: userType === "student" ? "STUDENT" : "TEACHER"
        };

        try {
            await register(data);
            // Redirect based on role
            if (data.role === "TEACHER") {
                router.push("/teacher/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (error: any) {
            console.error("Registration failed:", error);
            alert(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 w-full max-w-[480px]">
            <Link href="/" className="absolute top-6 right-6 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-6 w-6 text-black" />
            </Link>

            <div className="flex flex-col items-center space-y-6 pt-2">
                {/* Logo */}
                <div className="relative w-48 h-12">
                    <Image
                        src="/assets/images/logo-full.svg" // Kept original svg path, Login uses png? Checking...
                        alt="Lernen Hub"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <h1 className="text-xl text-gray-800 font-normal">Create account to get started!</h1>

                {/* Role Toggle - Consistent with Login */}
                <div className="flex w-full bg-gray-100 h-10 p-1 rounded-lg overflow-hidden max-w-[300px] mx-auto relative">
                    <button
                        type="button"
                        onClick={() => setUserType("student")}
                        className={cn(
                            "flex-1 h-full text-sm font-medium rounded-md transition-all duration-200",
                            userType === "student"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "bg-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType("organisation")}
                        className={cn(
                            "flex-1 h-full text-sm font-medium rounded-md transition-all duration-200",
                            userType === "organisation"
                                ? "bg-white text-blue-600 shadow-sm"
                                : "bg-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Start Teaching
                    </button>
                </div>

                <form onSubmit={onSubmit} className="w-full space-y-4 pt-2">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500" htmlFor="firstName">
                                First Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                placeholder="John"
                                className="w-full h-11 px-4 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500" htmlFor="lastName">
                                Last Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                placeholder="Doe"
                                className="w-full h-11 px-4 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500" htmlFor="email">
                            Email<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            className="w-full h-11 px-4 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500" htmlFor="password">
                            Password<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create password"
                                className="w-full h-11 px-4 rounded-lg bg-gray-100 border-none text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all pr-10"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <input
                            id="terms"
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-500 leading-tight">
                            By signing up you <Link href="/terms" className="underline font-medium text-gray-700">agree to terms & conditions<span className="text-red-500">*</span></Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-lg bg-blue-400 text-white font-semibold text-lg shadow-lg hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Link href="/login">
                        <div className="w-full h-12 rounded-lg border border-gray-200 flex items-center justify-center text-gray-900 font-medium hover:bg-gray-50 transition-colors">
                            Already have an account? Login
                        </div>
                    </Link>
                </form>
            </div>
        </div>
    );
}

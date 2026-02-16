"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { login } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState<"student" | "organisation">("organisation");
    const [showPassword, setShowPassword] = useState(false);

    const { login: setAuthUser } = useAuth(); // Rename to avoid conflict with service login

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setIsLoading(true);

        try {
            const email = (event.target as any).email.value;
            const password = (event.target as any).password.value;

            // 1. Call API service to get token & user data
            const user = await login({ email, password, role: userType });

            // 2. Update Context State immediately
            setAuthUser(user);

            // 3. Redirect based on role
            if (user.role === 'TEACHER' || user.role === 'SUPER_ADMIN') {
                router.push("/teacher");
            } else {
                router.push("/dashboard");
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            const message = error?.message || "Login failed. Please check your credentials.";
            alert(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-[#f9fafb] rounded-[24px] p-8 shadow-xl relative animate-in fade-in zoom-in duration-300 w-full max-w-[440px]">
            <Link href="/" className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="h-5 w-5 text-black" />
            </Link>

            <div className="flex flex-col items-center space-y-5 pt-1">
                {/* Logo */}
                <div className="relative w-48 h-12">
                    <Image
                        src="/assets/images/logo-full.png"
                        alt="Lernen Hub"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                <h1 className="text-lg text-[#1f2937] font-normal tracking-wide">Login to get started!</h1>

                {/* Toggle */}
                <div className="flex w-full bg-[#4f46e5] h-11 p-1 rounded-full overflow-hidden max-w-[300px] mx-auto shadow-inner relative">
                    <button
                        onClick={() => setUserType("student")}
                        className={cn(
                            "flex-1 h-full text-[14px] font-medium rounded-full transition-all duration-300 relative z-10",
                            userType === "student"
                                ? "bg-white text-[#4f46e5] shadow-lg"
                                : "bg-transparent text-white hover:bg-white/10"
                        )}
                    >
                        Student
                    </button>
                    <button
                        onClick={() => setUserType("organisation")}
                        className={cn(
                            "flex-1 h-full text-[14px] font-medium rounded-full transition-all duration-300 relative z-10",
                            userType === "organisation"
                                ? "bg-white text-[#4f46e5] shadow-lg"
                                : "bg-transparent text-white hover:bg-white/10"
                        )}
                    >
                        Organisation
                    </button>
                </div>

                <form onSubmit={onSubmit} className="w-full space-y-4 pt-1">
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-gray-500" htmlFor="email">
                            Email<span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter email"
                            className="w-full h-11 px-4 rounded-lg bg-[#f3f4f6] border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400 text-gray-900 text-[14px]"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-gray-500" htmlFor="password">
                            Password<span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="w-full h-11 px-4 rounded-lg bg-[#f3f4f6] border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400 text-gray-900 pr-10 text-[14px]"
                                required
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

                    <div className="flex justify-end pt-0.5">
                        <Link href="/forgot-password" className="text-[13px] font-medium text-gray-800 hover:text-black hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-bold text-[15px] shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center transform active:scale-[0.98]"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">Or</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Link href="/signup" className="block">
                        <div className="w-full h-11 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-800 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer text-[14px]">
                            New to Lernen-Hub? Sign Up
                        </div>
                    </Link>
                </form>
            </div>
        </div>
    );
}

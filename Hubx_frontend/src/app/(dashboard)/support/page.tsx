"use client";

import React, { useState } from "react";
import { HelpCircle, Mail, MessageCircle, Phone, Send, ChevronDown, ChevronUp, Search } from "lucide-react";

export default function SupportPage() {
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [message, setMessage] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);

    const faqs = [
        {
            id: 1,
            question: "How do I start an assessment?",
            answer: "Go to the Assessments page, select a subject and chapters, choose difficulty level, and click 'Generate Assessment'. Once generated, click 'Start Assessment' to begin.",
        },
        {
            id: 2,
            question: "Can I pause an assessment and continue later?",
            answer: "Yes, for practice assessments. However, timed assessments must be completed in one sitting. Your progress is automatically saved.",
        },
        {
            id: 3,
            question: "How is my rank calculated?",
            answer: "Your rank is calculated based on your average score across all completed assessments compared to other students in your organization.",
        },
        {
            id: 4,
            question: "How do I purchase a public paper?",
            answer: "Go to the Papers page, find the paper you want, click 'Purchase', and complete payment via Razorpay. You can also apply coupon codes for discounts.",
        },
        {
            id: 5,
            question: "What happens if I miss an assessment deadline?",
            answer: "You can still complete the assessment, but it may be marked as late. Contact your teacher for specific deadline policies.",
        },
        {
            id: 6,
            question: "How do I view my past test results?",
            answer: "Click on your profile icon and select 'My Tests' to view all your completed assessments with detailed results.",
        },
    ];

    const filteredFaqs = faqs.filter((faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        // TODO: Implement support ticket API
        setTimeout(() => {
            setIsSending(false);
            setMessage("");
            setName("");
            setEmail("");
            alert("Support request submitted successfully!");
        }, 1500);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-500 mt-2">We're here to help you succeed</p>
            </div>

            {/* Quick Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                    href="mailto:support@hubx.com"
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all group"
                >
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
                    <p className="text-sm text-gray-500">support@hubx.com</p>
                </a>

                <a
                    href="tel:+919876543210"
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all group"
                >
                    <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                        <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                    <p className="text-sm text-gray-500">+91 98765 43210</p>
                </a>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all group">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <MessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Live Chat</h3>
                    <p className="text-sm text-gray-500">Available 9 AM - 6 PM</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* FAQ Section */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <HelpCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">Frequently Asked Questions</h2>
                                <p className="text-sm text-gray-500">Find quick answers</p>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search FAQs..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto">
                        {filteredFaqs.map((faq) => (
                            <div key={faq.id} className="border-b border-gray-100 last:border-0">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                    className="w-full p-5 text-left hover:bg-gray-50 transition-colors flex items-start justify-between gap-3"
                                >
                                    <span className="font-medium text-gray-900 flex-1">{faq.question}</span>
                                    {expandedFaq === faq.id ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                                    )}
                                </button>
                                {expandedFaq === faq.id && (
                                    <div className="px-5 pb-5">
                                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <Send className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">Send us a message</h2>
                                <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Your Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={6}
                                placeholder="Describe your issue or question..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSending ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}


import Link from "next/link";
import { Brain, FileText, BarChart3, ShieldCheck, Zap, Globe } from "lucide-react";

export default function ServicesPage() {
    const services = [
        {
            title: "AI Assessments",
            description: "Leverage our advanced AI algorithms to grade assessments with 99% accuracy in seconds.",
            icon: <Brain className="w-8 h-8 text-white" />,
        },
        {
            title: "Secure Papers",
            description: "End-to-end encrypted storage for your private exam papers and sensitive educational data.",
            icon: <ShieldCheck className="w-8 h-8 text-white" />,
        },
        {
            title: "Real-time Analytics",
            description: "Gain actionable insights into student performance with our dynamic and interactive dashboards.",
            icon: <BarChart3 className="w-8 h-8 text-white" />,
        },
        {
            title: "Global Reach",
            description: "Connect with educators and institutions worldwide through our integrated community platform.",
            icon: <Globe className="w-8 h-8 text-white" />,
        },
        {
            title: "Instant Feedback",
            description: "Provide students with immediate, personalized feedback to accelerate their learning curve.",
            icon: <Zap className="w-8 h-8 text-white" />,
        },
        {
            title: "Digital Curricula",
            description: "Create, manage, and distribute digital curriculum materials seamlessly to all your classrooms.",
            icon: <FileText className="w-8 h-8 text-white" />,
        },
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-orange-400 relative overflow-hidden flex flex-col">
            {/* Decorative Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: "2s" }}></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: "4s" }}></div>

            {/* Navigation */}
            <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <Link href="/" className="text-2xl font-bold text-white tracking-tight">
                    HubX
                </Link>
                <div className="space-x-8 hidden md:flex">
                    {/* Using simple text links for now, can be expanded */}
                    <span className="text-white/80 hover:text-white cursor-pointer transition-colors">About</span>
                    <span className="text-white font-medium cursor-pointer">Services</span>
                    <span className="text-white/80 hover:text-white cursor-pointer transition-colors">Contact</span>
                </div>
                <Link
                    href="/login"
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium transition-all"
                >
                    Login
                </Link>
            </nav>

            {/* Header Content */}
            <main className="relative z-10 flex-grow flex flex-col items-center px-4 py-16 max-w-7xl mx-auto w-full">
                <div className="text-center max-w-3xl mb-16 space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-sm">
                        Our Services
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed">
                        Empowering education with next-generation intelligence. <br className="hidden md:block" />
                        Explore the tools that drive the future of learning.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col gap-4"
                        >
                            <div className="p-3 bg-white/20 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                                {service.icon}
                            </div>
                            <h3 className="text-2xl font-semibold text-white tracking-wide">
                                {service.title}
                            </h3>
                            <p className="text-white/80 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">Ready to transform your institution?</h2>
                    <Link
                        href="/signup"
                        className="px-10 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 hover:shadow-2xl transition-all shadow-lg"
                    >
                        Get Started Now
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/10 backdrop-blur-sm w-full py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center text-white/60 text-sm">
                    &copy; {new Date().getFullYear()} HubX. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

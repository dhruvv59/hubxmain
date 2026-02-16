import Link from "next/link";
import { Brain, ShieldCheck, BarChart3, ChevronRight, Zap, Globe, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-orange-400 relative overflow-x-hidden flex flex-col font-sans">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-bold text-xl">H</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">HubX</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Features</Link>
          <Link href="#solutions" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Solutions</Link>
          <Link href="#about" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</Link>
        </div>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium transition-all"
          >
            Login
          </Link>
          <Link
            href="/services"
            className="px-6 py-2 bg-white text-purple-600 rounded-full text-sm font-bold hover:bg-gray-100 transition-all shadow-lg hidden sm:block"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col">
        <section className="relative px-6 pt-20 pb-32 md:pt-32 md:pb-48 max-w-7xl mx-auto w-full text-center flex flex-col items-center">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white/90 text-sm font-medium">New AI Engine 2.0 Live</span>
          </div> */}

          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-6 drop-shadow-sm max-w-4xl mx-auto leading-[1.1]">
            Intelligence, <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Redefined.
            </span>
          </h1>

          <p className="text-xl text-white/80 font-light tracking-wide max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for educational excellence. Automate assessments, secure your data, and unlock actionable insights with the power of AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-50 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Start Free Trial <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white font-bold text-lg transition-all flex items-center justify-center"
            >
              Explore Services
            </Link>
          </div>

          {/* Mock UI/Hero Image Placeholder - Represents the "Service" visually */}
          <div className="mt-20 w-full max-w-5xl rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 p-2 shadow-2xl transform rotate-x-12 perspective-1000 hidden md:block">
            <div className="rounded-lg bg-black/40 w-full h-[400px] flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-orange-500/20"></div>
              <div className="grid grid-cols-3 gap-8 p-8 w-full h-full opacity-50">
                {/* Abstract Dashboard shapes */}
                <div className="col-span-1 bg-white/10 rounded-lg h-full"></div>
                <div className="col-span-2 flex flex-col gap-8">
                  <div className="bg-white/10 rounded-lg h-40"></div>
                  <div className="bg-white/10 rounded-lg flex-1"></div>
                </div>
              </div>
              <span className="absolute text-white/50 font-mono text-sm">Interactive Dashboard Preview</span>
            </div>
          </div>
        </section>

        {/* Info/Stats Section */}
        <section className="w-full bg-white/5 backdrop-blur-sm border-y border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Users", value: "10k+" },
              { label: "Papers Graded", value: "1M+" },
              { label: "Accuracy Rate", value: "99.9%" },
              { label: "Institutions", value: "500+" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</span>
                <span className="text-white/60 text-sm uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto w-full relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Powered by Advanced AI</h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">Experience the future of education management with tools designed to save time and enhance learning outcomes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Grading",
                desc: "Instantly grade complex answers with human-level accuracy using our proprietary AI models.",
                icon: <Brain className="w-8 h-8 text-indigo-300" />
              },
              {
                title: "Secure Vault",
                desc: "Bank-grade encryption for all your question papers, student data, and institutional records.",
                icon: <ShieldCheck className="w-8 h-8 text-purple-300" />
              },
              {
                title: "Deep Analytics",
                desc: "Uncover learning gaps and performance trends with intuitive, real-time data visualization.",
                icon: <BarChart3 className="w-8 h-8 text-orange-300" />
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300">
                <div className="mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-600/50 to-purple-600/50 backdrop-blur-xl border border-white/20 p-12 md:p-20 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to revolutionize your classroom?</h2>
              <Link
                href="/register"
                className="px-10 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-block"
              >
                Join HubX Today
              </Link>
              <p className="mt-6 text-white/50 text-sm">No credit card required for trial.</p>
            </div>

            {/* Abstract decorative circles inside card */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-2xl font-bold text-white tracking-tight">HubX</span>
              <p className="mt-4 text-white/50 text-sm leading-relaxed">
                Pioneering the intersection of artificial intelligence and education.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} HubX Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-white/40 hover:text-white transition-colors"><Globe className="w-5 h-5" /></Link>
              {/* Add more social icons if needed */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

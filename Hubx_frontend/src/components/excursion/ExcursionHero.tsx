"use client";
import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Vote, CalendarCheck } from 'lucide-react';

const COMPANIES = [
    { id: 1, name: 'Tesla', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png', color: 'bg-black' },
    { id: 2, name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg', color: 'bg-white' },
    { id: 3, name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg', color: 'bg-white' },
    { id: 4, name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', color: 'bg-white' },
    { id: 5, name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', color: 'bg-black' },
];

export function ExcursionHero() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-highlight Loop: Cycles through indices every 2.5 seconds
    useEffect(() => {
        if (isPaused || hoverIndex !== null) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % COMPANIES.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [isPaused, hoverIndex]);

    const displayIndex = hoverIndex !== null ? hoverIndex : activeIndex;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white shadow-2xl mb-8">
            {/* Dynamic Background Glows */}
            <div className="absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-sky-400/20 blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-96 w-96 rounded-full bg-pink-500/10 blur-[100px] animate-pulse" />

            <div className="relative z-10 grid gap-12 p-6 md:grid-cols-2 md:items-center md:p-16">
                {/* Content Side */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-md border border-white/20 shadow-inner">
                        <Compass className="h-4 w-4 text-sky-300" />
                        <span className="text-sky-50">Student Excursions</span>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl lg:text-6xl leading-[1.1]">
                            Discover & Experience <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-white">
                                Real-World Industry
                            </span>
                        </h1>
                        <p className="max-w-xl text-lg text-indigo-50/80 leading-relaxed font-medium">
                            Explore upcoming educational visits, vote for your preferred companies, and manage your field trip schedules all in one place.
                        </p>
                    </div>

                    {/* Matrix Status Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: Vote, label: 'Vote', desc: 'Express Interest', color: 'bg-sky-500/20', iconColor: 'text-sky-300' },
                            { icon: CalendarCheck, label: 'Book', desc: 'Secure Spot', color: 'bg-emerald-500/20', iconColor: 'text-emerald-300' },
                            { icon: MapPin, label: 'Visit', desc: 'Learn on Site', color: 'bg-orange-500/20', iconColor: 'text-orange-300' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white">{item.label}</p>
                                    <p className="text-xs text-indigo-200/70 truncate">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3D Matrix Logo Grid Side */}
                <div
                    className="relative flex items-center justify-center min-h-[400px]"
                    style={{ perspective: '2000px' }}
                >
                    <div
                        className="grid grid-cols-2 lg:grid-cols-3 gap-6 p-4"
                        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(10deg) rotateY(-10deg)' }}
                    >
                        {COMPANIES.map((company, index) => {
                            const isActive = index === displayIndex;

                            // Calculate 3D Matrix Transform
                            const zPos = isActive ? '100px' : '-40px';
                            const rotY = isActive ? '0deg' : (index % 2 === 0 ? '15deg' : '-15deg');
                            const opacity = isActive ? 1 : 0.4;
                            const brightness = isActive ? 'brightness(1.1)' : 'brightness(0.7)';
                            const grayscale = isActive ? 'grayscale(0)' : 'grayscale(1)';

                            return (
                                <div
                                    key={company.id}
                                    onMouseEnter={() => {
                                        setHoverIndex(index);
                                        setIsPaused(true);
                                    }}
                                    onMouseLeave={() => {
                                        setHoverIndex(null);
                                        setIsPaused(false);
                                    }}
                                    className={`
                                        relative group cursor-pointer transition-all duration-700 ease-out
                                        w-28 h-28 md:w-36 md:h-36
                                        flex items-center justify-center rounded-3xl
                                        ${isActive ? `${company.color} shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]` : 'bg-white/5 backdrop-blur-md border border-white/10'}
                                    `}
                                    style={{
                                        transform: `translateZ(${zPos}) rotateY(${rotY}) scale(${isActive ? 1.15 : 1})`,
                                        opacity,
                                        transformStyle: 'preserve-3d',
                                        zIndex: isActive ? 50 : 1
                                    }}
                                >
                                    {/* Glass Refraction Effect */}
                                    <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none`} />

                                    <div className="relative h-full w-full flex items-center justify-center p-6 transition-all duration-500"
                                        style={{ filter: `${brightness} ${grayscale}` }}>
                                        <img
                                            src={company.logo}
                                            alt={company.name}
                                            className="w-full h-full object-contain drop-shadow-2xl"
                                        />
                                    </div>

                                    {/* Active Glow/Pulse */}
                                    {isActive && (
                                        <>
                                            <div className="absolute inset-0 rounded-3xl animate-pulse ring-2 ring-white/50 z-[1]" />
                                            {/* Particle/Glow behind */}
                                            <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-full -z-10 animate-pulse" />
                                        </>
                                    )}

                                    {/* Tooltip / Label on hover (subtle) */}
                                    <div className={`
                                        absolute -bottom-10 left-1/2 -translate-x-1/2 
                                        px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10
                                        text-[10px] font-bold tracking-widest uppercase transition-all duration-500
                                        ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                                    `}>
                                        {company.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Matrix Architectural Elements */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full animate-[spin_30s_linear_infinite]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-dashed border-white/10 rounded-full animate-[spin_60s_linear_infinite_reverse]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Zap } from "lucide-react";
import Image from "next/image";
import { WelcomeBannerData } from "@/types/dashboard";

interface WelcomeBannerProps {
    user: { name: string; avatar?: string };
    data: WelcomeBannerData;
}

export function WelcomeBanner({ user, data }: WelcomeBannerProps) {
    return (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] p-8 md:p-10 shadow-lg text-white mb-2">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[200px] w-[200px] rounded-full bg-white/10 blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-white/90">
                        {user.avatar ? (
                            <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#4f46e5] font-bold text-3xl">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">Student Dashboard</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            {data.greeting}, {user.name.split(" ")[0]}!
                        </h1>
                        <p className="text-white/80 text-sm md:text-base font-medium max-w-[500px] leading-relaxed">
                            "{data.quote}"
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 self-stretch md:self-auto min-w-[200px]">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg">
                        <Zap className="h-6 w-6 fill-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white/60 uppercase tracking-widest">{data.examName}</p>
                        <p className="text-2xl font-black">{data.daysLeft} <span className="text-sm font-medium opacity-80">Days Left</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

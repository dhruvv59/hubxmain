import { ChevronRight, Compass } from "lucide-react";
import Link from "next/link";
import { ExcursionData } from "@/types/dashboard";

interface ExcursionBannerProps {
    data: ExcursionData | null;
}

export function ExcursionBanner({ data }: ExcursionBannerProps) {
    if (!data) return null;

    return (
        <Link href={data.link} className="rounded-[24px] p-4 md:p-5 flex items-center justify-between border border-blue-100 shadow-sm min-h-[100px] cursor-pointer hover:shadow-md transition-all gap-4"
            style={{ background: "linear-gradient(90deg, #FDF4FF 0%, #ECFCCB 50%, #E0F2FE 100%)" }}>
            <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#111827] text-white flex-shrink-0 flex items-center justify-center shadow-md border-[3px] border-white/50">
                    <Compass className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <span className="font-extrabold text-[#1f2937] italic text-sm md:text-lg tracking-wide uppercase truncate leading-tight">{data.title}</span>
            </div>
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-black/5 bg-white/40 flex-shrink-0 flex items-center justify-center hover:bg-white transition-colors backdrop-blur-sm">
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
            </div>
        </Link>
    );
}

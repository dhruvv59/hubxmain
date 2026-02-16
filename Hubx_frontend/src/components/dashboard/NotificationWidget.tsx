import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Notification } from "@/types/dashboard";

interface NotificationWidgetProps {
    notifications: Notification[];
}

export function NotificationWidget({ notifications }: NotificationWidgetProps) {
    // Show empty state if no notifications
    if (!notifications || notifications.length === 0) {
        return (
            <div className="bg-[#f3f4f6] rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-center h-[200px]">
                <p className="text-gray-400 text-sm">No new notifications</p>
            </div>
        )
    }

    return (
        <div className="bg-[#f3f4f6] rounded-[24px] p-5 shadow-sm border border-gray-100">
            <h3 className="text-[14px] font-bold text-[#1f2937] bg-[#eef2ff] py-2 px-3 rounded-lg text-center mb-4">Notifications from Teachers</h3>
            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div key={notif.id} className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                        <div className="h-9 w-9 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative border border-white shadow-sm">
                            <Image src={notif.avatar || '/default-avatar.png'} alt={notif.author} fill className="object-cover" />
                        </div>
                        <div>
                            <p className="text-[11px] leading-relaxed text-gray-800">
                                <span className="font-bold">{notif.author}</span> {notif.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <Link
                href="/dashboard/notifications"
                className="w-full mt-4 py-2 text-[11px] font-bold text-[#1f2937] border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-center block"
            >
                View All
            </Link>
        </div>
    );
}

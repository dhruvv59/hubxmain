export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#1a1b4b] p-4 relative">
            {/* Background Decoration - kept subtle/dark */}

            <div className="relative w-full max-w-[480px]">
                {children}
            </div>
        </div>
    );
}

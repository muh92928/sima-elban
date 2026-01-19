"use client";

import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface AkunAlertProps {
    count: number;
}

export default function AkunAlert({ count }: AkunAlertProps) {
    const router = useRouter();

    if (count <= 0) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => router.push('/konfirmasi-akun')}
            className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-[2rem] p-4 @tablet:p-6 shadow-xl shadow-orange-900/20 relative overflow-hidden cursor-pointer flex items-center justify-between"
        >
            <div className="flex items-center gap-4 @tablet:gap-6 relative z-10">
                <div className="bg-white/20 p-3 @tablet:p-4 rounded-2xl backdrop-blur-md">
                    <UserCheck size={24} className="@tablet:w-8 @tablet:h-8 text-white" />
                </div>
                <div>
                    <div className="text-white text-base @tablet:text-xl font-bold">Persetujuan Akun Diperlukan</div>
                    <div className="text-orange-100 text-xs @tablet:text-sm">Ada <span className="font-black bg-white/20 px-2 py-0.5 rounded text-white">{count}</span> pengguna baru menunggu konfirmasi.</div>
                </div>
            </div>
            <div className="hidden @tablet:block">
                <button className="btn btn-sm @tablet:btn-md bg-white text-orange-600 hover:bg-orange-50 border-none font-bold shadow-lg">Lihat Detail</button>
            </div>
        </motion.div>
    );
}

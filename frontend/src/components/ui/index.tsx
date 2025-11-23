import React, { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

interface CardProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
    <div className={`bg-white rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden ${className}`}>
        {children}
    </div>
);

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    onClick?: () => void;
    trend?: string;
    color?: 'indigo' | 'blue' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, onClick, trend, color = "indigo" }) => {
    const gradients = {
        indigo: "from-indigo-500 to-purple-600",
        blue: "from-blue-500 to-cyan-500",
        emerald: "from-emerald-500 to-teal-500",
        amber: "from-amber-500 to-orange-500"
    };

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[color]} opacity-[0.03] rounded-bl-[100px] -z-0 group-hover:opacity-[0.08] transition-opacity`}></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-3.5 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-white group-hover:bg-gradient-to-br ${gradients[color]} transition-all duration-300 shadow-sm group-hover:shadow-md`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                        <TrendingUp size={12} className="mr-1.5" /> {trend}
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <div className="text-3xl font-black text-slate-900 mb-1 tracking-tight font-outfit">{value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
};

interface BadgeProps {
    children: ReactNode;
    color?: 'slate' | 'green' | 'blue' | 'red' | 'amber' | 'indigo';
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'slate', size = 'sm' }) => {
    const styles = {
        slate: 'bg-slate-100 text-slate-600 border-slate-200',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };
    const sizes = {
        sm: 'px-2.5 py-1 text-[10px]',
        md: 'px-3 py-1 text-xs'
    };
    return <span className={`inline-flex items-center border rounded-full font-bold uppercase tracking-wider shadow-sm ${sizes[size]} ${styles[color] || styles.slate}`}>{children}</span>;
};

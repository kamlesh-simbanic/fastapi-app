'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api, API_URL } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import {
  Activity,
  Server,
  Terminal,
  Zap,
  Calendar,
  Users,
  Briefcase,
  CreditCard,
  Globe,
  Cpu,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    backend: 'idle' | 'loading' | 'online' | 'offline';
    db: 'idle' | 'loading' | 'online' | 'offline';
    message: string;
  }>({
    backend: 'idle',
    db: 'idle',
    message: 'Initializing system protocols...',
  });

  const [stats, setStats] = useState<{
    students: number;
    staff: number;
    tasks: number;
    total_fees: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setStatus(prev => ({ ...prev, backend: 'loading', db: 'loading' }));

    try {
      const dbData = await api.getDbStatus();
      const statsData = await api.getDashboardStats();

      setStats(statsData);
      setStatus({
        backend: 'online',
        db: dbData.status === 'connected' ? 'online' : 'offline',
        message: 'System initialization complete. All services operational.',
      });
    } catch (error) {
      console.error('Data fetch failed:', error);
      setStatus({
        backend: 'offline',
        db: 'offline',
        message: 'Unable to establish secure connection to the database.',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user) return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-h1 font-weight-h1 tracking-tight text-zinc-900 dark:text-white italic">
            School Overview
          </h1>
          <p className="text-primary-main font-bold text-xs uppercase tracking-[0.2em] opacity-80 italic flex items-center gap-2">
            Institutional Dashboard <div className="w-1.5 h-1.5 rounded-full bg-primary-main animate-pulse" />
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-4 rounded-radius-medium bg-surface-paper border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-3 shadow-sm">
            <Calendar className="w-4 h-4 text-primary-main" />
            {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <button
            onClick={fetchData}
            className="p-4 rounded-radius-medium bg-primary-main text-white hover:bg-primary-dark transition-all shadow-xl shadow-primary-main/20 active:scale-95 flex items-center justify-center group"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
          </button>
        </div>
      </section>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          title="Student Enrollment"
          value={stats?.students ?? 0}
          icon={<Users className="w-6 h-6" />}
          trend="+12% Periodic Growth"
          bgColor="bg-primary-main"
          subtitle="Registered Students"
        />
        <StatCard
          title="Teachers & Staff"
          value={stats?.staff ?? 0}
          icon={<Briefcase className="w-6 h-6" />}
          trend="100% Operational"
          bgColor="bg-secondary-main"
          subtitle="Administrative Directory"
        />
        <StatCard
          title="Open Operations"
          value={stats?.tasks ?? 0}
          icon={<Zap className="w-6 h-6" />}
          trend="4 Critical Tasks"
          bgColor="bg-primary-main"
          subtitle="Pending Tasks"
        />
        <StatCard
          title="Fees Collected"
          value={`₹${(stats?.total_fees ?? 0).toLocaleString('en-IN')}`}
          icon={<CreditCard className="w-6 h-6" />}
          trend="+5.4% Revenue Growth"
          bgColor="bg-secondary-main"
          subtitle="School Revenue"
        />
      </div>

      {/* System Health & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* API Access Card */}
          <a
            href={`${API_URL}/docs`}
            target="_blank"
            className="group p-10 rounded-radius-large bg-surface-paper border border-zinc-200 dark:border-zinc-800 hover:border-primary-main transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe className="w-32 h-32 text-primary-main" />
            </div>
            <div>
              <div className="w-12 h-12 rounded-radius-medium bg-primary-main/10 flex items-center justify-center mb-6 group-hover:bg-primary-main group-hover:text-white transition-all text-primary-main">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-h4 font-bold text-zinc-900 dark:text-white mb-2 italic">API Protocols</h3>
              <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest opacity-60">System Documentation</p>
            </div>
            <div className="flex items-center gap-3 text-primary-main font-bold text-[10px] uppercase tracking-[0.2em] italic">
              View Protocols <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </a>

          {/* System Status card */}
          <div className="p-10 rounded-radius-large bg-surface-paper border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-sm">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary-main/5 blur-3xl rounded-full" />
            <div>
              <div className="w-12 h-12 rounded-radius-medium bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 text-zinc-600">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-h4 font-bold text-zinc-900 dark:text-white mb-2 italic">System Health</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest opacity-60 italic">Cloud Infrastructure</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", status.backend === 'online' ? "bg-primary-main shadow-[0_0_12px_rgba(37,99,235,0.6)] animate-pulse" : "bg-zinc-300 dark:bg-zinc-600")} />
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest italic">Backend</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", status.db === 'online' ? "bg-primary-main shadow-[0_0_12px_rgba(37,99,235,0.6)] animate-pulse" : "bg-zinc-300 dark:bg-zinc-600")} />
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest italic">Database</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Terminal */}
        <div className="p-8 rounded-radius-large bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 flex flex-col justify-between h-full min-h-[220px] group transition-all shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-main/5 blur-3xl rounded-full" />
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary-main/40" />
            </div>
            <span className="text-[9px] text-zinc-600 font-mono tracking-[0.3em] uppercase italic">System Logs</span>
          </div>
          <div className="flex-1 font-mono text-[11px] space-y-3">
            <div className="flex gap-3 text-zinc-600">
              <span className="opacity-50">[09:24:12]</span>
              <span className="text-primary-main font-bold tracking-widest">SYSTEM</span>
              <span className="text-zinc-500">FastStack initialization complete.</span>
            </div>
            <div className="flex gap-3">
              <span className="opacity-50 text-zinc-600">[{status.backend === 'loading' ? '--:--:--' : new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0') + ':' + new Date().getSeconds().toString().padStart(2, '0')}]</span>
              <span className={cn("font-bold tracking-widest uppercase", status.backend === 'online' ? "text-primary-light" : status.backend === 'loading' ? "text-warning" : "text-error")}>
                {status.backend}
              </span>
              <span className="text-zinc-300 italic opacity-80 break-words">{status.message}</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] text-zinc-600 font-mono italic uppercase tracking-widest">
            <span>Node: {user.department || 'root'}</span>
            <span className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-primary-main" /> V1.0.8-PRO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, bgColor, subtitle }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  bgColor: string;
  subtitle: string;
}) {
  return (
    <div className="group p-8 rounded-radius-large bg-surface-paper border border-zinc-200 dark:border-zinc-800 hover:border-primary-main transition-all relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div className={cn("absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-all duration-700 pointer-events-none scale-50 group-hover:scale-100", bgColor)} />

      <div className="flex items-start justify-between mb-6">
        <div className={cn("p-4 rounded-radius-medium text-white shadow-lg transition-transform group-hover:rotate-12 duration-500", bgColor)}>
          {icon}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="px-3 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest shadow-inner tabular-nums italic">
            REALTIME
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary-main italic opacity-0 group-hover:opacity-100 transition-opacity">Active</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] italic">{title}</p>
        <h3 className="text-h1 font-weight-h1 text-zinc-900 dark:text-white tracking-tight italic transition-all group-hover:text-primary-main">{value}</h3>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-50 dark:border-zinc-800/50 flex flex-col gap-2">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 italic uppercase tracking-wider">{subtitle}</p>
        <p className="text-[10px] font-black text-primary-main dark:text-primary-light flex items-center gap-1.5 uppercase tracking-widest italic group-hover:translate-x-1 transition-transform">
          <Activity className="w-3 h-3 animate-pulse" />
          {trend}
        </p>
      </div>
    </div>
  );
}

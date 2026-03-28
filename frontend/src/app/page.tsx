'use client';

import React, { useEffect, useState } from 'react';
import { api, API_URL } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Activity,
  Server,
  Terminal,
  Layers,
  Zap,
  ArrowRight,
  Calendar,
  Users,
  Briefcase,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<{
    backend: 'idle' | 'loading' | 'online' | 'offline';
    db: 'idle' | 'loading' | 'online' | 'offline';
    message: string;
  }>({
    backend: 'idle',
    db: 'idle',
    message: 'Initializing...',
  });

  const [stats, setStats] = useState<{
    students: number;
    staff: number;
    tasks: number;
    total_fees: number;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setStatus(prev => ({ ...prev, backend: 'loading', db: 'loading' }));

      try {
        const dbData = await api.getDbStatus();
        const statsData = await api.getDashboardStats();

        setStats(statsData);
        setStatus({
          backend: 'online',
          db: dbData.status === 'connected' ? 'online' : 'offline',
          message: 'Connection established successfully!',
        });
      } catch (error) {
        console.error('Data fetch failed:', error);
        setStatus({
          backend: 'offline',
          db: 'offline',
          message: 'Unable to connect to the backend server.',
        });
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Layers className="w-12 h-12 text-indigo-500 animate-pulse" />
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white italic text-shadow-glow">
              Dashboard Overview
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base max-w-lg">
              Welcome back, <span className="text-indigo-400 font-semibold not-italic">{user.name}</span>.
              Here is what&apos;s happening today in your organization.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2 shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center"
            >
              <Activity className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats?.students ?? 0}
            icon={<Users className="w-6 h-6 text-indigo-400" />}
            trend="+12% this month"
            bgColor="bg-indigo-500/10"
          />
          <StatCard
            title="Active Staff"
            value={stats?.staff ?? 0}
            icon={<Briefcase className="w-6 h-6 text-emerald-400" />}
            trend="All present"
            bgColor="bg-emerald-500/10"
          />
          <StatCard
            title="Open Tasks"
            value={stats?.tasks ?? 0}
            icon={<Zap className="w-6 h-6 text-amber-400" />}
            trend="4 due today"
            bgColor="bg-amber-500/10"
          />
          <StatCard
            title="Fees Collected"
            value={`$${(stats?.total_fees ?? 0).toLocaleString()}`}
            icon={<CreditCard className="w-6 h-6 text-purple-400" />}
            trend="+5.4% vs last term"
            bgColor="bg-purple-500/10"
          />
        </div>

        {/* System Health & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API Access Card */}
            <a
              href={`${API_URL}/docs`}
              target="_blank"
              className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between h-48 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal className="w-24 h-24 text-zinc-900 dark:text-white" />
              </div>
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">API Documentation</h3>
                <p className="text-zinc-500 dark:text-zinc-500 text-sm">Interactive Swagger UI for backend testing.</p>
              </div>
              <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-semibold text-sm">
                Open Documentation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* System Status card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between h-48 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Server className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">System Topology</h3>
                <p className="text-zinc-500 dark:text-zinc-500 text-sm italic">MySQL + FastAPI Cluster</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", status.backend === 'online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-300 dark:bg-zinc-600")} />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Backend</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", status.db === 'online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-300 dark:bg-zinc-600")} />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Database</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Terminal */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between h-full min-h-[192px] group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/20 group-hover:bg-red-500/40 transition-colors" />
                <div className="w-2 h-2 rounded-full bg-amber-500/20 group-hover:bg-amber-500/40 transition-colors" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors" />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono tracking-widest uppercase">Console</span>
            </div>
            <div className="flex-1 font-mono text-sm space-y-2">
              <div className="flex gap-2 text-zinc-400 dark:text-zinc-600">
                <span>[09:24:12]</span>
                <span className="text-indigo-500/80">INIT</span>
                <span className="text-zinc-500 dark:text-zinc-400">Handshake complete...</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-400 dark:text-zinc-600">[{new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}:{new Date().getSeconds().toString().padStart(2, '0')}]</span>
                <span className={cn(status.backend === 'online' ? "text-emerald-500/80" : "text-red-500/80")}>
                  {status.backend.toUpperCase()}
                </span>
                <span className="text-zinc-900 dark:text-zinc-300 break-all">{status.message}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-900/50 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-600 font-mono italic">
              <span>Auto-sync enabled</span>
              <span>v1.0.4-dev</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, trend, bgColor }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  bgColor: string;
}) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 dark:hover:border-zinc-700 transition-all group overflow-hidden relative shadow-sm hover:shadow-md">
      <div className={cn("absolute -right-2 -bottom-2 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none", bgColor)} />
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", bgColor)}>
          {icon}
        </div>
        <div className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Live
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-zinc-500 dark:text-zinc-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{value}</h3>
      </div>
      <p className="mt-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
        <Activity className="w-3 h-3" />
        {trend}
      </p>
    </div>
  );
}

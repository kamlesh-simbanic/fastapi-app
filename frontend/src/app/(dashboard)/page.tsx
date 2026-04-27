'use client';

import React, { useEffect, useState } from 'react';
import { getDbStatus, getDashboardStats } from './actions';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  Server,
  Terminal,
  Zap,
  ArrowRight,
  Calendar,
  Users,
  Briefcase,
  CreditCard
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
    message: 'Initializing...',
  });

  const [stats, setStats] = useState<{
    students: number;
    staff: number;
    tasks: number;
    total_fees: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setStatus(prev => ({ ...prev, backend: 'loading', db: 'loading' }));

      try {
        const dbData = await getDbStatus();
        const statsData = await getDashboardStats();

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

  if (!user) return null;

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground italic text-shadow-glow">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg">
            Welcome back, <span className="text-primary font-semibold not-italic">{user.name}</span>.
            Here is what&apos;s happening today in your organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center"
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
          icon={<Users className="w-6 h-6 text-primary" />}
          trend="+12% this month"
          bgColor="bg-primary/10"
        />
        <StatCard
          title="Active Staff"
          value={stats?.staff ?? 0}
          icon={<Briefcase className="w-6 h-6 text-success" />}
          trend="All present"
          bgColor="bg-success/10"
        />
        <StatCard
          title="Open Tasks"
          value={stats?.tasks ?? 0}
          icon={<Zap className="w-6 h-6 text-warning" />}
          trend="4 due today"
          bgColor="bg-warning/10"
        />
        <StatCard
          title="Fees Collected"
          value={`$${(stats?.total_fees ?? 0).toLocaleString()}`}
          icon={<CreditCard className="w-6 h-6 text-accent" />}
          trend="+5.4% vs last term"
          bgColor="bg-accent/10"
        />
      </div>

      {/* System Health & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Access Card */}
          <a
            href={`${API_URL}/docs`}
            target="_blank"
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex flex-col justify-between h-48 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Terminal className="w-24 h-24 text-foreground" />
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Terminal className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">API Documentation</h3>
              <p className="text-muted-foreground text-sm">Interactive Swagger UI for backend testing.</p>
            </div>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              Open Documentation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* System Status card */}
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-success/5 blur-3xl rounded-full" />
            <div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <Server className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">System Topology</h3>
              <p className="text-muted-foreground text-sm italic">MySQL + FastAPI Cluster</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", status.backend === 'online' ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted")} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Backend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", status.db === 'online' ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted")} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Database</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Terminal */}
        <div className="p-6 rounded-2xl bg-muted/50 border border-border flex flex-col justify-between h-full min-h-[192px] group hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive/20 group-hover:bg-destructive/40 transition-colors" />
              <div className="w-2 h-2 rounded-full bg-warning/20 group-hover:bg-warning/40 transition-colors" />
              <div className="w-2 h-2 rounded-full bg-success/20 group-hover:bg-success/40 transition-colors" />
            </div>
            <span className="text-[10px] text-muted-foreground/40 font-mono tracking-widest uppercase">Console</span>
          </div>
          <div className="flex-1 font-mono text-sm space-y-2">
            <div className="flex gap-2 text-muted-foreground/60">
              <span>[09:24:12]</span>
              <span className="text-primary/80">INIT</span>
              <span className="text-muted-foreground">Handshake complete...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground/60">[{new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}:{new Date().getSeconds().toString().padStart(2, '0')}]</span>
              <span className={cn(status.backend === 'online' ? "text-success/80" : "text-destructive/80")}>
                {status.backend.toUpperCase()}
              </span>
              <span className="text-foreground break-all">{status.message}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono italic">
            <span>Auto-sync enabled</span>
            <span>v1.0.4-dev</span>
          </div>
        </div>
      </div>
    </div>
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
    <div className="p-6 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all group overflow-hidden relative shadow-sm hover:shadow-md">
      <div className={cn("absolute -right-2 -bottom-2 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none", bgColor)} />
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", bgColor)}>
          {icon}
        </div>
        <div className="px-2 py-1 rounded-lg bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Live
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
      </div>
      <p className="mt-4 text-xs font-medium text-success flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
        <Activity className="w-3 h-3" />
        {trend}
      </p>
    </div>
  );
}

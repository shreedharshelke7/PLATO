"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ZeusIcon,
  DemeterIcon,
  PoseidonIcon,
  AthenaIcon,
  ApolloIcon,
  DionysusIcon,
  GreekMeander,
} from "../gods";
import {
  LayoutDashboard,
  Camera,
  CalendarDays,
  Sparkles,
  Droplets,
  Brain,
  ChefHat,
  TrendingUp,
  Settings,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      sub: "Zeus Overview",
      icon: LayoutDashboard,
      godIcon: ZeusIcon,
    },
    {
      href: "/scan",
      label: "Food Scanner",
      sub: "Demeter Vision",
      icon: Camera,
      godIcon: DemeterIcon,
    },
    {
      href: "/log",
      label: "Meal Diary",
      sub: "Daily Food Log",
      icon: CalendarDays,
      godIcon: DemeterIcon,
    },
    {
      href: "/swap",
      label: "Divine Swap",
      sub: "Dionysus Treats",
      icon: Sparkles,
      godIcon: DionysusIcon,
      highlight: true,
    },
    {
      href: "/water",
      label: "Hydration",
      sub: "Poseidon Waves",
      icon: Droplets,
      godIcon: PoseidonIcon,
    },
    {
      href: "/coach",
      label: "AI Coach",
      sub: "Athena Insights",
      icon: Brain,
      godIcon: AthenaIcon,
    },
    {
      href: "/plan",
      label: "Meal Plan",
      sub: "5-Min Kitchen",
      icon: ChefHat,
      godIcon: AthenaIcon,
    },
    {
      href: "/progress",
      label: "Progress",
      sub: "Apollo Analytics",
      icon: TrendingUp,
      godIcon: ApolloIcon,
    },
    {
      href: "/settings",
      label: "Settings",
      sub: "Profile & Keys",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border-base glass-panel h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-border-base">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-accent-gold/20 flex items-center justify-center text-accent-gold group-hover:scale-105 transition-transform">
            <ZeusIcon size={24} />
          </div>
          <div>
            <span className="font-serif text-xl font-black tracking-wider text-text-primary block leading-none">
              PLATO
            </span>
            <span className="text-[10px] tracking-widest text-accent-gold uppercase font-bold">
              Ambrosia
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          const God = link.godIcon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-accent-gold text-stone-950 font-bold shadow-sm"
                  : link.highlight
                  ? "border border-accent-gold/40 hover:bg-accent-gold/10 text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-stone-950"
                      : link.highlight
                      ? "text-accent-gold"
                      : "text-text-muted group-hover:text-accent-gold"
                  }`}
                />
                <div>
                  <span className="block leading-tight">{link.label}</span>
                  <span
                    className={`text-[10px] block leading-tight ${
                      isActive ? "text-stone-800" : "text-text-muted"
                    }`}
                  >
                    {link.sub}
                  </span>
                </div>
              </div>

              {God && !isActive && (
                <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                  <God size={16} />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Greek Key Footer Border */}
      <div className="p-3 border-t border-border-base text-center">
        <GreekMeander className="h-2.5 text-accent-gold/30 mb-2" />
        <span className="text-[10px] text-text-muted block">
          Ambrosia v1.0 • Olympus First
        </span>
      </div>
    </aside>
  );
}

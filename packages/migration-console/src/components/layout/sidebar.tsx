"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@console/lib/utils";
import {
  LayoutDashboard,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  Gauge,
  AlertTriangle,
  Eye,
  ClipboardList,
  Download,
  Link as LinkIcon,
  PlayCircle,
  ArrowRightLeft,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@console/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  matchExact?: boolean;
}

const globalNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Project", href: "/projects/new", icon: FolderPlus },
];

const projectNav: NavItem[] = [
  { label: "Overview", href: "/overview", icon: Gauge },
  { label: "Source", href: "/source", icon: LinkIcon },
  { label: "Audit", href: "/audit", icon: ClipboardList },
  { label: "Dry Run", href: "/dry-run", icon: PlayCircle },
  { label: "Manual Fixes", href: "/manual-fixes", icon: AlertTriangle },
  { label: "Transform Preview", href: "/transform-preview", icon: ArrowRightLeft },
  { label: "Import Plan", href: "/import-plan", icon: Eye },
  { label: "Artifacts", href: "/artifacts", icon: Download },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Extract project ID from path like /projects/abc123/overview
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  const projectId = projectMatch?.[1];
  const isInProject = projectId && projectId !== "new";

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-200 h-screen sticky top-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 p-4 border-b h-14">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
          M
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">Migration Console</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {/* Global nav */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
              Navigation
            </p>
          )}
          {globalNav.map((item) => {
            const isActive = item.matchExact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </div>

        {/* Project nav (only when viewing a project) */}
        {isInProject && (
          <div className="space-y-1 pt-4 border-t mt-4">
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5">
                Project
              </p>
            )}
            {projectNav.map((item) => {
              const fullHref = `/projects/${projectId}${item.href}`;
              const isActive = pathname === fullHref;
              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-8"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}

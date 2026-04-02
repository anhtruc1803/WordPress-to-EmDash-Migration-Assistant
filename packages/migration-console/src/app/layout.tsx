import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@console/components/layout/sidebar";
import { Topbar } from "@console/components/layout/topbar";
import { ThemeProvider } from "@console/components/providers/theme-provider";
import { QueryProvider } from "@console/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Migration Console — WordPress to EmDash",
  description: "Audit, transform, and plan WordPress-to-EmDash migrations with a structured-content-first workflow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <QueryProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                  {children}
                </main>
              </div>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

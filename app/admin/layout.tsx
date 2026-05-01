import type { Metadata } from "next";
import { LangProvider } from "@/context/LangContext";
import ScreenProtection from "@/components/ScreenProtection";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sewar Admin",
  description: "Sewar Rijbewijs Online - Admin Panel",
  manifest: "/manifest-admin.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sewar Admin",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScreenProtection />
      <LangProvider>
        {children}
      </LangProvider>
    </>
  );
}

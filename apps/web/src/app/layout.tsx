import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppHeader } from "../components/navigation/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watchnotes",
  description: "Rank what you watch. Discover what to watch next.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}

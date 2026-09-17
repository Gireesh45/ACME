import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACME Salary Manager",
  description:
    "Employee salary management platform for ACME organization — manage 10,000+ employees across multiple countries",
  keywords: ["salary management", "HR", "employee compensation", "payroll analytics"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}

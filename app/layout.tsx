import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "FTI E-Payment - ระบบชำระเงินออนไลน์ สภาอุตสาหกรรมแห่งประเทศไทย",
  description: "ระบบชำระเงินออนไลน์สำหรับสมาคมอุตสาหกรรมไทย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} scroll-smooth`}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              font-family: 'Prompt', Arial, Helvetica, sans-serif !important;
            }
            body, html {
              font-family: 'Prompt', Arial, Helvetica, sans-serif !important;
            }
            input, textarea, button, select, option {
              font-family: 'Prompt', Arial, Helvetica, sans-serif !important;
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: 'Prompt', Arial, Helvetica, sans-serif !important;
            }
            p, span, div, label {
              font-family: 'Prompt', Arial, Helvetica, sans-serif !important;
            }
          `
        }} />
      </head>
      <body className={`${prompt.className} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

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
  description: "ระบบชำระเงินออนไลน์ปลอดภัยสำหรับสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย และ GS1 Thailand รองรับการชำระเงินผ่านบัตรเครดิตและช่องทางอื่นๆ",
  keywords: ["FTI", "E-Payment", "สภาอุตสาหกรรม", "GS1", "ระบบชำระเงิน", "ออนไลน์", "2C2P", "บัตรเครดิต"],
  authors: [{ name: "Federation of Thai Industries" }],
  creator: "Federation of Thai Industries",
  publisher: "Federation of Thai Industries",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FTI E-Payment - ระบบชำระเงินออนไลน์",
    description: "ระบบชำระเงินออนไลน์ปลอดภัยสำหรับสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย",
    url: '/',
    siteName: 'FTI E-Payment',
    images: [{
      url: '/Logo_FTI.webp',
      width: 1200,
      height: 630,
      alt: 'FTI E-Payment',
    }],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FTI E-Payment - ระบบชำระเงินออนไลน์",
    description: "ระบบชำระเงินออนไลน์ปลอดภัยสำหรับสมาชิกสภาอุตสาหกรรมแห่งประเทศไทย",
    images: ['/Logo_FTI.webp'],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [
      { url: '/Logo_FTI.webp', type: 'image/webp' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/Logo_FTI.webp', sizes: '180x180', type: 'image/webp' }
    ],
  },
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

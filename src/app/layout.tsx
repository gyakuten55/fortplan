import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FortPlan | フォートナイト戦略プランニングツール - 勝率250%向上",
  description: "プロレベルのフォートナイト戦略分析で、あなたのチームを勝利に導く究極のプランニングツール。10,000以上のチームが利用し、勝率250%向上を実現。戦略ボード、試合レポート、武器分析機能で完璧な戦略を立案。",
  keywords: "フォートナイト, Fortnite, Eスポーツ, 戦略, プランニング, チーム, 戦略ボード, 試合分析, 武器分析, 勝率向上, FortPlan",
  authors: [{ name: "FortPlan Team" }],
  creator: "FortPlan",
  publisher: "FortPlan",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "FortPlan | フォートナイト戦略プランニングツール - 勝率250%向上",
    description: "プロレベルのフォートナイト戦略分析で、あなたのチームを勝利に導く究極のプランニングツール。月額500円で勝率250%向上を実現。",
    url: "https://fortplan.app",
    siteName: "FortPlan",
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FortPlan - フォートナイト戦略プランニングツール",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FortPlan | フォートナイト戦略プランニングツール",
    description: "プロレベルの戦略分析で勝率250%向上！月額500円でチームを勝利に導くツール",
    images: ["/twitter-image.png"],
    creator: "@FortPlan",
  },
  alternates: {
    canonical: "https://fortplan.app",
  },
  other: {
    "theme-color": "#8b5cf6",
    "msapplication-TileColor": "#8b5cf6",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Schema.org構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "FortPlan",
              "applicationCategory": "Game",
              "applicationSubCategory": "Strategy Tool",
              "operatingSystem": "Web Browser",
              "description": "プロレベルのフォートナイト戦略分析で、あなたのチームを勝利に導く究極のプランニングツール",
              "offers": {
                "@type": "Offer",
                "price": "500",
                "priceCurrency": "JPY",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "10000"
              },
              "publisher": {
                "@type": "Organization",
                "name": "FortPlan",
                "url": "https://fortplan.app"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased fortnite-bg text-white`}
      >
        {children}
      </body>
    </html>
  );
}

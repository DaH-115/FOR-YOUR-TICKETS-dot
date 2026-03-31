import { Metadata } from "next";
import "@/globals.css";
import { AlertProvider } from "store/context/alertContext";
import { AuthInitializer } from "store/context/auth/AuthInitializer";
import { LevelUpProvider } from "store/context/levelUp/LevelUpContext";
import Providers from "store/redux-toolkit/Providers";
import Header from "@/components/ui/layout/header/Header";
import Footer from "@/components/ui/layout/Footer";
import ScrollToTopButton from "@/components/ui/buttons/ScrollToTopButton";

export const metadata: Metadata = {
  metadataBase: new URL("https://just-your-tickets.vercel.app"),
  alternates: {
    canonical: "/",
  },
  title: {
    template: "%s | For Your Tickets.",
    default: "For Your Tickets.",
  },
  description: "나만의 영화 티켓을 만들어보세요",
  keywords: ["movie", "ticket", "booking"],
  openGraph: {
    title: "For Your Tickets.",
    description: "나만의 영화 티켓을 만들어보세요",
    url: "/",
    siteName: "For Your Tickets.",
    images: [
      {
        url: "/images/og-card.jpg",
        width: 1200,
        height: 630,
        alt: "For Your Tickets.",
      },
    ],
  },
  icons: {
    apple: [
      {
        url: "/images/apple-icon-57x57.png",
        sizes: "57x57",
        type: "image/png",
      },
      {
        url: "/images/apple-icon-60x60.png",
        sizes: "60x60",
        type: "image/png",
      },
      {
        url: "/images/apple-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/images/apple-icon-76x76.png",
        sizes: "76x76",
        type: "image/png",
      },
      {
        url: "/images/apple-icon-114x114.png",
        sizes: "114x114",
        type: "image/png",
      },
      {
        url: "/images/apple-icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        url: "/images/apple-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/images/apple-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/images/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    icon: [
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      {
        url: "/images/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/images/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/images/ms-icon-144x144.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[#121212]">
        {/* RTK Provider */}
        <Providers>
          <AuthInitializer>
            <AlertProvider>
              <LevelUpProvider>
                <Header />
                <div className="mx-auto mt-32 min-w-md lg:mt-36">
                  {children}
                </div>
                <Footer />
                <ScrollToTopButton />
              </LevelUpProvider>
            </AlertProvider>
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  );
}

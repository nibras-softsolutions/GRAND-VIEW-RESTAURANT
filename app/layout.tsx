import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import Toast from "@/components/Toast";
import CartDrawer from "@/components/CartDrawer";
import FoodDetailModal from "@/components/FoodDetailModal";
import RoomChangeModal from "@/components/RoomChangeModal";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Grand View Hotel — In-Room Dining & Food Ordering",
  description: "Good Food. Better Stays. Gourmet food and authentic flavours delivered directly to your hotel room at Grand View Hotel.",
  keywords: ["Grand View Hotel", "In-Room Dining", "Hotel Food Ordering", "Room Service", "Kochi Dining"],
  authors: [{ name: "Grand View Hotel Hospitality" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#C99A4A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} antialiased`}>
      <body className="min-h-screen bg-[#F8F6F1] text-[#1A1814] flex flex-col font-sans selection:bg-[#C99A4A]/20 selection:text-[#1A1814]">
        <OrderProvider>
          <CartProvider>
            {children}
            <FoodDetailModal />
            <CartDrawer />
            <RoomChangeModal />
            <Toast />
          </CartProvider>
        </OrderProvider>
      </body>
    </html>
  );
}

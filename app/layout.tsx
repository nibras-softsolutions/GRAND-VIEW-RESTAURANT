import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import Toast from "@/components/Toast";
import CartDrawer from "@/components/CartDrawer";
import FoodDetailModal from "@/components/FoodDetailModal";

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
  title: "Grand View Restaurant — Online Food Ordering & Delivery",
  description: "Good Food. Great Moments. Signature gourmet dishes and authentic flavours prepared fresh and delivered to your doorstep by Grand View Restaurant.",
  keywords: ["Grand View Restaurant", "Online Food Ordering", "Gourmet Food Delivery", "Takeaway Pickup", "Kochi Dining"],
  authors: [{ name: "Grand View Restaurant" }],
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
            <Toast />
          </CartProvider>
        </OrderProvider>
      </body>
    </html>
  );
}

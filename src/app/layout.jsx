import PluginInit from "@/helper/PluginInit";
import { AuthProvider } from "@/utils/auth";
import "./font.css";
import "./globals.css";

export const metadata = {
  title: "Admin Bursopuri",
  description: "Bursopuri is an admin page for managing orders, products, and users.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <PluginInit />
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
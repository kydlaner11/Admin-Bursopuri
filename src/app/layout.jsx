import PluginInit from "@/helper/PluginInit";
import "./font.css";
import "./globals.css";

export const metadata = {
  title: "Admin Bursopuri",
  description:
    "Wowdash NEXT JS is a developer-friendly, ready-to-use admin template designed for building attractive, scalable, and high-performing web applications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <PluginInit />
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}

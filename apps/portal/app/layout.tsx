import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Unified Portal",
  description: "Centralized entry to SCB, LMS, JR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

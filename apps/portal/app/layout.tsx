// apps/portal/app/layout.tsx
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Unified Portal",
  description: "Centralized entry to SCB, LMS, JR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // We default to dark mode by adding `dark` to <html>.
  // This does not prevent toggling later (when you add a client-side toggle you can toggle document.documentElement.classList).
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

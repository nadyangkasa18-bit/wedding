import "./globals.css";

export const metadata = {
  title: "Nadya & Matthew — The Wedding Missions",
  description: "A little mischief for a very big day.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4efe5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

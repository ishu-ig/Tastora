import "./globals.css";
import MasterLayout from "./MasterLayout";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL("https://tastorafood.com"),

  title: {
    default: "Tastora — Gourmet Fast Food & Artisan Dining",
    template: "%s | Tastora Food Restaurant",
  },

  description:
    "Experience bold flavors crafted from premium ingredients. Sizzling smash burgers, artisan pizzas, royal combos, and chef specials delivered fresh and fast.",

  keywords: [
    "Tastora Restaurant",
    "Gourmet Dining",
    "Fast Food",
    "Gourmet Burgers",
    "Artisan Pizza",
    "Pure Veg Delights",
    "Food Delivery",
    "Best Restaurant",
  ],

  authors: [{ name: "Tastora Restaurant" }],
  creator: "Tastora Restaurant",
  publisher: "Tastora Restaurant",

  openGraph: {
    type: "website",
    url: "https://tastorafood.com",
    title: "Tastora — Gourmet Fast Food & Artisan Dining",
    description:
      "Experience bold flavors crafted from premium ingredients. Sizzling smash burgers, artisan pizzas, and hot fast delivery.",
    siteName: "Tastora Food Restaurant",
    images: [{ url: "/img/logo.png", width: 800, height: 800, alt: "Tastora Logo" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "Tastora — Gourmet Fast Food & Artisan Dining",
    description: "Experience bold flavors crafted from premium ingredients.",
    images: ["/img/logo.png"],
  },

  icons: {
    icon: [
      { url: "/img/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/img/logo.png",
    shortcut: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* JSON-LD Structured Data for Restaurant SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              name: "Tastora Food Restaurant",
              image: "https://tastorafood.com/img/logo.png",
              url: "https://tastorafood.com",
              telephone: "+1-800-123-4567",
              servesCuisine: ["Fast Food", "Burgers", "Pizza", "Gourmet Dining"],
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                streetAddress: "42 Flavor Street, Manhattan",
                addressLocality: "New York",
                addressRegion: "NY",
                postalCode: "10001",
                addressCountry: "US",
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "09:00",
                  closes: "23:00",
                },
              ],
            }),
          }}
        />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="antialiased font-sans bg-[#FFFDFB] text-zinc-900 selection:bg-rose-600 selection:text-white">
        <MasterLayout>{children}</MasterLayout>
      </body>
    </html>
  );
}

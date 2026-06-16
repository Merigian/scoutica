export const SITE_CONFIG = {
  name: "Scoutica",
  description: "La piattaforma italiana per lo scouting professionale",
  descriptionEn: "The Italian platform for professional model scouting",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://scoutica.it",
  ogImage: "/images/og-image.jpg",
  links: {
    instagram: "https://instagram.com/scoutica",
    email: "info@scoutica.it",
  },
  locales: ["it", "en"] as const,
  defaultLocale: "it" as const,
};

export type Locale = (typeof SITE_CONFIG.locales)[number];

export const NAV_ITEMS = {
  model: [
    { key: "dashboard", href: "/model/home", icon: "LayoutDashboard" },
    { key: "discover", href: "/model/discover", icon: "Search" },
    { key: "portfolio", href: "/model/portfolio", icon: "Images" },
    { key: "opportunities", href: "/model/castings", icon: "Megaphone" },
    { key: "applications", href: "/model/applications", icon: "FileText" },
    { key: "saved", href: "/model/saved", icon: "Bookmark" },
    { key: "requests", href: "/model/contacts", icon: "Inbox" },
    { key: "messages", href: "/model/messages", icon: "MessageSquare" },
    { key: "verification", href: "/model/verification", icon: "ShieldCheck" },
    { key: "notifications", href: "/model/notifications", icon: "Bell" },
    { key: "billing", href: "/model/settings/billing", icon: "CreditCard" },
    { key: "settings", href: "/model/settings", icon: "Settings" },
  ],
  scout: [
    { key: "dashboard", href: "/scout/home", icon: "LayoutDashboard" },
    { key: "talentSearch", href: "/scout/discover", icon: "Search" },
    { key: "favorites", href: "/scout/favorites", icon: "Bookmark" },
    { key: "boards", href: "/scout/boards", icon: "Kanban" },
    { key: "postings", href: "/scout/castings", icon: "Megaphone" },
    { key: "messages", href: "/scout/messages", icon: "MessageSquare" },
    { key: "billing", href: "/scout/settings/billing", icon: "CreditCard" },
    { key: "settings", href: "/scout/settings", icon: "Settings" },
  ],
  admin: [
    { key: "dashboard", href: "/admin", icon: "LayoutDashboard" },
    { key: "users", href: "/admin/users", icon: "Users" },
    { key: "verifications", href: "/admin/verifications", icon: "ShieldCheck" },
    { key: "modelVerifications", href: "/admin/model-verifications", icon: "BadgeCheck" },
    { key: "reports", href: "/admin/reports", icon: "Flag" },
    { key: "castings", href: "/admin/castings", icon: "Megaphone" },
    { key: "subscriptions", href: "/admin/subscriptions", icon: "CreditCard" },
    { key: "settings", href: "/admin/settings", icon: "Settings" },
  ],
  studio: [
    { key: "dashboard", href: "/studio/home", icon: "LayoutDashboard" },
    { key: "studios", href: "/studio/studios", icon: "Building2" },
    { key: "bookings", href: "/studio/bookings", icon: "CalendarDays" },
    { key: "inquiries", href: "/studio/inquiries", icon: "Inbox" },
    { key: "messages", href: "/studio/messages", icon: "MessageSquare" },
    { key: "notifications", href: "/studio/notifications", icon: "Bell" },
    { key: "billing", href: "/studio/settings/billing", icon: "CreditCard" },
    { key: "settings", href: "/studio/settings", icon: "Settings" },
  ],
};

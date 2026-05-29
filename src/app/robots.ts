import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scoutica.it";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/model/",
          "/*/scout/",
          "/*/studio/",
          "/*/admin/",
          "/*/dashboard",
          "/*/login",
          "/*/register",
          "/*/verify-email",
          "/*/reset-password",
          "/*/settings",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

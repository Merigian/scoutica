import { db } from "@/lib/db";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scoutica.it";

  // Static pages
  const staticPages = [
    "",
    "/about",
    "/pricing",
    "/privacy",
    "/terms",
    "/studios",
    "/login",
    "/register",
  ];

  const staticEntries = staticPages.flatMap((path) => [
    { url: `${baseUrl}/it${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 },
    { url: `${baseUrl}/en${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.8 },
  ]);

  if (!process.env.DATABASE_URL) {
    return staticEntries;
  }

  try {
    const [profiles, studios] = await Promise.all([
      db.modelProfile.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        take: 1000,
      }),
      db.studio.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
    ]);

    const profileEntries = profiles.flatMap((p) => [
      { url: `${baseUrl}/it/profile/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "daily" as const, priority: 0.7 },
      { url: `${baseUrl}/en/profile/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "daily" as const, priority: 0.7 },
    ]);

    const studioEntries = studios.flatMap((s) => [
      { url: `${baseUrl}/it/studios/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 },
      { url: `${baseUrl}/en/studios/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 },
    ]);

    return [...staticEntries, ...profileEntries, ...studioEntries];
  } catch {
    return staticEntries;
  }
}

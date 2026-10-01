import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { groupPods } from "@/lib/coworking-groups";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [plans, pods] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      select: { id: true },
    }),
    prisma.cyberPod.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/menu`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/bean-deploy`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/coworking`, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Una URL por grupo de pods (los Alpha comparten página)
  const podRoutes: MetadataRoute.Sitemap = groupPods(pods).map((group) => ({
    url: `${SITE_URL}/coworking/${group.pods[0].id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const planRoutes: MetadataRoute.Sitemap = plans.map((plan) => ({
    url: `${SITE_URL}/bean-deploy/${plan.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...podRoutes, ...planRoutes];
}

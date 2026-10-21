import type { MetadataRoute } from "next";

import { siteUrl } from "@/src/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mypage", "/members", "/auth/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

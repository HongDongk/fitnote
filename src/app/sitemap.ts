import type { MetadataRoute } from "next";

import { siteUrl } from "@/src/lib/site";

// 강사 페이지는 검색 노출 동의 기능이 생기기 전까지 넣지 않는다.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, changeFrequency: "weekly", priority: 1 }];
}

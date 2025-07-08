import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://career-linker.vercel.app/sitemap.xml",
    host: "https://career-linker.vercel.app",
  };
}

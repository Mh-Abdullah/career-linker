import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://career-linker.vercel.app";
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified,
    },
  ];
}

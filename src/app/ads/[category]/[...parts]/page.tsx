import { redirect } from "next/navigation";
import { WatchFilm } from "@/components/watch-film";
import { getPublishedMedia, mediaHref } from "@/lib/media";
import { adsCategory } from "@/lib/taxonomy";

type PageProps = {
  params: Promise<{ category: string; parts: string[] }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { parts } = await params;
  const id = parts[parts.length - 1];
  const item = await getPublishedMedia(id);
  return { title: item?.title ?? "Film" };
}

export default async function AdsFilmPage({ params }: PageProps) {
  const { category, parts } = await params;
  if (!adsCategory(category)) redirect("/ads");

  // /ads/{category}/{id}
  // /ads/{category}/{oldSubcategory}/{id}  (legacy)
  const id = parts[parts.length - 1];
  const item = await getPublishedMedia(id);
  if (!item) redirect(`/ads/${category}`);

  const href = mediaHref(item);
  if (href !== `/ads/${category}/${id}`) redirect(href);
  return <WatchFilm id={id} />;
}

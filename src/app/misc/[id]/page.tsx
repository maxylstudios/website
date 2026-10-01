import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { WatchFilm } from "@/components/watch-film";
import { getPublishedMedia, mediaHref } from "@/lib/media";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getPublishedMedia(id);
  return { title: item?.title ?? "Film" };
}

export default async function MiscFilmPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getPublishedMedia(id);
  if (!item) notFound();
  const href = mediaHref(item);
  if (href !== `/misc/${id}`) redirect(href);
  return <WatchFilm id={id} />;
}

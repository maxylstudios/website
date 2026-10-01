import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublishedMedia, mediaHref } from "@/lib/media";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getPublishedMedia(id);
  return { title: item?.title ?? "Film" };
}

export default async function LegacyMediaPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getPublishedMedia(id);
  if (!item) notFound();
  redirect(mediaHref(item));
}

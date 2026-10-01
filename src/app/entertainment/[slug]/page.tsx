import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaShelf } from "@/components/media-shelf";
import { listPublishedMedia } from "@/lib/media";
import { entertainment, topicIn } from "@/lib/taxonomy";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: topicIn(entertainment, slug)?.name ?? "Entertainment" };
}

export default async function EntertainmentTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = topicIn(entertainment, slug);
  if (!topic) notFound();

  const uploaded = await listPublishedMedia();
  const items = uploaded.filter(
    (item) => item.section === "entertainment" && item.subcategory_slug === topic.slug,
  );

  return (
    <div className="px-5 pb-20 pt-24 sm:px-8">
      <Link href="/entertainment" className="text-xs tracking-[0.22em] text-muted uppercase">
        Entertainment
      </Link>
      <h1 className="mt-3 text-4xl font-bold">{topic.name}</h1>
      <div className="mt-8">
        <MediaShelf items={items} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { EntertainmentBrowse } from "@/components/entertainment-browse";
import { HomeBillboard } from "@/components/home-billboard";
import { SectionLinks } from "@/components/section-links";
import { listPublishedMedia } from "@/lib/media";
import { entertainmentPageKey, getPageHeroes, pickFeatured } from "@/lib/page-heroes";
import { entertainment, topicIn } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Entertainment",
  description: "Microdramas, films, and other entertainment from Maxyl Studios.",
};

export default async function EntertainmentPage() {
  const [uploaded, heroes] = await Promise.all([listPublishedMedia(), getPageHeroes()]);
  const films = uploaded.filter((item) => item.section === "entertainment");
  const featured = pickFeatured(films, heroes[entertainmentPageKey()]);
  const featuredTopic = featured ? topicIn(entertainment, featured.subcategory_slug) : null;

  const rows = entertainment.items.map((topic) => ({
    slug: topic.slug,
    name: topic.name,
    href: `/entertainment/${topic.slug}`,
    items: films.filter((item) => item.subcategory_slug === topic.slug),
  }));

  return (
    <div className="bg-black">
      {featured ? (
        <HomeBillboard
          item={featured}
          kicker={featuredTopic ? featuredTopic.name : "Entertainment"}
          blurb={null}
          links={entertainment.items.map((topic) => ({
            href: `/entertainment/${topic.slug}`,
            label: topic.name,
          }))}
        />
      ) : (
        <section className="px-5 pb-6 pt-28 sm:px-8">
          <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Entertainment</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Entertainment</h1>
          <SectionLinks
            className="mt-8"
            links={entertainment.items.map((topic) => ({
              href: `/entertainment/${topic.slug}`,
              label: topic.name,
            }))}
          />
        </section>
      )}
      <EntertainmentBrowse rows={rows} />
    </div>
  );
}

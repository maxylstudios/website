import { loadHeroVideo } from "@/app/admin/actions";
import { HeroEditor } from "@/components/admin/hero-editor";

export default async function HeroAdminPage() {
  const { path, message } = await loadHeroVideo();
  return <HeroEditor path={path} message={message} />;
}

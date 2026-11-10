import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@reborn/db";
import { Heart, ShieldCheck, Package, Headphones } from "lucide-react";

export const metadata: Metadata = { title: "About Us", description: "Learn about UK Reborn Dolls, our story, our craft, and our commitment to quality." };
export const revalidate = 300;

export default async function AboutPage() {
  // Fetch editable content from store settings
  const settings = await prisma.storeSetting.findMany({
    where: { key: { in: [
      "about_title", "about_subtitle", "about_content", "about_image",
      "story_title", "story_subtitle", "story_content", "story_image",
    ] } },
  });
  const s = Object.fromEntries(settings.map((x: { key: string; value: string }) => [x.key, x.value]));

  const aboutTitle = s.about_title || "Where Every Detail Tells a Story";
  const aboutSubtitle = s.about_subtitle || "About UK Reborn Dolls";
  const aboutContent = s.about_content || `<p>We&apos;re passionate collectors and lovers of fine craftsmanship, dedicated to bringing the most beautiful, lifelike collectible dolls directly to those who treasure them.</p><p>We work directly with skilled artists to bring you dolls that represent the pinnacle of reborn craftsmanship, from hand-painted, heat-set skin tones to individually hand-rooted hair and hand-blown glass eyes.</p><p>Whether you&apos;re a lifelong collector or discovering this art form for the first time, we&apos;re here to guide you to the perfect piece and provide the personal care every customer deserves.</p>`;
  const aboutImage = s.about_image || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80";
  const storyTitle = s.story_title || "Where Every Detail Tells a Story";
  const storySubtitle = s.story_subtitle || "Our Craft";
  const storyContent = s.story_content || "Each doll in our collection is the result of extraordinary skill, patience, and passion. From the delicate hand-rooted hair to the carefully layered skin painting, every detail is crafted to create an emotional, lasting connection.";
  const storyImage = s.story_image || undefined;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero */}
      <section className="py-20" style={{ background: "var(--bg-subtle)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest font-body mb-3">{aboutSubtitle}</p>
          <h1 className="font-heading text-display-md text-[var(--fg)] mb-5">{aboutTitle}</h1>
          <p className="text-lg text-[var(--fg-muted)] font-body leading-relaxed max-w-2xl mx-auto">
            We&apos;re passionate collectors and lovers of fine craftsmanship, dedicated to bringing the most beautiful, lifelike collectible dolls directly to those who treasure them.
          </p>
        </div>
      </section>

      {/* Story with image */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-display-sm text-[var(--fg)] mb-5">{storyTitle}</h2>
            <div className="prose prose-sm max-w-none text-[var(--fg-muted)] font-body leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: storyContent }} />
          </div>
          {aboutImage && (
            <div className="aspect-square rounded-3xl overflow-hidden ring-1 ring-[var(--border)]">
              <img src={aboutImage} alt={aboutTitle} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="py-16" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-display-sm text-[var(--fg)] text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Heart, title: "Carefully Curated", desc: "Every doll is personally reviewed for quality, authenticity, and beauty before joining our collection." },
              { icon: ShieldCheck, title: "Secure & Trustworthy", desc: "Your privacy and security are our priority. Shop with complete confidence." },
              { icon: Package, title: "Premium Packaging", desc: "Each order is packed with exceptional care to arrive in perfect condition." },
              { icon: Headphones, title: "Personal Support", desc: "Real, personal customer care from people who genuinely love what they do." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-2xl border" style={{ borderColor: "var(--border)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--surface)" }}>
                  <item.icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-[var(--fg)] mb-1">{item.title}</h3>
                  <p className="text-sm text-[var(--fg-muted)] font-body leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-heading text-display-sm text-[var(--fg)] mb-4">Ready to Discover?</h2>
          <p className="text-[var(--fg-muted)] font-body mb-8">Explore our curated collection and find your next treasured piece.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 h-13 px-8 bg-[var(--primary)] text-[var(--primary-text)] font-semibold rounded-full hover:opacity-90 transition-opacity font-body"
          >
            Shop the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { Heart, ShieldCheck, Package, Headphones, Star } from "lucide-react";

export const metadata: Metadata = { title: "About Us", description: "Learn about Reborn Dolls — our story, our craft, and our commitment to quality." };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <section className="bg-soft-blush-50 border-b border-charcoal-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold text-bloom-rose uppercase tracking-widest font-body mb-3">Our Story</p>
          <h1 className="font-heading text-display-md text-charcoal mb-5">About Reborn Dolls</h1>
          <p className="text-lg text-taupe font-body leading-relaxed max-w-2xl mx-auto">
            We're passionate collectors and lovers of fine craftsmanship, dedicated to bringing the most beautiful, lifelike collectible dolls directly to those who treasure them.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-display-sm text-charcoal mb-5">Where Every Detail Tells a Story</h2>
            <p className="text-taupe font-body leading-relaxed mb-4">
              Reborn Dolls was founded on a simple belief: that truly beautiful collectible art deserves a home where it's presented, celebrated, and understood. Every piece we offer is carefully selected for its quality, artistry, and emotional resonance.
            </p>
            <p className="text-taupe font-body leading-relaxed mb-4">
              We work directly with skilled artists to bring you dolls that represent the pinnacle of reborn craftsmanship — from hand-painted, heat-set skin tones to individually hand-rooted hair and hand-blown glass eyes.
            </p>
            <p className="text-taupe font-body leading-relaxed">
              Whether you're a lifelong collector or discovering this art form for the first time, we're here to guide you to the perfect piece and provide the personal care every customer deserves.
            </p>
          </div>
          <div className="aspect-square rounded-3xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80" alt="Craftsmanship" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-display-sm text-charcoal text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Heart, title: "Carefully Curated", desc: "Every doll is personally reviewed for quality, authenticity, and beauty before joining our collection." },
              { icon: ShieldCheck, title: "Secure & Trustworthy", desc: "Your privacy and security are our priority. Shop with complete confidence." },
              { icon: Package, title: "Premium Packaging", desc: "Each order is packed with exceptional care to arrive in perfect condition." },
              { icon: Headphones, title: "Personal Support", desc: "Real, personal customer care from people who genuinely love what they do." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-2xl border border-charcoal-100">
                <div className="w-12 h-12 rounded-2xl bg-bloom-rose-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-bloom-rose" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-charcoal mb-1">{item.title}</h3>
                  <p className="text-sm text-taupe font-body leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-heading text-display-sm text-charcoal mb-4">Ready to Discover?</h2>
          <p className="text-taupe font-body mb-8">Explore our curated collection and find your next treasured piece.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 h-13 px-8 bg-bloom-rose text-white font-semibold rounded-full hover:bg-bloom-rose-600 transition-colors font-body">
            Shop the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}

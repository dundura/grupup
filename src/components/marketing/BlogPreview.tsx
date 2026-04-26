import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryColors: Record<string, string> = {
  "Training Tips":   "#0F3154",
  "For Parents":     "#DC373E",
  "Getting Started": "#16a34a",
  "Coaching":        "#7c3aed",
  "Local Guide":     "#0F3154",
};

const posts = [
  {
    slug: "group-vs-private-training",
    category: "Training Tips",
    title: "Group training vs. private: which is right for your player?",
    excerpt: "Private training gets all the attention, but research shows group environments accelerate learning faster. Here's when each makes sense.",
    date: "Apr 18, 2026",
    readTime: "4 min read",
    image: "https://www.soccer-near-me.com/news_soccer08_16-9-ratio.webp",
  },
  {
    slug: "how-to-find-a-soccer-group-raleigh",
    category: "Local Guide",
    title: "How to find a group soccer training session in Raleigh–Durham",
    excerpt: "A practical guide for NC parents navigating clinics, academies, and group training options — and how to tell which ones are worth it.",
    date: "Apr 12, 2026",
    readTime: "5 min read",
    image: "https://www.soccer-near-me.com/idf.webp",
  },
  {
    slug: "what-to-look-for-in-a-youth-coach",
    category: "For Parents",
    title: "5 things to look for in a youth sports coach",
    excerpt: "Beyond certifications — what really matters when choosing someone to develop your child's game and confidence.",
    date: "Apr 5, 2026",
    readTime: "3 min read",
    image: "https://media.anytime-soccer.com/wp-content/uploads/2026/02/ecnl_girls.jpg",
  },
];

export function BlogPreview() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">From the blog</h2>
            <p className="text-lg text-muted-foreground">
              Training tips, local guides, and advice for players and parents.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start">
            <Link href="/blog">
              All articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
            >
              {/* Cover image */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
                <span
                  className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: categoryColors[post.category] ?? "#0F3154" }}
                >
                  {post.category}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-base leading-snug mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

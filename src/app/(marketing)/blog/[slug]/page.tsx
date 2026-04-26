import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ArrowRight, Clock } from "lucide-react";
import { getBlogPost, blogPosts } from "@/lib/blog-data";
import type { Metadata } from "next";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: `${post.title} | Grupup Blog`, description: post.excerpt };
}

const categoryColors: Record<string, string> = {
  "Training Tips":   "#0F3154",
  "For Parents":     "#DC373E",
  "Getting Started": "#16a34a",
  "Coaching":        "#7c3aed",
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div>
      {/* Back */}
      <div className="container pt-6">
        <Link href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          All articles
        </Link>
      </div>

      {/* Hero */}
      <div className="container py-8 md:py-10 max-w-3xl">
        <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white mb-4"
          style={{ backgroundColor: categoryColors[post.category] ?? "#0F3154" }}>
          {post.category}
        </span>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>
        <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{post.excerpt}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <span>{post.date}</span>
          <span>·</span>
          <Clock className="h-3.5 w-3.5" />
          <span>{post.readTime}</span>
        </div>
      </div>

      {/* Cover image */}
      <div className="container max-w-3xl mb-10">
        <div className="relative aspect-video rounded-2xl overflow-hidden">
          <Image src={post.coverImage} alt={post.title} fill className={`object-cover ${post.coverImagePosition ?? "object-center"}`} sizes="(max-width: 768px) 100vw, 768px" unoptimized priority />
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-3xl pb-16">
        <article
          className="blog-content max-w-none text-base"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-12 rounded-2xl p-8 text-white text-center" style={{ backgroundColor: "#0F3154" }}>
          <h3 className="text-xl font-bold mb-2">Ready to find a group session?</h3>
          <p className="text-white/70 mb-5">Browse vetted coaches running small-group sessions near you.</p>
          <Link href="/groups"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#DC373E" }}>
            Browse sessions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-bold mb-5">More articles</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="group flex gap-4 rounded-xl border p-4 hover:shadow-md transition-all">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image src={p.coverImage} alt={p.title} fill className="object-cover" sizes="80px" unoptimized />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.readTime}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

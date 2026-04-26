import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Grupup",
  description: "Tips, guides, and insights for players, parents, and coaches on group sports training.",
};

const categoryColors: Record<string, string> = {
  "Training Tips":   "#0F3154",
  "For Parents":     "#DC373E",
  "Getting Started": "#16a34a",
  "Coaching":        "#7c3aed",
};

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <div>
      {/* Header */}
      <div className="border-b" style={{ backgroundColor: "#0F3154" }}>
        <div className="container py-12 md:py-16 text-white text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span> Blog</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Tips, guides, and insights for players, parents, and coaches.
          </p>
        </div>
      </div>

      <div className="container py-12">

        {/* Featured */}
        <Link href={`/blog/${featured.slug}`}
          className="group grid md:grid-cols-2 gap-6 rounded-2xl border overflow-hidden hover:shadow-lg transition-all mb-12">
          <div className="relative aspect-video md:aspect-auto">
            <Image src={featured.coverImage} alt={featured.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white mb-3"
              style={{ backgroundColor: categoryColors[featured.category] ?? "#0F3154" }}>
              {featured.category}
            </span>
            <h2 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
              {featured.title}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">{featured.excerpt}</p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{featured.date} · {featured.readTime}</span>
              <span className="flex items-center gap-1 font-semibold text-foreground group-hover:gap-2 transition-all">
                Read more <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border overflow-hidden hover:shadow-lg transition-all">
              <div className="relative aspect-video">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized />
              </div>
              <div className="flex flex-col flex-1 p-5">
                <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white mb-3 self-start"
                  style={{ backgroundColor: categoryColors[post.category] ?? "#0F3154" }}>
                  {post.category}
                </span>
                <h3 className="font-bold text-base mb-2 leading-snug group-hover:text-primary transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">{post.date} · {post.readTime}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

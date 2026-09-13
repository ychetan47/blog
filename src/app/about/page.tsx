import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "@/components/social-icons";
import {
  Mail,
  Server,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await db.settings.findUnique({ where: { id: "default" } });
  const author = await db.user.findFirst({ where: { role: "ADMIN" } });

  const techStack = [
    { name: "Java 21 / JVM", desc: "Virtual threads, high-concurrency services" },
    { name: "Apache Kafka", desc: "Event-driven backbones, consumer resilience" },
    { name: "Spring Boot 3", desc: "Production microservices, reactive streams" },
    { name: "PostgreSQL", desc: "Advisory locks, partitioned indexing, JSONB" },
    { name: "Next.js & React", desc: "App router, SSR, interactive user surfaces" },
    { name: "Docker & K8s", desc: "Containerized deployments, orchestration" },
  ];

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-blue-200/80 shadow-md shrink-0 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                settings?.avatarUrl ||
                author?.avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              }
              alt={settings?.authorName || "Chetan Yadav"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Software Engineer & Writer</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {settings?.authorName || "Chetan Yadav"}
            </h1>

            <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
              {settings?.authorBio ||
                "Senior Software Engineer crafting high-scale distributed systems, event-driven architectures, and modern web applications."}
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-6">
              <a
                href={settings?.githubUrl || "https://github.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-semibold transition-all"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a
                href={settings?.twitterUrl || "https://twitter.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-700 text-xs font-semibold transition-all"
              >
                <TwitterIcon className="w-4 h-4" />
                <span>Twitter</span>
              </a>
              <a
                href={settings?.linkedinUrl || "https://linkedin.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-all"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Narrative / Engineering Story */}
        <div className="mt-12 pt-8 border-t border-slate-100 prose-custom text-slate-700">
          <h2>About this publication</h2>
          <p>
            Welcome to my personal corner on the web. Over the years, I&apos;ve experienced firsthand that the best way to master a complex technology is to teach it clearly and concisely.
          </p>
          <p>
            Here you will find a curated mix of deep technical breakdowns—from diagnosing Kafka partition starvation and implementing zero-downtime database migrations, to clean architecture patterns in modern Java—alongside personal essays on career progression, focus, and product design.
          </p>
        </div>

        {/* Core Tech Specialization */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>Core Technical Focus</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techStack.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors"
              >
                <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to read articles */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Ready to dive in?</h4>
            <p className="text-xs text-slate-500">Explore technical walkthroughs and reflections.</p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm shadow-sm transition-all"
          >
            <span>Browse All Blogs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

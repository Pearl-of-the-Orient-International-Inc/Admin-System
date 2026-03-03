import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Tag, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEventById } from "../_components/events-data";

type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, "").trim();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function prepareRichContent(html: string) {
  const seen = new Map<string, number>();
  const toc: TocHeading[] = [];

  const contentWithAnchors = html.replace(
    /<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_, levelRaw: string, attrsRaw: string, innerHtml: string) => {
      const level = Number(levelRaw) as 2 | 3;
      const text = stripHtml(innerHtml);

      if (!text) {
        return `<h${level}${attrsRaw}>${innerHtml}</h${level}>`;
      }

      const baseSlug = slugify(text) || "section";
      const suffix = seen.get(baseSlug) ?? 0;
      seen.set(baseSlug, suffix + 1);
      const id = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;

      toc.push({ id, text, level });
      return `<h${level}${attrsRaw} id="${id}">${innerHtml}</h${level}>`;
    }
  );

  return { contentWithAnchors, toc };
}

const Page = async ({ params }: PageProps) => {
  const { eventId } = await params;
  const event = getEventById(eventId);

  if (!event) {
    notFound();
  }

  const formattedSchedule = new Date(event.startsAt).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const statusBadgeVariant =
    event.status === "Completed"
      ? "success"
      : event.status === "Ongoing"
        ? "warning"
        : event.status === "Cancelled"
          ? "error"
          : "secondary";

  const { contentWithAnchors, toc } = prepareRichContent(event.contentHtml);

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/40 shadow-sm">
        <header className="border-b border-border/60 px-5 py-5 md:px-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/events">
              <ArrowLeft className="size-4" />
              Back to Events
            </Link>
          </Button>
        </header>

        <div className="border-b border-border/60 bg-gradient-to-b from-black to-black/90 px-5 py-8 text-white md:px-8 md:py-12">
          <div className="mx-auto w-full max-w-5xl space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <Badge variant="secondary" className="bg-white/12 text-white">
                {event.category}
              </Badge>
              <Badge variant={statusBadgeVariant} className="border-white/30">
                {event.status}
              </Badge>
              <p className="text-white/70">{formattedSchedule}</p>
            </div>

            <h1 className="max-w-4xl text-3xl leading-tight font-semibold md:text-6xl md:leading-[1.06]">
              {event.title}
            </h1>

            <p className="max-w-3xl text-base leading-8 text-white/75 md:text-2xl md:leading-10">
              {event.excerpt}
            </p>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="border-r border-border/60">
            <div className="relative h-[280px] w-full md:h-[520px]">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="bg-black px-5 py-8 text-white md:px-8 md:py-10">
              <div
                className="event-blog-content mx-auto w-full max-w-4xl"
                dangerouslySetInnerHTML={{ __html: contentWithAnchors }}
              />
            </div>
          </div>

          <aside className="space-y-5 bg-black/95 px-5 py-6 text-white md:px-6 lg:sticky lg:top-16 lg:h-fit">
            <Card className="border-border/60 bg-zinc-900/85 text-white">
              <CardContent className="space-y-3 px-5 py-5">
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5 size-10 overflow-hidden rounded-full border border-white/20">
                    <Image
                      src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(event.organizer)}`}
                      alt={event.organizer}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer}</p>
                    <p className="text-sm text-white/60">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-zinc-900/85 text-white">
              <CardContent className="space-y-3 px-5 py-5">
                <p className="text-lg font-semibold">On this page</p>
                <div className="space-y-1">
                  {toc.length > 0 ? (
                    toc.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block rounded px-2 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white ${
                          heading.level === 3 ? "pl-5" : ""
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-white/60">No sections available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-zinc-900/85 text-white">
              <CardContent className="space-y-4 px-5 py-5">
                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 size-4 text-white/70" />
                  <div>
                    <p className="text-sm font-medium text-white/85">Category</p>
                    <p className="text-sm text-white/65">{event.category}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-4 text-white/70" />
                  <div>
                    <p className="text-sm font-medium text-white/85">Schedule</p>
                    <p className="text-sm text-white/65">{formattedSchedule}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-white/70" />
                  <div>
                    <p className="text-sm font-medium text-white/85">Location</p>
                    <p className="text-sm text-white/65">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 size-4 text-white/70" />
                  <div>
                    <p className="text-sm font-medium text-white/85">Organizer</p>
                    <p className="text-sm text-white/65">{event.organizer}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <p className="text-xs text-white/50">Event ID: {event.id}</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </article>
    </section>
  );
};

export default Page;

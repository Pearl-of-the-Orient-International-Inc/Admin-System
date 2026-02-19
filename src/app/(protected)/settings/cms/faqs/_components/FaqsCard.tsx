"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { IconHelpCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { CreateFaqDialog, type CreateFaqPayload } from "./CreateFaqDialog";

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  isVisible: boolean;
  createdAt: number;
};

const ALL_TAB = "All" as const;

type FaqsCardProps = {
  initialFaqs?: FaqItem[];
};

const buildId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `faq_${Math.random().toString(16).slice(2)}`;

const SAMPLE_FAQS: FaqItem[] = [
  {
    id: "faq_sample_worship_schedule",
    category: "Worship services",
    question: "Where can I view upcoming worship service schedules?",
    answer:
      "Go to Announcements and Events, then open the schedule calendar. You can filter by worship type, location, or ministry unit.",
    isVisible: true,
    createdAt: 0,
  },
  {
    id: "faq_sample_account_access",
    category: "Account and access",
    question: "How do I change my password?",
    answer:
      "Open Settings > Account Settings > Login > Password > Edit, then follow the instructions.",
    isVisible: true,
    createdAt: 0,
  },
];

export const FaqsCard = ({ initialFaqs = [] }: FaqsCardProps) => {
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    "Worship services",
    "Seminary formation",
    "Chaplaincy care",
    "Account and access",
    "Membership and records",
    "Announcements and events",
    "Policies and compliance",
    "Technical support",
    "Other",
  ]);
  // Important: avoid non-deterministic values during SSR hydration.
  // Seed sample FAQs on the client after mount if no initialFaqs were provided.
  const [faqs, setFaqs] = useState<FaqItem[]>(() =>
    initialFaqs.length ? initialFaqs : [],
  );

  const tabsScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialFaqs.length && faqs.length === 0) {
      setFaqs(SAMPLE_FAQS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>(categoryOptions);
    faqs.forEach((faq) => unique.add(faq.category));
    return [ALL_TAB, ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [faqs, categoryOptions]);

  const filtered = useMemo(() => {
    if (activeTab === ALL_TAB) return faqs;
    return faqs.filter((faq) => faq.category === activeTab);
  }, [faqs, activeTab]);

  const visibleCount = useMemo(
    () => filtered.filter((faq) => faq.isVisible).length,
    [filtered],
  );

  const handleCreate = (payload: CreateFaqPayload) => {
    const newItem: FaqItem = {
      id: buildId(),
      category: payload.category,
      question: payload.question,
      answer: payload.answer,
      isVisible: payload.isVisible,
      createdAt: Date.now(),
    };
    setFaqs((prev) => [newItem, ...prev]);
    setActiveTab(payload.category);
  };

  const handleAddCategory = (name: string) => {
    setCategoryOptions((prev) => {
      const exists = prev.some(
        (category) =>
          category.trim().toLowerCase() === name.trim().toLowerCase(),
      );
      if (exists) return prev;
      return [...prev, name].sort((a, b) => a.localeCompare(b));
    });
  };

  const scrollTabs = (direction: "left" | "right") => {
    const element = tabsScrollRef.current;
    if (!element) return;
    const delta = direction === "left" ? -200 : 200;
    element.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p>FAQ content</p>
      </div>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <IconHelpCircle className="size-4.5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm">Help content</p>
                  <Badge variant="success">
                    {visibleCount}/{filtered.length} visible
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Organize frequently asked questions by topic and control which
                  ones are visible to members and ministry users.
                </p>
              </div>
            </div>
            <CreateFaqDialog
              categories={categoryOptions}
              onAddCategory={handleAddCategory}
              onCreate={handleCreate}
            />
          </div>

          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center gap-2">
                {categories.length > 8 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0"
                    onClick={() => scrollTabs("left")}
                    aria-label="Scroll topics left"
                  >
                    <ChevronLeft className="size-3.5" />
                  </Button>
                )}
                <div
                  ref={tabsScrollRef}
                  className="flex-1 overflow-hidden scrollbar-none"
                >
                  <TabsList variant="line">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="whitespace-nowrap"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {categories.length > 8 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0"
                    onClick={() => scrollTabs("right")}
                    aria-label="Scroll topics right"
                  >
                    <ChevronRight className="size-3.5" />
                  </Button>
                )}
              </div>

              {categories.map((category) => {
                const tabFaqs =
                  category === ALL_TAB
                    ? faqs
                    : faqs.filter((faq) => faq.category === category);

                return (
                  <TabsContent key={category} value={category} className="mt-5">
                    {tabFaqs.length === 0 ? (
                      <div className="rounded-md border p-4 text-sm text-muted-foreground">
                        No FAQs found for this category yet.
                      </div>
                    ) : (
                      <Accordion type="single" collapsible className="w-full">
                        {tabFaqs.map((faq) => (
                          <AccordionItem key={faq.id} value={faq.id}>
                            <div className="flex items-start justify-between gap-3 pr-2">
                              <AccordionTrigger className="flex-1 hover:no-underline">
                                <span className="text-left">{faq.question}</span>
                              </AccordionTrigger>
                              <div className="flex items-center gap-1.5 pt-4">
                                {!faq.isVisible && (
                                  <Badge variant="outline" className="text-xs">
                                    Hidden
                                  </Badge>
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  aria-label="Edit FAQ"
                                  // TODO: hook up edit behavior
                                >
                                  <Pencil className="size-3.5" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="xs"
                                  aria-label="Delete FAQ"
                                  // TODO: hook up delete behavior
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                            <AccordionContent>
                              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                                {faq.answer}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

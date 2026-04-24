"use client";

export type NewsBlogMediaItem = {
  id: string;
  kind: "image" | "video";
  fileName: string;
  previewUrl: string;
};

export type NewsBlogTaggedMember = {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
};

export type NewsBlogRecord = {
  id: string;
  title: string;
  caption: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  platform: "FACEBOOK";
  media: NewsBlogMediaItem[];
  taggedMembers: NewsBlogTaggedMember[];
  hashtags: string[];
  updatedAt: string;
  scheduledAt: string | null;
};

export const newsBlogRecords: NewsBlogRecord[] = [
  {
    id: "holy-week-launch",
    title: "Holy Week Service Schedule Launch",
    caption:
      "We are officially opening this year’s Holy Week ministry schedule. Please help us share the service lineup, volunteer call times, and worship reminders across your local circles.",
    status: "PUBLISHED",
    platform: "FACEBOOK",
    media: [
      {
        id: "holy-week-cover",
        kind: "image",
        fileName: "holy-week-cover.jpg",
        previewUrl:
          "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: "holy-week-candles",
        kind: "image",
        fileName: "holy-week-candles.jpg",
        previewUrl:
          "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    taggedMembers: [
      {
        id: "member-1",
        fullName: "Nathaniel Cruz",
        email: "ncruz@example.com",
        avatar: null,
      },
      {
        id: "member-2",
        fullName: "Marielle Santos",
        email: "msantos@example.com",
        avatar: null,
      },
    ],
    hashtags: ["#PearlOfTheOrient", "#HolyWeek", "#WorshipUpdate"],
    updatedAt: "2026-04-23T09:30:00+08:00",
    scheduledAt: null,
  },
  {
    id: "barangay-outreach-story",
    title: "Barangay Outreach Story Highlights",
    caption:
      "Yesterday’s outreach visit brought prayer, community care, and volunteer coordination to families in Barangay San Isidro. Here are a few moments we want to celebrate and carry forward.",
    status: "DRAFT",
    platform: "FACEBOOK",
    media: [
      {
        id: "outreach-1",
        kind: "image",
        fileName: "outreach-team.jpg",
        previewUrl:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    taggedMembers: [],
    hashtags: ["#CommunityCare", "#Outreach", "#PearlOfTheOrient"],
    updatedAt: "2026-04-24T07:10:00+08:00",
    scheduledAt: null,
  },
  {
    id: "cohort-four-teaser",
    title: "Chaplaincy Training Cohort 4 Teaser",
    caption:
      "Cohort 4 begins next week. We’re sharing a short teaser post to energize registrants and invite supporters to help amplify the training journey online.",
    status: "SCHEDULED",
    platform: "FACEBOOK",
    media: [
      {
        id: "cohort-video",
        kind: "video",
        fileName: "cohort-teaser.mp4",
        previewUrl:
          "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
    ],
    taggedMembers: [
      {
        id: "member-3",
        fullName: "Joel Ramirez",
        email: "jramirez@example.com",
        avatar: null,
      },
    ],
    hashtags: ["#ChaplaincyTraining", "#Cohort4", "#Formation"],
    updatedAt: "2026-04-24T06:45:00+08:00",
    scheduledAt: "2026-04-25T08:00:00+08:00",
  },
];

export function getNewsBlogById(newsBlogId: string) {
  return newsBlogRecords.find((record) => record.id === newsBlogId) ?? null;
}

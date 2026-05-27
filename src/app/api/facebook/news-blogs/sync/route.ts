import { NextResponse } from "next/server";

type SyncAction = "create" | "update" | "manual";

type SyncNewsBlogRequestBody = {
  action: SyncAction;
  newsBlog: {
    id: string;
    title: string;
    caption: string;
    media: Array<{
      id: string;
      kind: "image" | "video";
      previewUrl: string;
      fileName: string;
    }>;
    hashtags: string[];
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
    createdAt: string;
    updatedAt: string;
  };
};

const FACEBOOK_GRAPH_API_VERSION =
  process.env.FACEBOOK_GRAPH_API_VERSION || "v21.0";
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const FACEBOOK_SYNC_PUBLIC_POST_BASE_URL =
  process.env.FACEBOOK_SYNC_PUBLIC_POST_BASE_URL;

export async function POST(request: Request) {
  if (!FACEBOOK_PAGE_ID || !FACEBOOK_PAGE_ACCESS_TOKEN) {
    return NextResponse.json(
      {
        message:
          "Facebook Page sync is not configured yet. Add FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN to the admin environment.",
      },
      { status: 503 },
    );
  }

  let body: SyncNewsBlogRequestBody;

  try {
    body = (await request.json()) as SyncNewsBlogRequestBody;
  } catch {
    return NextResponse.json(
      { message: "Invalid sync request body." },
      { status: 400 },
    );
  }

  if (
    !body?.action ||
    !body?.newsBlog?.id ||
    !body?.newsBlog?.title?.trim() ||
    !body?.newsBlog?.caption?.trim()
  ) {
    return NextResponse.json(
      { message: "The news/blog entry is missing required sync fields." },
      { status: 400 },
    );
  }

  const message = buildFacebookPostMessage(body.action, body.newsBlog);
  const imageMediaIds = await uploadImageMediaToFacebook(body.newsBlog.media);
  const params = new URLSearchParams({
    message,
    access_token: FACEBOOK_PAGE_ACCESS_TOKEN,
  });

  if (imageMediaIds.length > 0) {
    imageMediaIds.forEach((mediaId, index) => {
      params.set(
        `attached_media[${index}]`,
        JSON.stringify({ media_fbid: mediaId }),
      );
    });
  } else {
    const publicPostUrl = buildPublicPostUrl(body.newsBlog.id);
    if (publicPostUrl) {
      params.set("link", publicPostUrl);
    }
  }

  const response = await postToFacebookFeed(params);

  const payload = (await response.json().catch(() => null)) as
    | {
        id?: string;
        error?: {
          message?: string;
        };
      }
    | null;

  if (!response.ok || !payload?.id) {
    return NextResponse.json(
      {
        message:
          payload?.error?.message ||
          "Facebook rejected the Page post request.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: "Facebook Page post published successfully.",
    postId: payload.id,
  });
}

async function uploadImageMediaToFacebook(
  media: SyncNewsBlogRequestBody["newsBlog"]["media"],
) {
  const imageItems = media
    .filter((item) => item.kind === "image" && item.previewUrl.trim())
    .slice(0, 10);

  if (!imageItems.length) {
    return [];
  }

  const uploadedMediaIds: string[] = [];

  for (const item of imageItems) {
    const params = new URLSearchParams({
      url: item.previewUrl,
      published: "false",
      temporary: "true",
      access_token: FACEBOOK_PAGE_ACCESS_TOKEN!,
    });

    const response = await fetch(
      `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${FACEBOOK_PAGE_ID}/photos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        cache: "no-store",
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | {
          id?: string;
          error?: {
            message?: string;
          };
        }
      | null;

    if (!response.ok || !payload?.id) {
      throw new Error(
        payload?.error?.message ||
          `Facebook could not attach image "${item.fileName}" to the post.`,
      );
    }

    uploadedMediaIds.push(payload.id);
  }

  return uploadedMediaIds;
}

async function postToFacebookFeed(params: URLSearchParams) {
  return fetch(
    `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${FACEBOOK_PAGE_ID}/feed`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    },
  );
}

function buildFacebookPostMessage(
  action: SyncAction,
  newsBlog: SyncNewsBlogRequestBody["newsBlog"],
) {
  const plainCaption = toPlainText(newsBlog.caption);
  const excerpt = plainCaption.length > 900
    ? `${plainCaption.slice(0, 897).trimEnd()}...`
    : plainCaption;
  const preface = getTemplatePreface(action);
  const hashtags = newsBlog.hashtags.length ? `\n\n${newsBlog.hashtags.join(" ")}` : "";

  return [
    "📣 OFFICIAL ANNOUNCEMENT",
    "",
    newsBlog.title.trim(),
    "",
    preface,
    "",
    excerpt,
    hashtags ? `${hashtags}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function toPlainText(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|blockquote|h1|h2|h3|h4|h5|h6)>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<\/(ul|ol)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim(),
  );
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function buildPublicPostUrl(newsBlogId: string) {
  const trimmedBaseUrl = FACEBOOK_SYNC_PUBLIC_POST_BASE_URL?.trim();

  if (!trimmedBaseUrl) {
    return null;
  }

  return `${trimmedBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(newsBlogId)}`;
}

function getTemplatePreface(action: SyncAction) {
  if (action === "create") {
    return "We are pleased to share a new update from Pearl of the Orient International Auxiliary Chaplain Values Educators Inc.";
  }

  if (action === "update") {
    return "We are sharing an updated news post from Pearl of the Orient International Auxiliary Chaplain Values Educators Inc.";
  }

  return "We are pleased to feature this selected news post from Pearl of the Orient International Auxiliary Chaplain Values Educators Inc.";
}

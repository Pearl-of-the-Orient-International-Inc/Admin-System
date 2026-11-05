import { NextResponse } from "next/server";

type SyncAction = "create" | "update" | "manual" | "hide" | "delete";

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
    facebookPostId?: string | null;
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
  const authorization = request.headers.get("authorization");
  const apiBaseUrl =
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_API_BASE_URL_DEV
      : process.env.NEXT_PUBLIC_API_BASE_URL_PROD;
  const databaseCredentials =
    apiBaseUrl && authorization
      ? await fetch(
          `${apiBaseUrl}/news-blogs/facebook-page-configuration/sync-credentials`,
          { headers: { Authorization: authorization }, cache: "no-store" },
        )
          .then(async (response) =>
            response.ok
              ? (
                  (await response.json()) as {
                    data: { pageId: string; accessToken: string };
                  }
                ).data
              : null,
          )
          .catch(() => null)
      : null;
  const pageId = databaseCredentials?.pageId ?? FACEBOOK_PAGE_ID;
  const accessToken =
    databaseCredentials?.accessToken ?? FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return NextResponse.json(
      {
        message:
          "Facebook Page sync is not configured yet. Save the Page ID and access token in Facebook settings.",
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

  if (body.action === "delete") {
    if (!body.newsBlog.facebookPostId) {
      return NextResponse.json({
        message: "No Facebook Page post is linked to this news/blog entry.",
      });
    }

    const response = await deleteFacebookPost(
      body.newsBlog.facebookPostId,
      accessToken,
    );
    const payload = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: {
        message?: string;
      };
    } | null;

    if (!response.ok || payload?.success === false) {
      return NextResponse.json(
        {
          message:
            payload?.error?.message ||
            "Facebook rejected the Page post delete request.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "Facebook Page post deleted successfully.",
      postId: body.newsBlog.facebookPostId,
      mode: "deleted",
    });
  }

  if (body.action === "hide") {
    if (!body.newsBlog.facebookPostId) {
      return NextResponse.json({
        message: "No Facebook Page post is linked to this news/blog entry.",
      });
    }

    const response = await hideFacebookPost(
      body.newsBlog.facebookPostId,
      accessToken,
    );
    const payload = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: {
        message?: string;
      };
    } | null;

    if (!response.ok || payload?.success === false) {
      return NextResponse.json(
        {
          message:
            payload?.error?.message ||
            "Facebook rejected the Page post visibility request.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "Facebook Page post hidden successfully.",
      postId: body.newsBlog.facebookPostId,
      mode: "hidden",
    });
  }

  const message = buildFacebookPostMessage(body.action, body.newsBlog);

  if (body.newsBlog.facebookPostId) {
    const response = await updateFacebookPost(
      body.newsBlog.facebookPostId,
      message,
      accessToken,
    );

    const payload = (await response.json().catch(() => null)) as {
      success?: boolean;
      error?: {
        message?: string;
      };
    } | null;

    if (!response.ok || payload?.success === false) {
      return NextResponse.json(
        {
          message:
            payload?.error?.message ||
            "Facebook rejected the Page post update request.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "Facebook Page post updated successfully.",
      postId: body.newsBlog.facebookPostId,
      mode: "updated",
    });
  }

  const imageMediaIds = await uploadImageMediaToFacebook(body.newsBlog.media, {
    pageId,
    accessToken,
  });
  const params = new URLSearchParams({
    message,
    access_token: accessToken,
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

  const response = await postToFacebookFeed(params, pageId);

  const payload = (await response.json().catch(() => null)) as {
    id?: string;
    error?: {
      message?: string;
    };
  } | null;

  if (!response.ok || !payload?.id) {
    return NextResponse.json(
      {
        message:
          payload?.error?.message || "Facebook rejected the Page post request.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: "Facebook Page post published successfully.",
    postId: payload.id,
    mode: "created",
  });
}

async function uploadImageMediaToFacebook(
  media: SyncNewsBlogRequestBody["newsBlog"]["media"],
  credentials: { pageId: string; accessToken: string },
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
      access_token: credentials.accessToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${credentials.pageId}/photos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        cache: "no-store",
      },
    );

    const payload = (await response.json().catch(() => null)) as {
      id?: string;
      error?: {
        message?: string;
      };
    } | null;

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

async function postToFacebookFeed(params: URLSearchParams, pageId: string) {
  return fetch(
    `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${pageId}/feed`,
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

async function updateFacebookPost(
  postId: string,
  message: string,
  accessToken: string,
) {
  const params = new URLSearchParams({
    message,
    is_hidden: "false",
    access_token: accessToken,
  });

  return fetch(
    `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${encodeURIComponent(postId)}`,
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

async function hideFacebookPost(postId: string, accessToken: string) {
  const params = new URLSearchParams({
    is_hidden: "true",
    access_token: accessToken,
  });

  return fetch(
    `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${encodeURIComponent(postId)}`,
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

async function deleteFacebookPost(postId: string, accessToken: string) {
  const params = new URLSearchParams({
    access_token: accessToken,
  });

  return fetch(
    `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${encodeURIComponent(postId)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    },
  );
}

function buildFacebookPostMessage(
  _action: SyncAction,
  newsBlog: SyncNewsBlogRequestBody["newsBlog"],
) {
  return toPlainText(newsBlog.caption);
}

function toPlainText(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(
        /<\/(p|div|section|article|blockquote|h1|h2|h3|h4|h5|h6)>/gi,
        "\n\n",
      )
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

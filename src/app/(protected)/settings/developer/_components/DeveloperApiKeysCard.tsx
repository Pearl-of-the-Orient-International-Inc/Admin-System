"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconKey } from "@tabler/icons-react";
import { Copy, ExternalLink } from "lucide-react";

const FRONTEND_API_URL = "https://pearl-of-the-orient.com";
const BACKEND_API_URL = "https://api.pearl-of-the-orient.com/v1/api";

export const DeveloperApiKeysCard = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(
        () => setCopied((current) => (current === label ? null : current)),
        1500,
      );
    } catch {
      // ignore clipboard errors in unsupported environments
    }
  };

  return (
    <div>
      <p>API keys & environment</p>
      <Card className="bg-transparent mt-4">
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <IconKey className="size-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm">Workspace API access</p>
                <Badge variant="success">Variables</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Use these keys to integrate your platform backend,
                user data, and third-party apps with this workspace. Keep
                secret keys on the server only.
              </p>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Publishable key
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value="pk_test_example_publishable_key"
                    className="font-mono text-xs"
                    type="password"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      handleCopy("pk_test_example_publishable_key", "pk")
                    }
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Safe to use in browser-based storefronts. Identifies this
                  workspace but cannot modify sensitive data alone.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Secret key
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    type="password"
                    value="sk_live_example_secret_key"
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      handleCopy("sk_live_example_secret_key", "sk")
                    }
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Secret keys grant admin-level access to the API. Store only in
                  backend environments and rotate regularly.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-1 lg:col-span-2 border-r pr-5">
              <div className="space-y-2.5">
                <span className="text-muted-foreground font-medium text-xs">Frontend URL</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    readOnly
                    value={FRONTEND_API_URL}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(FRONTEND_API_URL, "frontend-url")}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
                <span className="text-muted-foreground text-xs font-medium">Backend API URL</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    readOnly
                    value={BACKEND_API_URL}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(BACKEND_API_URL, "backend-url")}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">API provider</span>
                <span className="font-mono">Node & Express JS</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Webhooks</span>
                <span className="font-mono">16 hooks available</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Changelog</span>
                <span className="font-mono">AI & app integration</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Configured API version
                </span>
                <span className="font-mono">2026-01-10</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Latest API version
                </span>
                <span className="font-mono">v.1.0.5</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            For more information, {" "}
            {/* TODO: This is the domain API for now. */}
            <a
              target="_blank"
              href="https://kylemastercoder.gitbook.io/1-market-villamor-api/"
              className="font-medium text-foreground underline underline-offset-4 inline-flex items-center gap-1 hover:no-underline"
            >
              Learn about API keys
              <ExternalLink className="size-3" />
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

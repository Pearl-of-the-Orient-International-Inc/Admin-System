"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconUserSearch } from "@tabler/icons-react";

type RestrictUserFormCardProps = {
  onRestrict: (query: string) => void;
  isRestricting?: boolean;
};

export const RestrictUserFormCard = ({
  onRestrict,
  isRestricting = false,
}: RestrictUserFormCardProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onRestrict(trimmed);
    setQuery("");
  };

  return (
    <div>
      <p>Restrict a user</p>
      <Card className="bg-transparent mt-4">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="relative rounded-md shadow-xs">
              <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
                <IconUserSearch className="size-4" />
                <span className="sr-only">Search</span>
              </div>
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="peer px-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
                placeholder="Search..."
                disabled={isRestricting}
              />
              <Button type="submit" className='absolute inset-y-0 right-0 rounded-tl-none rounded-bl-none' disabled={!query.trim() || isRestricting}>
                Restrict user
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Search by username, full name or email address
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

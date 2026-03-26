"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center bg-[linear-gradient(115.43deg,#fff_.45%,#fff3ed)] px-6 py-14 md:px-10 lg:px-16">
      <section className="mx-auto grid w-full max-w-340 gap-12 md:grid-cols-2 md:items-center lg:gap-20">
        <div className="max-w-xl">
          <Image
            src="/main/logo.png"
            alt="Pearl"
            width={190}
            height={54}
            priority
            className="h-auto w-37.5 md:w-47.5"
          />
          <h1 className="mt-10 text-3xl font-bold">
            Oops, something went wrong
          </h1>
          <p className="mt-6 text-muted-foreground">
            The page you’re looking for doesn’t exist or is still under
            development. Our developer is currently busy building it—please
            check back soon.
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              Back to the current page
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-186">
          <Image
            src="/svg-vector/under-development.svg"
            alt="Under Development"
            width={760}
            height={460}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>
    </main>
  );
}

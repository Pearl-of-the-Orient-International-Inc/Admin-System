/* eslint-disable @next/next/no-img-element */
import { Suspense } from "react";
import { ConfirmAccountForm } from "@/components/forms/ConfirmAccountForm";
import Image from "next/image";
import Link from "next/link";

const Page = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link prefetch href="/" className="flex items-center gap-3">
            <div className="relative size-13">
              <Image priority alt="Logo" fill src="/main/logo.png" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                Pearl of the Orient International Auxiliary Chaplain Values Educators Inc.
              </h3>
              <p className="text-muted-foreground text-sm">Admin Portal</p>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Suspense fallback={null}>
              <ConfirmAccountForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/main/news.jpg"
          alt="Auth BG"
          className="absolute inset-0 h-full w-full object-cover z-0"
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-transparent to-primary/70" />
      </div>
    </div>
  );
};

export default Page;

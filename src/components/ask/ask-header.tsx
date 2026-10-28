import Image from "next/image";
import Link from "next/link";
import { LegoStuds, brickStyle } from "./lego-brick";

export function AskHeader() {
  return (
    <header className="ask-header mx-auto w-full max-w-[1720px] px-6 py-5">
      <Image
        src="/brand/portfolio-edition.webp"
        alt="Portfolio Edition"
        width={1200}
        height={281}
        priority
        sizes="(min-width: 640px) 112px, 76px"
        className="ask-header__edition h-auto"
      />
      <Image
        src="/brand/ibtasaam-wordmark.webp"
        alt="Ibtasaam"
        width={1800}
        height={527}
        priority
        sizes="(min-width: 640px) 144px, 104px"
        className="ask-header__wordmark h-auto"
      />
      <Link
        href="/"
        prefetch={false}
        className="lego-brick ask-header__back"
        style={brickStyle("yellow")}
      >
        <LegoStuds count={3} />
        <span aria-hidden>←</span>
        <span>Title screen</span>
      </Link>
    </header>
  );
}

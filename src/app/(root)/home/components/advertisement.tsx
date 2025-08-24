"use client";
import Image from "next/image";
import React from "react";
import { type CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

function Advertisement() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <div className="flex justify-center my-2 py-5 mx-auto bg-white shadow rounded-xl w-full">
      {/* Carousel bên trái */}
      <div className="flex-1 mx-5 group relative">
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            <CarouselItem className="cursor-pointer">
              <div className="relative w-full aspect-[16/5]">
                <Image
                  src="/2.png"
                  alt="Banner 1"
                  fill
                  quality={100}
                  className="object-cover object-center rounded-md"
                  sizes="(min-width: 1024px) 75vw, 100vw"
                  priority
                />
              </div>
            </CarouselItem>
            <CarouselItem className="cursor-pointer">
              <div className="relative w-full aspect-[16/5]">
                <Image
                  src="/3.png"
                  alt="Banner 2"
                  fill
                  quality={100}
                  className="object-cover object-center rounded-md"
                  sizes="(min-width: 1024px) 75vw, 100vw"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="cursor-pointer">
              <div className="relative w-full aspect-[16/5]">
                <Image
                  src="/4.png"
                  alt="Banner 3"
                  fill
                  quality={100}
                  className="object-cover object-center rounded-md"
                  sizes="(min-width: 1024px) 75vw, 100vw"
                />
              </div>
            </CarouselItem>
          </CarouselContent>

          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 group-hover:block" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 group-hover:block" />

          {/* Dot indicator */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2 z-10">
            {Array.from({ length: count }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => api && api.scrollTo(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  current === idx ? "bg-white" : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>

      {/* Quảng cáo bên phải */}
      <div className="w-[25%] mr-5 flex flex-col gap-3">
        <div className="relative flex-1 rounded-md overflow-hidden cursor-pointer">
          <Image
            src="/qc11.jpg"
            alt="QC1"
            fill
            className="object-cover object-center"
            quality={100}
          />
        </div>
        <div className="relative flex-1 rounded-md overflow-hidden cursor-pointer">
          <Image
            src="/qc22.jpg"
            alt="QC1"
            fill
            className="object-cover object-center"
            quality={100}
          />
        </div>
      </div>
    </div>
  );
}

export default Advertisement;

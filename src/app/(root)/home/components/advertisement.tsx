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
    <div
      className="flex justify-center my-2 py-5 mx-auto bg-white rounded-xl w-[80%]"
      // style={{
      //   boxShadow: "0 0 20px rgba(148, 163, 184, 0.3)",
      // }}
    >
      <Carousel
        setApi={setApi}
        className="flex-1 h-[380px] mx-5 group relative"
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          <CarouselItem className="cursor-pointer">
            <Image
              src="/2.png"
              alt="Stream Card Logo"
              width={900}
              height={304}
              quality={100}
              className="w-full h-[380px] object-center rounded-md"
            />
          </CarouselItem>
          <CarouselItem className="cursor-pointer">
            <Image
              src="/3.png"
              alt="Stream Card Logo"
              width={900}
              height={304}
              quality={100}
              className="w-full h-[380px] object-center rounded-md"
            />
          </CarouselItem>
          <CarouselItem className="cursor-pointer">
            <Image
              src="/4.png"
              alt="Stream Card Logo"
              width={900}
              height={304}
              quality={100}
              className="w-full h-[380px] object-center rounded-md"
            />
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

      <div className="w-[25%] flex flex-col gap-4 mr-5">
        <div className="bg-black h-[182px] w-full rounded-md cursor-pointer">
          {" "}
          <Image
            src="/qc1.jfif"
            alt="Stream Card Logo"
            width={900}
            height={304}
            quality={100}
            className="w-full h-full object-center rounded-md"
          />
        </div>
        <div className="bg-[#B0F847] h-[182px] w-full rounded-md"></div>
      </div>
    </div>
  );
}

export default Advertisement;

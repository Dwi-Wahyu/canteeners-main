"use client";

import * as React from "react";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

// Mock data for the banner
const BANNERS = [
    {
        id: 1,
        image: "/banners/1.png",
    },
    {
        id: 2,
        image: "/banners/2.png",
    },
    {
        id: 3,
        image: "/banners/3.png",
    },
];

export function BannerSlider() {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <div className="w-full pt-4">
            <Carousel
                setApi={setApi}
                className="w-full"
                opts={{
                    loop: true,
                    align: "center",
                }}
            >
                <CarouselContent className="mx-4">
                    {BANNERS.map((banner) => (
                        <CarouselItem key={banner.id} className="pl-4 py-2 basis-[85%] md:basis-[45%] lg:basis-[30%]">
                            <div
                                className={cn(
                                    "relative overflow-hidden rounded-2xl h-[160px] flex items-center justify-center shadow-sm",
                                    "bg-muted" // Fallback background
                                )}
                            >
                                <Image
                                    src={banner.image}
                                    alt="Banner"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 30vw"
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: count }).map((_, index) => (
                    <button
                        key={index}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            current === index ? "w-6 bg-green-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                        )}
                        onClick={() => api?.scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

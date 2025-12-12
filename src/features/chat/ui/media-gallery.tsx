import * as React from "react";
import { X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { MediaItem } from "../lib/chat-types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Ensure accessible titles

interface MediaGalleryProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialIndex: number;
    mediaItems: MediaItem[];
}

export function MediaGallery({
    isOpen,
    onOpenChange,
    initialIndex,
    mediaItems,
}: MediaGalleryProps) {
    const [api, setApi] = React.useState<CarouselApi>();

    React.useEffect(() => {
        if (api) {
            api.scrollTo(initialIndex, true);
        }
    }, [api, initialIndex, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full h-svh flex flex-col items-center justify-center p-0 bg-transparent border-none shadow-none text-white">
                <VisuallyHidden>
                    <DialogTitle>Media Gallery</DialogTitle>
                    <DialogDescription>View images and videos from the chat</DialogDescription>
                </VisuallyHidden>
                <div className="absolute top-4 right-4 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full bg-black/50 hover:bg-black/70 text-white"
                    >
                        <X className="size-5" />
                    </Button>
                </div>

                <Carousel setApi={setApi} className="w-full max-w-3xl h-full flex items-center">
                    <CarouselContent className="h-full">
                        {mediaItems.map((item, index) => (
                            <CarouselItem key={index} className="flex items-center justify-center h-full pt-0">
                                <div className="w-full h-full flex items-center justify-center">
                                    {item.contentType.startsWith("video/") ? (
                                        <video
                                            src={item.url}
                                            controls
                                            autoPlay={index === initialIndex}
                                            className="max-h-full max-w-full rounded-md object-contain"
                                        />
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt="attachment"
                                            className="max-h-full max-w-full rounded-md object-contain"
                                        />
                                    )}
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* <CarouselPrevious className="left-2 bg-black/50 border-none text-white hover:bg-black/70 hover:text-white" /> */}
                    {/* <CarouselNext className="right-2 bg-black/50 border-none text-white hover:bg-black/70 hover:text-white" /> */}
                </Carousel>
            </DialogContent>
        </Dialog>
    );
}

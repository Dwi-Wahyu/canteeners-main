"use client";

import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Card, CardContent } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetShopTestimonies } from "../types/shop-queries-types";
import { CircleUser, Star } from "lucide-react";

export default function ShopTestimonyDisplayClient({
    data
}: {
    data: GetShopTestimonies;
}) {
    return (
        <div>
            {data && data.length === 0 && <EmptyTestimony />}

            <div className="flex flex-col gap-4">
                {data.map((testimony, idx) => (
                    <Card key={idx}>
                        <CardContent className="flex gap-3 items-start">
                            <Avatar>
                                <AvatarImage
                                    src={"/uploads/avatar/" + testimony.order.customer.user.avatar}
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>

                            <div className="w-full">
                                <div className="flex gap-1 items-center justify-between">
                                    <h1 className="font-semibold">
                                        {testimony.order.customer.user.name}
                                    </h1>

                                    <div className="flex gap-1 items-center">
                                        <Star className="w-4 h-4" />
                                        <h1 className="font-semibold">{testimony.rating}</h1>
                                    </div>
                                </div>
                                <h1>{testimony.message}</h1>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function EmptyTestimony() {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CircleUser />
                </EmptyMedia>
                <EmptyTitle>Belum Ada Testimoni</EmptyTitle>
                <EmptyDescription>
                    Belum ada testimoni dari pelanggan. Jadilah yang pertama memberikan
                    pengalamanmu!
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
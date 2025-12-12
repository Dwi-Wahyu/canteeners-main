import NavButton from "@/components/nav-button";
import { ChevronLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function CanteenTopbar({ shopCount }: { shopCount: number }) {
    return (
        <div className="p-5 shadow border-b">
            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <Link href={"/"}>
                        <ChevronLeft className="text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="font-semibold leading-tight text-xl">Pilih Kedai</h1>
                        <h1 className="text-sm text-muted-foreground">
                            {shopCount} kedai tersedia
                        </h1>
                    </div>
                </div>

                <NavButton href={"/chat"}>
                    <MessageCircle />
                    Chat
                </NavButton>
            </div>
        </div>
    );
}

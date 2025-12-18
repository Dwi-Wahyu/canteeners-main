import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmptyConversationList() {
    return (
        <div className="text-center flex-col p-4 border shadow rounded-xl flex justify-center gap-2 items-center text-muted-foreground">
            <h1 className="font-semibold">Percakapan Masih Kosong</h1>

            <h1 className="text-sm">
                Percakapan yang lebih dari satu bulan akan dihapus secara otomatis.
                Silakan buat order untuk memulai percakapan baru.
            </h1>

            <Button className="mt-2" variant={"outline"}>
                <Link href={"/kebijakan-dan-privasi"}>Pelajari Selengkapnya</Link>
            </Button>
        </div>
    );
}
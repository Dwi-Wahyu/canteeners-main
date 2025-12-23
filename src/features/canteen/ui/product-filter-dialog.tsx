"use client"

import NavButton from "@/components/nav-button"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter, SlidersHorizontal, Store } from "lucide-react"
import { useQueryState } from "nuqs"

export function ProductFilterDialog() {

    const [minPrice, setMinPrice] = useQueryState("minimumPrice", {
        shallow: false,
        clearOnDefault: true,
        defaultValue: "0",
    });

    const [maxPrice, setMaxPrice] = useQueryState("maximumPrice", {
        shallow: false,
        clearOnDefault: true,
        defaultValue: "0",
    });

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant={'outline'} size={'icon-lg'}>
                        <SlidersHorizontal />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Sesuaikan Harga</DialogTitle>
                        <DialogDescription>
                            Sesuaikan harga produk yang ingin Anda cari.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Harga Minimum</Label>
                            <Input value={parseInt(minPrice ?? 0)} onChange={(e) => setMinPrice(e.target.value)} type="number" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="username-1">Harga Maksimum</Label>
                            <Input value={parseInt(maxPrice ?? 0)} onChange={(e) => setMaxPrice(e.target.value)} type="number" />
                        </div>
                    </div>
                    <DialogFooter>

                        <NavButton href="/kedai" variant="link" size="lg">
                            <Store />
                            Lihat Daftar Kedai
                        </NavButton>
                        <Button size={'lg'} type="submit"><Filter /> Cari</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

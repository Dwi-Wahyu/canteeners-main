
"use client"

import { Input } from "@/components/ui/input"
import { useQueryState } from "nuqs";


export default function PriceRangeFilter() {

    const [minPrice, setMinPrice] = useQueryState("minimumPrice", {
        shallow: false,
        clearOnDefault: true,
        defaultValue: "",
    });

    const [maxPrice, setMaxPrice] = useQueryState("maximumPrice", {
        shallow: false,
        clearOnDefault: true,
        defaultValue: "",
    });

    return <div className="flex gap-4 items-center">

        <Input
            placeholder="Minimum Harga"
            value={minPrice}
            type="number"
            onChange={(ev) => setMinPrice(ev.target.value)}
        />

        <Input
            placeholder="Maximum Harga"
            value={maxPrice}
            type="number"
            onChange={(ev) => setMaxPrice(ev.target.value)}
        />

    </div>
}
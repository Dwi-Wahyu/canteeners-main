"use client";

import { Badge } from "./ui/badge";

type BadgeVariant =
    | "default"
    | "secondary"
    | "success" // Jika ini adalah custom variant
    | "destructive"
    | "outline";

type CustomBadgeProps = {
    outlineValues?: string[];
    destructiveValues?: string[];
    successValues?: string[];
    value: string;
    children?: React.ReactNode;
    className?: string;
};

function checkIfValueInOptions(value: string, options?: string[]): boolean {
    if (!options) return false;

    const normalizedValue = value.toLowerCase();
    return options.some((option) => option.toLowerCase() === normalizedValue);
}

export default function CustomBadge({
    outlineValues,
    destructiveValues,
    successValues,
    value,
    children,
    className = "",
}: CustomBadgeProps) {
    let selectedVariant: BadgeVariant = "default";

    if (checkIfValueInOptions(value, destructiveValues)) {
        selectedVariant = "destructive";
    } else if (checkIfValueInOptions(value, successValues)) {
        selectedVariant = "success";
    } else if (checkIfValueInOptions(value, outlineValues)) {
        selectedVariant = "outline";
    }

    return (
        <Badge className={className} variant={selectedVariant}>
            {children || value}
        </Badge>
    );
}

// --- Contoh Penggunaan ---
/*

<CustomBadge
    value="Dibatalkan"
    children="DIBATALKAN"
    outlineValues={["draft", "menunggu"]}
    destructiveValues={["dibatalkan", "gagal", "tolak"]}
    successValues={["selesai", "terbayar", "aktif"]}
/>

// Badge akan berwarna merah (destructive) dengan teks DIBATALKAN.
*/

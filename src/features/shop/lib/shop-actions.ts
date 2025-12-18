"use server";

import { prisma } from "@/lib/prisma";
import { UpdateShopInput } from "../types/shop-schema";
import { revalidatePath } from "next/cache";
import { errorResponse, ServerActionReturn, successResponse } from "@/helper/action-helper";

export async function updateShop(
    payload: UpdateShopInput
): Promise<ServerActionReturn<void>> {
    try {
        const { id, open_time, close_time, ...data } = payload;

        let openTimeDate: Date | null = null;
        let closeTimeDate: Date | null = null;

        if (open_time) {
            const [hours, minutes] = open_time.split(":").map(Number);
            openTimeDate = new Date();
            openTimeDate.setHours(hours, minutes, 0, 0);
        }

        if (close_time) {
            const [hours, minutes] = close_time.split(":").map(Number);
            closeTimeDate = new Date();
            closeTimeDate.setHours(hours, minutes, 0, 0);
        }

        await prisma.shop.update({
            where: {
                id,
            },
            data: {
                ...data,
                open_time: openTimeDate,
                close_time: closeTimeDate,
            },
        });

        revalidatePath("/dashboard-kedai/pengaturan");
        revalidatePath("/dashboard-kedai/pengaturan/edit-kedai");

        return successResponse(undefined, "Berhasil update toko");
    } catch (error) {
        console.error("Error updating shop:", error);
        return errorResponse("Terjadi kesalahan saat mengupdate toko");
    }
}

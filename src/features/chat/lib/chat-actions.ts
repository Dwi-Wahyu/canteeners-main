"use server";

import { errorResponse, ServerActionReturn, successResponse } from "@/helper/action-helper";
import { QuickChatInput } from "../types/chat-schema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQuickChat(
    payload: QuickChatInput
): Promise<ServerActionReturn<void>> {
    try {
        console.log(payload);


        await prisma.quickChat.create({
            data: payload,
        });
        revalidatePath("/dashboard-kedai/pengaturan/pesan-singkat");
        return successResponse(undefined, "Berhasil menambahkan pesan singkat");
    } catch (error) {
        console.log(error);

        return errorResponse("Terjadi kesalahan");
    }
}

export async function deleteQuickChat(
    id: number
): Promise<ServerActionReturn<void>> {
    try {
        await prisma.quickChat.delete({
            where: {
                id,
            },
        });
        revalidatePath("/dashboard-kedai/pengaturan/pesan-singkat");
        return successResponse(undefined, "Berhasil menambahkan pesan singkat");
    } catch (error) {
        console.log(error);

        return errorResponse("Terjadi kesalahan");
    }
}
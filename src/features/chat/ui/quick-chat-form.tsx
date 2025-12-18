"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader, MessageCirclePlus, Save } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { QuickChatInput, QuickChatSchema } from "../types/chat-schema";
import { createQuickChat } from "../lib/chat-actions";

export default function QuickChatForm({ user_id }: { user_id: string }) {
    const [showDialog, setShowDialog] = useState(false);

    const form = useForm<QuickChatInput>({
        resolver: zodResolver(QuickChatSchema),
        defaultValues: {
            message: "",
            user_id,
        },
    });

    const onSubmit = async (data: QuickChatInput) => {
        const result = await createQuickChat(data);

        if (result.success) {
            toast.success(result.message);
            form.setValue('message', '')
        } else {
            toast.error(result.error.message);
        }

        setShowDialog(false);
    };

    return (
        <Dialog onOpenChange={setShowDialog} open={showDialog}>
            <DialogTrigger asChild>
                <Button size={"icon"}>
                    <MessageCirclePlus />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="hidden"></DialogTitle>
                    <DialogDescription className="hidden"></DialogDescription>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg font-semibold">Tambahkan Pesan Singkat</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-40" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-start" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                disabled={form.formState.isSubmitting}
                                type="submit"
                                className="mt-5 py-6 w-full"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader className="animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <Save />
                                        Simpan
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
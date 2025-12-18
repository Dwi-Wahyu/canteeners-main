import { auth } from "@/config/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { getShopById } from "@/features/shop/lib/shop-queries";
import EditShopForm from "@/features/shop/ui/edit-shop-form";

export default async function EditShopPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    if (!session.user.shopId) {
        return notFound()
    }

    const shop = await getShopById(session.user.shopId);

    if (!shop) {
        return notFound()
    }

    return (
        <div className="p-5 pt-24">
            <TopbarWithBackButton
                title="Edit Data Kedai"
                backUrl="/dashboard-kedai/pengaturan"
            />

            <Card>
                <CardContent>
                    <EditShopForm initialData={shop} />
                </CardContent>
            </Card>
        </div>
    );
}
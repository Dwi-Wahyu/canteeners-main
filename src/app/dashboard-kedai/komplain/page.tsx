import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { getShopComplaints } from "@/features/shop/complaint/lib/complaint-queries";
import ComplaintsListClient from "@/features/shop/complaint/ui/complaints-list-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquareWarning } from "lucide-react";

export default async function ComplaintsPage() {
  const session = await auth();

  if (!session || !session.user.id) {
    redirect("/login-kedai");
  }

  if (!session.user.shopId) {
    return (
      <div className="p-8">
        <h1>Anda belum memiliki kedai. Hubungi admin untuk pembuatan kedai.</h1>
      </div>
    );
  }

  const complaints = await getShopComplaints(session.user.shopId);

  // Count by status
  const pendingCount = complaints.filter((c) => c.status === "PENDING").length;
  const underReviewCount = complaints.filter(
    (c) => c.status === "UNDER_REVIEW"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "RESOLVED"
  ).length;
  const rejectedCount = complaints.filter(
    (c) => c.status === "REJECTED"
  ).length;

  return (
    <div className="space-y-5">
      <div className="mb-5">
        <h2 className="text-2xl font-medium tracking-tight">
          Komplain Pelanggan
        </h2>
        <div className="text-muted-foreground">
          Kelola dan tanggapi komplain dari pelanggan Anda
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 ">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Menunggu</CardDescription>
            <CardTitle className="text-3xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ditinjau</CardDescription>
            <CardTitle className="text-3xl">{underReviewCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Terselesaikan</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {resolvedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ditolak</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {rejectedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Complaints List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Semua Komplain</h3>
        <ComplaintsListClient complaints={complaints} />
      </div>
    </div>
  );
}

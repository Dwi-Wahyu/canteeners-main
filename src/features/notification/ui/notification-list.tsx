"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AppNotification } from "../types";
import { db } from "@/lib/firebase/client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ShoppingCart, RefreshCcw, AlertCircle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getUserReports } from "@/features/user/lib/user-queries";
import { GetUserReportsType } from "@/features/user/types/user-queries-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gavel, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationList() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reports, setReports] = useState<GetUserReportsType>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AppNotification[];

        setNotifications(docs);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("❌ Firestore notification error:", err);
        if (err.message.includes("index")) {
          setError(
            "Firestore index required. Check console for the index creation link.",
          );
        } else {
          setError(`Error loading notifications: ${err.message}`);
        }
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    setIsMarkingRead(true);
    const batch = writeBatch(db);
    unreadNotifications.forEach((n) => {
      const notificationRef = doc(db, "notifications", n.id);
      batch.update(notificationRef, { isRead: true });
    });

    try {
      await batch.commit();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoadingReports(true);
      getUserReports(user.uid)
        .then((data) => {
          setReports(data);
        })
        .finally(() => {
          setIsLoadingReports(false);
        });
    }
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case "REFUND":
        return <RefreshCcw className="h-5 w-5 text-orange-500" />;
      case "COMPLAINT":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"
          >
            <Clock className="w-3 h-3" /> Menunggu
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 gap-1"
          >
            <Eye className="w-3 h-3" /> Ditinjau
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> Selesai
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 gap-1"
          >
            <XCircle className="w-3 h-3" /> Ditolak
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Tabs defaultValue="notifications" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
        <TabsTrigger value="reports">Laporan Saya</TabsTrigger>
      </TabsList>

      <TabsContent value="notifications" className="space-y-3">
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary h-8 gap-1"
              onClick={markAllAsRead}
              disabled={isMarkingRead}
            >
              <CheckCircle className="w-3 h-3" />
              Tandai semua dibaca
            </Button>
          </div>
        )}
        {error ? (
          <Card className="border-destructive">
            <CardContent>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-destructive text-sm">
                    Gagal Memuat Notifikasi
                  </p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Bell className="mx-auto h-10 w-10 mb-2 opacity-20" />
            <p>Belum ada notifikasi.</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const date = notification.createdAt?.toDate
              ? notification.createdAt.toDate()
              : new Date();

            return (
              <Link
                href={notification.resourcePath || "#"}
                key={notification.id}
                className="block"
              >
                <Card
                  className={`hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="flex items-start gap-4">
                    <div className="mt-1 bg-background p-2 rounded-full border shadow-sm">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold text-sm">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.body}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(date, {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </TabsContent>

      <TabsContent value="reports" className="space-y-3">
        {isLoadingReports ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Gavel className="mx-auto h-10 w-10 mb-2 opacity-20" />
            <p>Belum ada riwayat laporan.</p>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardContent className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-bold">
                        Laporan #{report.category}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tight font-bold">
                    Melaporkan Pengguna
                  </p>
                  <p className="text-sm font-semibold">
                    {report.reported_user.name}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground">
                    Deskripsi Kejadian:
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed italic">
                    "{report.description}"
                  </p>
                </div>

                {report.admin_note && (
                  <div className="mt-2 pt-2 border-t border-dashed">
                    <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Tanggapan Admin:
                    </p>
                    <p className="text-xs text-gray-800 bg-primary/5 p-2 rounded-md">
                      {report.admin_note}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}

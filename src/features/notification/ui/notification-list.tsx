"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  ShoppingCart,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronDownIcon,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { getUserReports } from "@/features/user/lib/user-queries";
import { GetUserReportsType } from "@/features/user/types/user-queries-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gavel,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ListCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationListPaginated } from "../hooks/use-notification-list-paginated";
import { InfiniteScrollTrigger } from "@/features/chat/ui/infinite-scroll-trigger";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function NotificationList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back_url") || "/dashboard-kedai";

  const {
    notifications,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    user,
    markAllAsRead,
    isMarkingRead,
    deleteNotification,
  } = useNotificationListPaginated();

  const [reports, setReports] = useState<GetUserReportsType>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

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

  const filteredNotifications = notifications.filter((n) => {
    if (!dateFilter) return true;
    const nDate = n.createdAt?.toDate ? n.createdAt.toDate() : new Date();
    return format(nDate, "yyyy-MM-dd") === format(dateFilter, "yyyy-MM-dd");
  });

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="reports">Laporan Saya</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-3">
          <div className="flex gap-4 mb-4 items-center">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="grow sm:w-auto justify-between font-normal text-left"
                >
                  {dateFilter
                    ? format(dateFilter, "PPP", { locale: idLocale })
                    : "Pilih tanggal"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={(date) => {
                    setDateFilter(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            {dateFilter && (
              <Button
                variant="ghost"
                onClick={() => setDateFilter(undefined)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={isMarkingRead}
              >
                <ListCheck />
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
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
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <Bell className="mx-auto h-10 w-10 mb-2 opacity-20" />
              <p>Tidak ada notifikasi.</p>
            </div>
          ) : (
            <>
              {filteredNotifications.map((notification) => {
                const date = notification.createdAt?.toDate
                  ? notification.createdAt.toDate()
                  : new Date();

                return (
                  <div key={notification.id} className="relative group block">
                    <Link
                      href={notification.resourcePath || "#"}
                      className="block"
                    >
                      <Card
                        className={`hover:bg-muted/50 transition-colors ${
                          !notification.isRead
                            ? "border-l-4 border-l-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <CardContent className="flex items-start gap-4">
                          <div className="mt-1 bg-background p-2 rounded-full border shadow-sm">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-sm pr-6">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.body}
                            </p>
                            <div className="flex gap-2 pt-1">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(date, {
                                  addSuffix: true,
                                  locale: idLocale,
                                })}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all bg-background/50 backdrop-blur-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Hapus notifikasi</span>
                    </Button>
                  </div>
                );
              })}
              {filteredNotifications.length > 0 && !dateFilter && (
                <InfiniteScrollTrigger
                  onIntersect={loadMore}
                  isLoading={isLoadingMore}
                  hasMore={hasMore}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-3">
          {isLoadingReports ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-muted animate-pulse rounded-lg"
                />
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
                            locale: idLocale,
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
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/helper/format-rupiah";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { getShopDashboardStats } from "../lib/shop-queries";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

type DashboardStatsProps = {
  stats: Awaited<ReturnType<typeof getShopDashboardStats>>;
  period: "today" | "week" | "month" | "all";
};

const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function DashboardStats({ stats, period }: DashboardStatsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`?${params.toString()}`);
  };

  const periodLabels = {
    today: "Hari Ini",
    week: "Minggu Ini",
    month: "Bulan Ini",
    all: "Semua Waktu",
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        defaultValue={period}
        className="w-full"
        onValueChange={handlePeriodChange}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Hari</TabsTrigger>
          <TabsTrigger value="week">Minggu</TabsTrigger>
          <TabsTrigger value="month">Bulan</TabsTrigger>
          <TabsTrigger value="all">Semua</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid w-full grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendapatan Bersih {periodLabels[period]}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(stats.totalNetRevenueInPeriod)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hasil bersih yang Anda terima
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pesanan {periodLabels[period]}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOrdersInPeriod}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pesanan selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Omzet {periodLabels[period]}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(stats.totalRevenueInPeriod)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total kotor {periodLabels[period].toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refund</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRefundsInPeriod}
            </div>
            <p className="text-xs text-muted-foreground">Refund yang diproses</p>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Grafik Pendapatan (7 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] w-full"
            >
              <AreaChart accessibilityLayer data={stats.chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="var(--color-revenue)"
                  fillOpacity={0.4}
                  stroke="var(--color-revenue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

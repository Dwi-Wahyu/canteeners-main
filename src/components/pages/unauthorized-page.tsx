import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-lg border-destructive/20">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-destructive/10 p-3">
                            <ShieldAlert className="h-12 w-12 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-destructive">
                        Akses Ditolak
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                    <p className="text-sm text-foreground/80">
                        Silakan hubungi administrator jika Anda merasa ini adalah kesalahan,
                        atau kembali ke halaman utama.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-2">
                    <Button asChild className="w-full" variant="default">
                        <Link href="/">Kembali ke Beranda</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/login-pelanggan">Login Sebagai Pelanggan</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

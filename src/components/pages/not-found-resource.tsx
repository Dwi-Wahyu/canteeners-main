import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileQuestion } from "lucide-react";

export default function NotFoundResource({
  title = "Data Tidak Ditemukan",
  description = "Maaf, data yang Anda cari tidak dapat ditemukan atau Anda tidak memiliki akses.",
  backUrl = "/",
}: {
  title?: string;
  description?: string;
  backUrl?: string;
}) {
  return (
    <div className="flex h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-muted">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-3">
              <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link href={backUrl}>Kembali</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

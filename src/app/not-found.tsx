import NavButton from "@/components/nav-button";

export default async function NotFound() {
  return (
    <div className="flex flex-col items-center text-center justify-center min-h-screen p-5">
      <h1 className="text-4xl font-bold mb-4">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-lg mb-8">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <NavButton href="/" size="lg">
        Kembali ke Beranda
      </NavButton>
    </div>
  );
}

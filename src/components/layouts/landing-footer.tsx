import { Separator } from "@/components/ui/separator";

export default function LandingFooter() {
  return (
    <footer className="bg-secondary py-10 border-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-2xl font-bold mb-2">Canteeners</h4>
            <p className="text-muted-foreground text-sm">Kantin Naik Level</p>
          </div>

          <div>
            <h5 className="font-semibold mb-3">Tautan</h5>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="#hero" className="hover:font-semibold transition">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#about" className="hover:font-semibold transition">
                  Mekanisme
                </a>
              </li>
              <li>
                <a href="#" className="hover:font-semibold transition">
                  Daftar Kantin
                </a>
              </li>
              <li>
                <a href="#" className="hover:font-semibold transition">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-3">Dukungan</h5>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="/faq" className="hover:font-semibold transition">
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/kebijakan-dan-privasi"
                  className="hover:font-semibold transition"
                >
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a
                  href="/syarat-dan-ketentuan/pelanggan"
                  className="hover:font-semibold transition"
                >
                  Syarat & Ketentuan
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-3">Kontak</h5>
            <p className="text-sm text-muted-foreground">
              Jl. Perintis Kemerdekaan 10
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              support@canteeners.com
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Canteeners. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}

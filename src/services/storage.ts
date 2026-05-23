import { extname } from "path";

export interface StorageService {
  uploadImage(file: File, subfolder: string): Promise<string>;
  uploadMedia(file: File, subfolder: string): Promise<string>;
  deleteFile(filename: string, subfolder: string): Promise<void>;
}

export class LocalStorageService implements StorageService {
  private backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  /**
   * Menghapus file dari penyimpanan remote di backend melalui API.
   *
   * @param filename Nama file yang akan dihapus.
   * @param subfolder Subfolder tempat file berada.
   */
  public async deleteFile(filename: string, subfolder: string): Promise<void> {
    if (!this.backendUrl) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL is not defined in environment variables",
      );
    }

    try {
      // Menggabungkan subfolder dan filename, lalu di-encode agar dianggap sebagai satu parameter :filename oleh NestJS
      const fullPath = `${subfolder}/${filename}`;
      const response = await fetch(
        `${this.backendUrl}/files/${encodeURIComponent(fullPath)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Delete failed with status ${response.status}: ${errorText}`,
        );
      }
    } catch (error: any) {
      console.error("Error deleting from backend:", error);
      throw new Error(`Gagal menghapus file: ${error.message}`);
    }
  }

  /**
   * Mengunggah gambar ke penyimpanan remote di backend melalui API.
   *
   * @param file Objek File yang diunggah.
   * @param subfolder Subfolder yang terkait dengan gambar (digunakan untuk tempat menyimpan file).
   * @returns Promise yang resolve dengan nama file yang diunggah, atau reject dengan error.
   */
  public async uploadImage(file: File, subfolder: string): Promise<string> {
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".svg",
      ".webp",
      ".heic",
      ".heif",
    ];
    const fileExtension = extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`Format gambar tidak didukung: ${fileExtension}`);
    }

    return this.uploadToBackend(file, subfolder);
  }

  /**
   * Mengunggah file media (gambar atau video) ke penyimpanan remote di backend melalui API.
   *
   * @param file Objek File yang diunggah.
   * @param subfolder Subfolder tempat menyimpan file.
   * @returns Promise yang resolve dengan nama file yang diunggah, atau reject dengan error.
   */
  public async uploadMedia(file: File, subfolder: string): Promise<string> {
    const allowedImageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".svg",
      ".webp",
      ".heic",
      ".heif",
    ];
    const allowedVideoExtensions = [".mp4", ".avi", ".mov", ".webm", ".mkv"];
    const allowedExtensions = [
      ...allowedImageExtensions,
      ...allowedVideoExtensions,
    ];

    const fileExtension = extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(
        `Format media tidak didukung: ${fileExtension}. Hanya gambar (${allowedImageExtensions.join(
          ", ",
        )}) dan video (${allowedVideoExtensions.join(", ")}) yang diizinkan.`,
      );
    }

    return this.uploadToBackend(file, subfolder);
  }

  /**
   * Helper untuk mengunggah file ke endpoint backend.
   *
   * @param file Objek File yang diunggah.
   * @param subfolder Subfolder tujuan di backend.
   * @returns Promise yang resolve dengan nama file dari backend.
   */
  private async uploadToBackend(
    file: File,
    subfolder: string,
  ): Promise<string> {
    if (!this.backendUrl) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL is not defined in environment variables",
      );
    }

    const formData = new FormData();
    formData.append("path", subfolder);
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Upload failed with status ${response.status}: ${errorText}`,
        );
      }

      const result = await response.json();

      // Berdasarkan response controller NestJS: { data: { filename: '...' } }
      if (result && result.data && result.data.filename) {
        return result.data.filename;
      }

      throw new Error("Unexpected response format from backend");
    } catch (error: any) {
      console.error("Error uploading to backend:", error);
      throw new Error(`Gagal mengunggah file: ${error.message}`);
    }
  }
}

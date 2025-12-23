export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");

  // Jika tidak ada titik, atau titik berada di awal (file tersembunyi)
  if (lastDotIndex === -1) return "";

  return filename.substring(lastDotIndex + 1).toLowerCase();
};

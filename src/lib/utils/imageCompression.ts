/**
 * Client-side image compression and resizing utility.
 * Guarantees images fit well under Vercel's 4.5MB serverless body limit.
 */
export async function compressAndResizeImage(
  file: File | Blob,
  maxDimension = 1024,
  quality = 0.8
): Promise<{ base64: string; mimeType: string; blob: Blob; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas context"));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL (JPEG quality 0.8)
        const mimeType = "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64Data = dataUrl.split(",")[1];

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas blob conversion failed"));
              return;
            }
            resolve({
              base64: base64Data,
              mimeType,
              blob,
              sizeBytes: blob.size,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image for processing"));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

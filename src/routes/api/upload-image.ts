import { createFileRoute } from "@tanstack/react-router";
import { uploadImage } from "@/lib/services/FileService";

export const Route = createFileRoute("/api/upload-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();
          const imageFile = formData.get("image") as File;
          const directory = (formData.get("directory") as string) || "rooms";

          if (!imageFile || imageFile.size === 0) {
            return new Response(
              JSON.stringify({ error: "No image provided" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const imageKey = await uploadImage(directory, imageFile);
          const imageUrl = `${process.env.S3_PUBLIC}/${process.env.S3_BUCKET}/${imageKey}`;

          return new Response(JSON.stringify({ imageUrl }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("Upload failed:", error);
          return new Response(JSON.stringify({ error: "Upload failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});

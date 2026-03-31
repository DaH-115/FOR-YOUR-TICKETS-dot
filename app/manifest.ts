import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "For Your Tickets.",
    short_name: "FYT",
    description: "나만의 영화 티켓을 만들어보세요",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/images/android-icon-36x36.png",
        sizes: "36x36",
        type: "image/png",
      },
      {
        src: "/images/android-icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/images/android-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/images/android-icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/images/android-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/images/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}

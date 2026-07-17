import { HeroSection } from "@/components/hero-section";
import { preload } from "react-dom";

export default function HomePage() {
  preload("/assets/colossians-hero-engraving.webp?v=mbe-20260715-1", {
    as: "image",
    type: "image/webp",
    fetchPriority: "high"
  });

  return (
    <main>
      <HeroSection />
    </main>
  );
}

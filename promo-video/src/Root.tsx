import { Composition } from "remotion";
import { ScouticaPromo, PROMO_DURATION, PROMO_FPS } from "./ScouticaPromo";
import { ScouticaReel, REEL_DURATION, REEL_FPS } from "./reel/ScouticaReel";

/**
 * Composition registry. "Reel" is the 30s social cut (Instagram / TikTok);
 * "Promo" is the short 6s logo intro. Add more <Composition /> entries here
 * for other formats (square 1080x1080, landscape 1920x1080, etc.).
 */
export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={ScouticaReel}
        durationInFrames={REEL_DURATION}
        fps={REEL_FPS}
        width={1080}
        height={1920}
        defaultProps={{ cta: "Inizia ora" }}
      />
      <Composition
        id="Promo"
        component={ScouticaPromo}
        durationInFrames={PROMO_DURATION}
        fps={PROMO_FPS}
        width={1080}
        height={1920}
        defaultProps={{
          eyebrow: "Italia",
          title: "Scoutica",
          tagline: "La piattaforma italiana per lo scouting professionale.",
        }}
      />
    </>
  );
};

import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";

export const PROMO_FPS = 30;
export const PROMO_DURATION = 180; // 6 seconds

// Brand pairing — Bodoni Moda (display) + Archivo (body), same as the website.
// Load only the weights/subset we use to keep renders fast.
const { fontFamily: bodoni } = loadBodoni("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
const { fontFamily: archivo } = loadArchivo("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export type PromoProps = {
  eyebrow: string;
  title: string;
  tagline: string;
};

/**
 * Scoutica branded intro — obsidian background, white editorial type, a hairline
 * rule that draws in. Vertical 1080x1920 (Reels / Stories / TikTok).
 * Edit copy live in Remotion Studio (`npm run dev`) or via defaultProps in Root.
 */
export const ScouticaPromo = ({ eyebrow, title, tagline }: PromoProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(titleSpring, [0, 1], [50, 0]);
  const titleOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: "clamp",
  });

  const eyebrowOpacity = interpolate(frame, [12, 32], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ruleSpring = spring({ frame: frame - 20, fps, config: { damping: 200 } });

  const taglineOpacity = interpolate(frame, [34, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Gentle fade-out at the end so the clip loops / cuts cleanly.
  const outro = interpolate(
    frame,
    [PROMO_DURATION - 24, PROMO_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0B", opacity: outro }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 120,
        }}
      >
        <div
          style={{
            fontFamily: archivo,
            color: "rgba(255,255,255,0.6)",
            fontSize: 30,
            letterSpacing: 12,
            textTransform: "uppercase",
            opacity: eyebrowOpacity,
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            fontFamily: bodoni,
            color: "#FFFFFF",
            fontSize: 200,
            lineHeight: 1,
            letterSpacing: -4,
            marginTop: 28,
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>

        <div
          style={{
            height: 1,
            width: 420,
            marginTop: 56,
            backgroundColor: "rgba(255,255,255,0.5)",
            transform: `scaleX(${Math.max(0, ruleSpring)})`,
          }}
        />

        <div
          style={{
            fontFamily: archivo,
            color: "rgba(255,255,255,0.72)",
            fontSize: 36,
            lineHeight: 1.4,
            maxWidth: 820,
            marginTop: 56,
            opacity: taglineOpacity,
          }}
        >
          {tagline}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

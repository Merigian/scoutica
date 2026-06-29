import {
  AbsoluteFill,
  Img,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties, ReactNode } from "react";
import { loadFont as loadBodoni } from "@remotion/google-fonts/BodoniModa";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";

const { fontFamily: bodoni } = loadBodoni("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});
const { fontFamily: archivo } = loadArchivo("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const REEL_FPS = 30;
export const REEL_DURATION = 900; // 30s @ 30fps

const BG = "#0A0A0B";
const INK = "#FFFFFF";
const INK3 = "rgba(255,255,255,0.52)";
const RULE = "rgba(255,255,255,0.22)";

// Scene durations (sum = 900)
const D = { hero: 120, hook: 105, m: 135, s: 135, st: 135, trust: 120, cta: 150 };

const eyebrow: CSSProperties = {
  fontFamily: archivo,
  fontSize: 29,
  fontWeight: 500,
  letterSpacing: 8,
  textTransform: "uppercase",
  color: INK3,
};

// ── Shared helpers ───────────────────────────────────────────────────────────

const SceneFade = ({
  duration,
  children,
}: {
  duration: number;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 10, duration - 12, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const useRise = (delay = 0, distance = 38): CSSProperties => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return {
    transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
    opacity: interpolate(frame, [delay, delay + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
};

// ── Scenes ───────────────────────────────────────────────────────────────────

const HeroLogo = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, D.hero], [1.05, 1.13]); // slow Ken Burns
  const logoRise = useRise(16, 26);
  const wordRise = useRise(28, 22);
  const eyebrowOpacity = interpolate(frame, [44, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFade duration={D.hero}>
      <AbsoluteFill>
        <Img
          src={staticFile("hero.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "52% 26%",
            transform: `scale(${scale})`,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,11,0.45) 0%, rgba(10,10,11,0.12) 38%, rgba(10,10,11,0.9) 100%)",
          }}
        />
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            padding: 120,
            paddingBottom: 220,
          }}
        >
          <Img
            src={staticFile("logo-white.png")}
            style={{
              width: 124,
              height: 124,
              objectFit: "contain",
              ...logoRise,
            }}
          />
          <div
            style={{
              fontFamily: bodoni,
              fontSize: 124,
              lineHeight: 0.9,
              color: INK,
              letterSpacing: -2,
              marginTop: 26,
              ...wordRise,
            }}
          >
            Scoutica
          </div>
          <div style={{ ...eyebrow, marginTop: 22, opacity: eyebrowOpacity }}>
            Italia
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </SceneFade>
  );
};

const Statement = () => {
  const rise = useRise(6, 42);
  return (
    <SceneFade duration={D.hook}>
      <AbsoluteFill
        style={{
          backgroundColor: BG,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 120,
        }}
      >
        <div style={{ ...eyebrow, marginBottom: 40 }}>La piattaforma</div>
        <div
          style={{
            fontFamily: bodoni,
            fontSize: 92,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            color: INK,
            ...rise,
          }}
        >
          Lo scouting professionale
          <br />
          di moda. In un solo posto.
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const Offer = ({
  active,
  kicker,
  title,
  duration,
}: {
  active: 0 | 1 | 2;
  kicker: string;
  title: string;
  duration: number;
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const rise = useRise(10, 34);
  const ruleScale = spring({
    frame: frame - 16,
    fps,
    config: { damping: 200 },
  });

  return (
    <SceneFade duration={duration}>
      <AbsoluteFill
        style={{ backgroundColor: BG, justifyContent: "center", padding: 130 }}
      >
        <div style={rise}>
          <div style={eyebrow}>{kicker}</div>
          <div
            style={{
              height: 1,
              background: RULE,
              marginTop: 30,
              marginBottom: 46,
              transformOrigin: "left center",
              transform: `scaleX(${Math.max(0, ruleScale)})`,
            }}
          />
          <div
            style={{
              fontFamily: bodoni,
              fontSize: 80,
              lineHeight: 1.16,
              letterSpacing: -1,
              color: INK,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 170,
            left: 130,
            display: "flex",
            gap: 14,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 3,
                width: i === active ? 46 : 18,
                backgroundColor: i === active ? INK : RULE,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const Trust = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const rise = useRise(16, 28);
  const ringScale = spring({ frame, fps, config: { damping: 200 } });
  const dash = 40;
  const draw = interpolate(
    spring({ frame: frame - 8, fps, config: { damping: 200 } }),
    [0, 1],
    [dash, 0]
  );

  return (
    <SceneFade duration={D.trust}>
      <AbsoluteFill
        style={{
          backgroundColor: BG,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 120,
        }}
      >
        <svg
          width={150}
          height={150}
          viewBox="0 0 24 24"
          fill="none"
          stroke={INK}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: `scale(${ringScale})` }}
        >
          <circle cx="12" cy="12" r="9.25" strokeWidth="0.8" opacity={0.5} />
          <path
            d="M7.9 12.4l2.8 2.85L16.3 9"
            strokeWidth="1.1"
            strokeDasharray={dash}
            strokeDashoffset={draw}
          />
        </svg>
        <div style={{ ...eyebrow, marginTop: 54 }}>Fiducia</div>
        <div
          style={{
            fontFamily: bodoni,
            fontSize: 82,
            lineHeight: 1.12,
            letterSpacing: -1,
            color: INK,
            marginTop: 20,
            ...rise,
          }}
        >
          Identità verificata.
          <br />
          Professionisti accreditati.
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

const Cta = ({ cta }: { cta: string }) => {
  const frame = useCurrentFrame();
  const logoRise = useRise(8, 24);
  const wordRise = useRise(18, 20);
  const ctaOpacity = interpolate(frame, [40, 64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFade duration={D.cta}>
      <AbsoluteFill
        style={{
          backgroundColor: BG,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 120,
        }}
      >
        <Img
          src={staticFile("logo-white.png")}
          style={{ width: 118, height: 118, objectFit: "contain", ...logoRise }}
        />
        <div
          style={{
            fontFamily: bodoni,
            fontSize: 136,
            lineHeight: 0.9,
            letterSpacing: -2.5,
            color: INK,
            marginTop: 30,
            ...wordRise,
          }}
        >
          Scoutica
        </div>
        <div
          style={{
            height: 1,
            width: 200,
            backgroundColor: RULE,
            marginTop: 48,
            marginBottom: 48,
          }}
        />
        <div style={{ ...eyebrow, color: INK, opacity: ctaOpacity }}>{cta}</div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ── Composition ──────────────────────────────────────────────────────────────

export type ReelProps = { cta: string };

export const ScouticaReel = ({ cta }: ReelProps) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Series>
        <Series.Sequence durationInFrames={D.hero}>
          <HeroLogo />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.hook}>
          <Statement />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.m}>
          <Offer
            active={0}
            kicker="Modelli"
            title="Costruisci un portfolio editoriale e fatti scoprire da scout e agenzie."
            duration={D.m}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.s}>
          <Offer
            active={1}
            kicker="Scout & agenzie"
            title="Trova volti verificati, lancia casting e gestisci le candidature."
            duration={D.s}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.st}>
          <Offer
            active={2}
            kicker="Studi fotografici"
            title="Affitta i tuoi spazi e riempi l'agenda di shooting."
            duration={D.st}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.trust}>
          <Trust />
        </Series.Sequence>
        <Series.Sequence durationInFrames={D.cta}>
          <Cta cta={cta} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

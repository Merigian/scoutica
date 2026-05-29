import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const LOGO_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/images/icon-192.png`
  : "https://scoutica.it/images/icon-192.png";

interface VerificationEmailProps {
  verificationUrl: string;
  locale?: "it" | "en";
}

const copy = {
  it: {
    preview: "Verifica il tuo indirizzo email — Scoutica",
    heading: "Verifica la tua email",
    body: "Grazie per esserti registrato su Scoutica! Clicca il pulsante qui sotto per verificare il tuo indirizzo email.",
    button: "Verifica email",
    expiry: "Questo link scadrà tra 24 ore.",
    ignore: "Se non hai creato un account su Scoutica, puoi ignorare questa email.",
    footer: "© Scoutica — La piattaforma italiana per lo scouting professionale",
  },
  en: {
    preview: "Verify your email address — Scoutica",
    heading: "Verify your email",
    body: "Thanks for signing up for Scoutica! Click the button below to verify your email address.",
    button: "Verify email",
    expiry: "This link will expire in 24 hours.",
    ignore: "If you didn't create an account on Scoutica, you can ignore this email.",
    footer: "© Scoutica — The Italian platform for professional model scouting",
  },
};

export default function VerificationEmail({
  verificationUrl,
  locale = "it",
}: VerificationEmailProps) {
  const t = copy[locale];

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brand}>
            <Img src={LOGO_URL} alt="Scoutica" width="56" height="56" style={logoImg} />
            <Heading style={heading}>Scoutica</Heading>
          </Section>
          <Section style={section}>
            <Heading as="h2" style={subheading}>
              {t.heading}
            </Heading>
            <Text style={text}>{t.body}</Text>
            <Link href={verificationUrl} style={button}>
              {t.button}
            </Link>
            <Text style={smallText}>{t.expiry}</Text>
          </Section>
          <Hr style={hr} />
          <Text style={footerText}>{t.ignore}</Text>
          <Text style={footerText}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "500",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
  color: "#1a1a1a",
  margin: "0",
};

const brand: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoImg: React.CSSProperties = {
  display: "block",
  margin: "0 auto 16px",
};

const section: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "32px",
};

const subheading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginTop: "0",
};

const text: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#444",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  borderRadius: "8px",
  padding: "12px 24px",
  margin: "16px 0",
};

const smallText: React.CSSProperties = {
  fontSize: "13px",
  color: "#888",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  textAlign: "center" as const,
};

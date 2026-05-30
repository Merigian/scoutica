import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _resend = new Resend(key);
  return _resend;
}

export const resend = {
  emails: {
    send: (...args: Parameters<Resend["emails"]["send"]>) =>
      getResend().emails.send(...args),
  },
};

export const EMAIL_FROM = process.env.EMAIL_FROM || "Scoutica <noreply@scoutica.it>";

// src/utils/shareFlight.ts
export type ShareChannel = "wa" | "email" | "copy";

export type SharePayload = {
  title?: string;              // "Flight Option"
  text: string;                // message body
  url?: string;                // deep link (optional)
};

export function buildMailto(subject: string, body: string) {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildWhatsAppUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function share(payload: SharePayload, channel: ShareChannel) {
  const subject = payload.title ?? "Flight Option";
  const finalText = payload.url ? `${payload.text}\n\n🔗 Link: ${payload.url}` : payload.text;

  if (channel === "wa") {
    window.open(buildWhatsAppUrl(finalText), "_blank", "noopener,noreferrer");
    return;
  }

  if (channel === "email") {
    window.location.href = buildMailto(subject, finalText);
    return;
  }

  // copy
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(payload.url ? payload.url : finalText);
  } else {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = payload.url ? payload.url : finalText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

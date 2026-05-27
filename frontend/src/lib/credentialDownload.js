export const buildCredentialsPayload = (credentials) => ({
  email: credentials?.email || "",
  password: credentials?.password || "",
});

export const downloadCredentialsJson = (credentials, filename = "calidus-credentials.json") => {
  const payload = buildCredentialsPayload(credentials);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const credentialsToCopyText = (credentials) =>
  `${credentials?.email || ""} ${credentials?.password || ""}`.trim();

export const copyCredentialsText = async (credentials) => {
  const text = credentialsToCopyText(credentials);
  if (!text) return false;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
};

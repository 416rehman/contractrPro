export default function getCookieValue(cookieName: string) {
  if (typeof window === "undefined" || !document.cookie) {
    return null;
  }

  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  const cookie = cookies.find((cookie) => cookie.startsWith(cookieName + "="));
  if (!cookie) {
    return null;
  }

  return cookie.split("=")[1] || null;
}
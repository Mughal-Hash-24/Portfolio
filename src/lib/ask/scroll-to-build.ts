export const CHAT_BUILD_PROGRESS = 0.8;

export function getChatBuildScrollTop() {
  const wrapper = document.getElementById("ask-brick");
  if (!wrapper) return null;

  const viewport = window.innerHeight;
  const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
  const start = wrapperTop - viewport * 0.85;
  const end = wrapperTop + wrapper.offsetHeight - viewport;

  return Math.max(0, start + CHAT_BUILD_PROGRESS * (end - start));
}

export function scrollToChatBuild() {
  const top = getChatBuildScrollTop();
  if (top === null) return;

  window.scrollTo({
    top,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
}

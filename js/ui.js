const MOBILE_BREAKPOINT = 920;

export function isMobileViewport(width) {
  return Number(width) <= MOBILE_BREAKPOINT;
}

export function createSidebarController({ sidebar, toggle, closeButton, backdrop, documentRef = document, windowRef = window }) {
  let previouslyFocused = null;
  const focusableSelector = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  const isMobile = () => isMobileViewport(windowRef.innerWidth);

  const setOpen = (open, { restoreFocus = true } = {}) => {
    documentRef.body.classList.toggle("sidebar-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    backdrop.hidden = !open;

    if (open) {
      previouslyFocused = documentRef.activeElement;
      closeButton.focus();
    } else if (restoreFocus && previouslyFocused?.focus) {
      previouslyFocused.focus();
      previouslyFocused = null;
    }
  };

  const open = () => {
    if (isMobile()) setOpen(true);
  };
  const close = (options) => setOpen(false, options);
  const handleKeydown = (event) => {
    if (!documentRef.body.classList.contains("sidebar-open")) return;
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [...sidebar.querySelectorAll(focusableSelector)].filter(
      (element) => !element.closest("details:not([open])"),
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && documentRef.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && documentRef.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const handleResize = () => {
    if (!isMobile()) close({ restoreFocus: false });
  };
  const handleNavigation = (event) => {
    if (isMobile() && event.target.closest("a")) close({ restoreFocus: false });
  };
  const handleCloseClick = () => close();

  toggle.addEventListener("click", open);
  closeButton.addEventListener("click", handleCloseClick);
  backdrop.addEventListener("click", handleCloseClick);
  sidebar.addEventListener("click", handleNavigation);
  documentRef.addEventListener("keydown", handleKeydown);
  windowRef.addEventListener("resize", handleResize);

  return {
    open,
    close,
    destroy() {
      toggle.removeEventListener("click", open);
      closeButton.removeEventListener("click", handleCloseClick);
      backdrop.removeEventListener("click", handleCloseClick);
      sidebar.removeEventListener("click", handleNavigation);
      documentRef.removeEventListener("keydown", handleKeydown);
      windowRef.removeEventListener("resize", handleResize);
    },
  };
}

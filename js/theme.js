export const THEME_VALUES = Object.freeze(["dark", "light", "system"]);

export function normalizeTheme(value) {
  return THEME_VALUES.includes(value) ? value : "system";
}

export function resolveTheme(value, prefersDark) {
  const preference = normalizeTheme(value);
  return preference === "system" ? (prefersDark ? "dark" : "light") : preference;
}

export function applyTheme(documentElement, value, prefersDark) {
  const preference = normalizeTheme(value);
  const resolved = resolveTheme(preference, prefersDark);
  documentElement.dataset.theme = resolved;
  documentElement.dataset.themePreference = preference;
  documentElement.style.colorScheme = resolved;
  return resolved;
}

export function createThemeController({ select, storage, documentRef = document, windowRef = window }) {
  const media = windowRef.matchMedia("(prefers-color-scheme: dark)");
  const applyPreference = (preference) => applyTheme(documentRef.documentElement, preference, media.matches);
  const initial = normalizeTheme(storage.get("settings").theme);
  select.value = initial;
  applyPreference(initial);

  const handleChange = () => {
    const preference = normalizeTheme(select.value);
    const settings = storage.get("settings");
    storage.set("settings", { ...settings, theme: preference });
    select.value = preference;
    applyPreference(preference);
  };
  const handleSystemChange = () => {
    if (select.value === "system") applyPreference("system");
  };

  select.addEventListener("change", handleChange);
  media.addEventListener?.("change", handleSystemChange);

  return {
    destroy() {
      select.removeEventListener("change", handleChange);
      media.removeEventListener?.("change", handleSystemChange);
    },
  };
}

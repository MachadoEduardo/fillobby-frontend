export const themeInitializationScript = `
try {
  var theme = localStorage.getItem("fillobby-theme");
  var isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
} catch (_) {}
`;

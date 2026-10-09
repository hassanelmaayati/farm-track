import { useTheme } from "../../context/ThemeContext";

// Recharts draws SVG attributes, which can't read CSS variables, so resolve colours per theme here.
export default function useChartTheme() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    grid: dark ? "#2c382b" : "#e2dfd0",
    axis: dark ? "#9aa897" : "#5f6b5d",
    brand: dark ? "#5fb35f" : "#2f7d32",
    revenue: dark ? "#5fb35f" : "#2f7d32",
    expenses: dark ? "#e0a93b" : "#b9791a",
    tooltip: {
      backgroundColor: dark ? "#1a221a" : "#ffffff",
      border: `1px solid ${dark ? "#2c382b" : "#e2dfd0"}`,
      borderRadius: 8,
      color: dark ? "#e9efe6" : "#1f2a1f",
      fontSize: 12,
    },
  };
}

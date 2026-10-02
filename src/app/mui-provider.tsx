"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#276749",
      dark: "#1d4d38",
      light: "#e7f3ec",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4f7f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#17231c",
      secondary: "#627068",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.04em",
    },
    h5: {
      fontWeight: 750,
      letterSpacing: "-0.03em",
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 12,
          boxShadow: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: "medium",
      },
    },
  },
});

export function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

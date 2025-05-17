import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { Helmet, HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Helmet>
      <title>FovDark - Premium Gaming Scripts & Cheats</title>
      <meta name="description" content="FovDark provides cutting-edge scripts and cheats for Blood Strike, giving you the competitive edge with undetectable enhancements and precision tools." />
      <meta property="og:title" content="FovDark - Premium Gaming Scripts & Cheats" />
      <meta property="og:description" content="Dominate with undetectable gaming enhancements for Blood Strike. Advanced aimbot, ESP wallhack, and anti-ban protection." />
      <meta property="og:type" content="website" />
    </Helmet>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <App />
    </ThemeProvider>
  </HelmetProvider>
);

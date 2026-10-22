import type { Metadata } from "next";

import { siteDescription, siteName, siteUrl, toJsonLd } from "@/src/lib/site";
import { createClient } from "@/src/lib/supabase/server";
import { Box } from "@mui/material";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import AudienceSection from "./components/home/AudienceSection";
import CtaSection from "./components/home/CtaSection";
import FaqSection from "./components/home/FaqSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HeroSection from "./components/home/HeroSection";
import { styles as s } from "./components/home/home.styles";
import { faqs } from "./components/home/homeContent";
import PainPointsSection from "./components/home/PainPointsSection";
import StepsSection from "./components/home/StepsSection";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: siteName,
      alternateName: "FitNote",
      url: siteUrl,
      description: siteDescription,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "ko-KR",
      offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const isLoggedIn = !error && Boolean(user);
  const { data: profile } =
    isLoggedIn && user
      ? await supabase
          .from("profiles")
          .select("slug")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null };
  const dashboardHref = profile ? `/${profile.slug}` : "/mypage";
  const startHref = isLoggedIn ? dashboardHref : "/signup";

  return (
    <Box sx={s.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <Header />

      <Box component="main">
        <HeroSection startHref={startHref} isLoggedIn={isLoggedIn} />
        <PainPointsSection />
        <StepsSection />
        <FeaturesSection />
        <AudienceSection />
        <FaqSection />
        <CtaSection startHref={startHref} isLoggedIn={isLoggedIn} />
      </Box>

      <Footer />
    </Box>
  );
}

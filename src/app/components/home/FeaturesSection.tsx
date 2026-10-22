import { Box, Container, Typography } from "@mui/material";

import { styles as s } from "./home.styles";
import { features } from "./homeContent";
import IconBox from "./IconBox";
import SectionHeading from "./SectionHeading";

export default function FeaturesSection() {
  return (
    <Box component="section" sx={s.sectionGrey}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="주요 기능"
          title="지금 바로 쓸 수 있는 기능"
          description="작은 스튜디오에 꼭 필요한 만큼만, 복잡하지 않게 담았어요."
        />
        <Box sx={s.cardGridWide}>
          {features.map(({ icon, title, description }) => (
            <Box key={title} sx={s.cardWhite}>
              <IconBox icon={icon} tone="primary" />
              <Typography component="h3" sx={s.cardTitle}>
                {title}
              </Typography>
              <Typography sx={s.cardBody}>{description}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

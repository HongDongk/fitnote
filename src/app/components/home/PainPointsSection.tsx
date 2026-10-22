import { Box, Container, Typography } from "@mui/material";

import { styles as s } from "./home.styles";
import { painPoints } from "./homeContent";
import IconBox from "./IconBox";
import SectionHeading from "./SectionHeading";

export default function PainPointsSection() {
  return (
    <Box component="section" sx={s.sectionGrey}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="이런 고민"
          title="이런 불편, 익숙하지 않나요?"
          description="혼자 수업하고 운영까지 하다 보면 정작 수업 준비할 시간이 부족해져요."
        />
        <Box sx={s.cardGrid}>
          {painPoints.map(({ icon, title, description }) => (
            <Box key={title} sx={s.cardWhite}>
              <IconBox icon={icon} tone="grey" />
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

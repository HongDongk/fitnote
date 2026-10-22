import { Box, Container, Typography } from "@mui/material";

import { styles as s } from "./home.styles";
import { steps } from "./homeContent";
import SectionHeading from "./SectionHeading";

export default function StepsSection() {
  return (
    <Box id="how-it-works" component="section" sx={s.stepsSection}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="이용 방법"
          title="세 단계면 충분해요"
          description="복잡한 설정 없이, 가입한 날부터 바로 수업 신청을 받을 수 있어요."
        />
        <Box component="ol" sx={s.stepList}>
          {steps.map(({ title, description }, index) => (
            <Box component="li" key={title} sx={s.cardGrey}>
              <Box sx={s.stepNumber}>{index + 1}</Box>
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

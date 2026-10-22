import { Box, Container, Typography } from "@mui/material";

import { styles as s } from "./home.styles";
import { faqs } from "./homeContent";
import SectionHeading from "./SectionHeading";

export default function FaqSection() {
  return (
    <Box component="section" sx={s.sectionGrey}>
      <Container maxWidth="md">
        <SectionHeading overline="FAQ" title="자주 묻는 질문" align="center" />
        <Box sx={s.faqList}>
          {faqs.map(({ question, answer }) => (
            <Box key={question} sx={s.faqItem}>
              <Typography component="h3" sx={s.faqQuestion}>
                <Box component="span" sx={s.faqMark}>
                  Q
                </Box>
                {question}
              </Typography>
              <Typography sx={s.cardBody}>{answer}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

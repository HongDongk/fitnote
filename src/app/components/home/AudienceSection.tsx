import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { Box, Container, Stack, Typography } from "@mui/material";

import { styles as s } from "./home.styles";
import { audienceDescriptions, audiences, upcoming } from "./homeContent";
import IconBox from "./IconBox";
import SectionHeading from "./SectionHeading";

// 이런 분께 + 곧 추가될 기능
export default function AudienceSection() {
  return (
    <Container component="section" maxWidth="lg" sx={s.sectionWhite}>
      <Box sx={s.audienceGrid}>
        <Box>
          <SectionHeading
            overline="이런 분께 추천해요"
            title="이런 분께 맞아요"
            description="시간을 정해 1:1이나 소규모로 수업하는 강사라면 누구나."
          />
          <Stack direction="row" sx={s.audienceTags}>
            {audiences.map((label) => (
              <Box key={label} component="span" sx={s.audienceTag}>
                {label}
              </Box>
            ))}
          </Stack>
          <Stack spacing={2}>
            {audienceDescriptions.map((text) => (
              <Stack
                key={text}
                direction="row"
                spacing={1.25}
                sx={s.audienceItem}
              >
                <TaskAltRoundedIcon sx={s.audienceItemIcon} />
                <Typography sx={s.audienceItemText}>{text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box>
          <SectionHeading
            overline="준비 중"
            title="곧 추가될 기능"
            description="강사님들이 가장 많이 필요로 하는 것부터 준비하고 있어요."
          />
          <Stack spacing={1.25}>
            {upcoming.map(({ icon, title, description }) => (
              <Stack
                key={title}
                direction="row"
                spacing={2}
                sx={s.upcomingItem}
              >
                <IconBox icon={icon} tone="white" />
                <Box sx={s.upcomingText}>
                  <Stack direction="row" spacing={0.75} sx={s.upcomingTitleRow}>
                    <Typography component="h3" sx={s.upcomingTitle}>
                      {title}
                    </Typography>
                    <Box component="span" sx={s.upcomingBadge}>
                      준비 중
                    </Box>
                  </Stack>
                  <Typography sx={s.upcomingDescription}>
                    {description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}

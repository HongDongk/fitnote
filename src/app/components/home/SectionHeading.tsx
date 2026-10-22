import { Box, Typography } from "@mui/material";

import { styles as s } from "./home.styles";

export default function SectionHeading({
  overline,
  title,
  description,
  align = "left",
}: {
  overline: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Box sx={[s.heading, { textAlign: align }]}>
      <Typography sx={s.headingOverline}>{overline}</Typography>
      <Typography component="h2" sx={s.headingTitle}>
        {title}
      </Typography>
      {description && (
        <Typography sx={s.headingDescription}>{description}</Typography>
      )}
    </Box>
  );
}

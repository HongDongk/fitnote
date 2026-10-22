import { Box } from "@mui/material";

import { styles as s } from "./home.styles";
import type { HomeIcon } from "./homeContent";

const toneStyles = {
  primary: s.iconBoxPrimary,
  grey: s.iconBoxGrey,
  white: s.iconBoxWhite,
};

export default function IconBox({
  icon: Icon,
  tone,
}: {
  icon: HomeIcon;
  tone: keyof typeof toneStyles;
}) {
  return (
    <Box sx={[s.iconBox, toneStyles[tone]]}>
      <Icon sx={s.icon} />
    </Box>
  );
}

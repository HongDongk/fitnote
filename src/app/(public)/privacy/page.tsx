import { Box, Container, Typography } from "@mui/material";
import type { Metadata } from "next";

import Footer from "@/src/app/components/Footer/Footer";
import Header from "@/src/app/components/Header/Header";

import { styles as s } from "./privacy.styles";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  alternates: { canonical: "/privacy" },
};

const CONTACT_EMAIL = "feedback@fitnote.online";
const EFFECTIVE_DATE = "2026년 10월 23일";

const sections: { title: string; body?: string; items?: string[] }[] = [
  {
    title: "1. 수집하는 개인정보",
    items: [
      "강사: 이메일, 비밀번호(암호화하여 저장), 이름, 소개글, 프로필 사진, 수업 일정",
      "Google 로그인 시: Google 계정의 이메일, 이름, 프로필 사진",
      "회원: 강사가 등록하거나 회원이 인증한 이름과 이메일, 수업 예약 신청 내역",
      "자동 수집: 로그인 유지를 위한 쿠키, 방문 통계 정보(Google Analytics)",
    ],
  },
  {
    title: "2. 이용 목적",
    items: [
      "회원가입, 로그인 및 본인 확인",
      "강사 페이지와 수업 일정 제공, 수업 예약 신청 및 관리",
      "인증 메일 등 서비스 이용에 필요한 안내 발송",
      "문의 응대와 서비스 개선을 위한 이용 통계 분석",
    ],
  },
  {
    title: "3. 보관 기간과 파기",
    body: `개인정보는 계정을 삭제할 때까지 보관하며, 삭제 요청을 받으면 지체 없이 파기합니다. 강사 계정이 삭제되면 그 강사가 등록한 회원, 수업 일정, 예약 정보도 함께 삭제됩니다. 계정 삭제는 ${CONTACT_EMAIL}로 요청할 수 있습니다. 다만 법령에 따라 보관해야 하는 정보는 해당 기간 동안 보관합니다.`,
  },
  {
    title: "4. 제3자 제공",
    body: "핏노트는 이용자의 개인정보를 외부에 판매하거나 제공하지 않습니다. 다만 회원이 강사 페이지에서 예약을 신청하면, 서비스 제공을 위해 회원의 이름, 이메일, 예약 내역이 해당 강사에게 표시됩니다.",
  },
  {
    title: "5. 처리 위탁 및 국외 이전",
    body: "서비스 운영을 위해 아래 업체에 개인정보 처리를 맡기고 있으며, 이 과정에서 정보가 해당 업체의 해외 서버(미국 등)에 저장·처리될 수 있습니다. 정보는 서비스 이용 시 네트워크를 통해 전송되며, 계정 삭제 또는 위탁 계약 종료 시까지 보관됩니다.",
    items: [
      "Supabase Inc.: 데이터 저장, 로그인 인증, 파일 저장",
      "Google LLC: Google 로그인, 방문 통계 분석",
      "Resend, Inc.: 인증 메일 발송",
      "Cloudflare, Inc.: 문의 메일 수신 및 전달",
    ],
  },
  {
    title: "6. 이용자의 권리",
    body: `이용자는 언제든지 자신의 개인정보를 열람, 정정, 삭제하거나 처리 정지를 요청할 수 있습니다. 프로필 정보는 마이페이지에서 직접 수정할 수 있으며, 그 밖의 요청은 ${CONTACT_EMAIL}로 보내주시면 지체 없이 처리합니다.`,
  },
  {
    title: "7. 쿠키 사용",
    body: "로그인 상태를 유지하기 위해 필수 쿠키를 사용하며, 방문 통계를 위해 Google Analytics 쿠키를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있지만, 이 경우 로그인 등 일부 기능을 이용할 수 없습니다.",
  },
  {
    title: "8. 안전성 확보 조치",
    body: "비밀번호는 암호화하여 저장하고, 모든 통신은 HTTPS로 암호화합니다. 데이터베이스에는 본인 또는 권한이 있는 강사만 정보에 접근할 수 있도록 접근 제어를 적용하고 있습니다.",
  },
  {
    title: "9. 개인정보 보호책임자 및 문의",
    body: `개인정보와 관련한 문의, 불만, 피해 구제 요청은 핏노트 운영자(${CONTACT_EMAIL})에게 보내주세요. 개인정보 침해에 대한 신고나 상담이 필요하면 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118)에 문의할 수 있습니다.`,
  },
  {
    title: "10. 방침의 변경",
    body: `이 방침은 ${EFFECTIVE_DATE}부터 적용됩니다. 내용이 바뀌면 이 페이지를 통해 알려드립니다.`,
  },
];

export default function PrivacyPage() {
  return (
    <Box sx={s.page}>
      <Header />
      <Box component="main" sx={s.main}>
        <Container maxWidth="md">
          <Typography component="h1" sx={s.title}>
            개인정보처리방침
          </Typography>
          <Typography sx={s.meta}>시행일 {EFFECTIVE_DATE}</Typography>
          <Typography sx={s.intro}>
            핏노트(이하 &lsquo;서비스&rsquo;)는 이용자의 개인정보를 소중히
            여기며, 서비스 제공에 필요한 최소한의 정보만 수집하고 이용합니다.
          </Typography>

          {sections.map(({ title, body, items }) => (
            <Box component="section" key={title} sx={s.section}>
              <Typography component="h2" sx={s.sectionTitle}>
                {title}
              </Typography>
              {body && <Typography sx={s.body}>{body}</Typography>}
              {items && (
                <Box component="ul" sx={s.list}>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import FolderOffRoundedIcon from "@mui/icons-material/FolderOffRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";

export type HomeIcon = typeof LinkRoundedIcon;

export const painPoints = [
  {
    icon: ForumRoundedIcon,
    title: "카톡으로 시간 맞추다 하루가 가요",
    description:
      "회원마다 가능한 시간을 묻고, 답을 기다리고, 다시 조율하는 메시지가 끝없이 이어져요.",
  },
  {
    icon: FolderOffRoundedIcon,
    title: "일정이 여기저기 흩어져 있어요",
    description:
      "메모장, 휴대폰 캘린더, 엑셀을 오가다 보면 어디가 최신인지 헷갈려요.",
  },
  {
    icon: EventBusyRoundedIcon,
    title: "겹치는 예약이 생길까 불안해요",
    description:
      "같은 시간에 두 명을 잡아 버리는 실수, 한 번쯤 해보셨을 거예요.",
  },
];

export const steps = [
  {
    title: "프로필 만들기",
    description:
      "가입하고 사진과 소개를 등록하면 나만의 수업 페이지 주소가 생겨요.",
  },
  {
    title: "회원 등록하고 링크 공유",
    description:
      "회원 이메일을 등록하고, 수업 페이지 링크를 카톡이나 인스타그램으로 보내세요.",
  },
  {
    title: "신청 확인하고 승인",
    description:
      "회원이 빈 시간에 수업을 신청하면, 승인 한 번으로 캘린더에 확정돼요.",
  },
];

export const features = [
  {
    icon: LinkRoundedIcon,
    title: "나만의 수업 페이지",
    description:
      "강사 소개와 수업 일정을 한 페이지에 모았어요. 링크 하나로 회원에게 공유하세요.",
  },
  {
    icon: CalendarMonthRoundedIcon,
    title: "한눈에 보는 일정 캘린더",
    description: "캘린더에서 바로 일정을 추가하고, 옮기고, 지울 수 있어요.",
  },
  {
    icon: EventAvailableRoundedIcon,
    title: "수업 신청과 승인",
    description:
      "회원은 빈 시간에 신청하고, 강사는 확인 후 승인해요. 이미 일정이 있는 시간은 자동으로 막아요.",
  },
  {
    icon: SyncRoundedIcon,
    title: "실시간 반영",
    description:
      "신청과 일정 변경이 새로고침 없이 강사와 회원 화면에 바로 반영돼요.",
  },
  {
    icon: PeopleOutlineRoundedIcon,
    title: "내 회원만 신청 가능",
    description:
      "등록한 회원만 수업을 신청할 수 있어서, 모르는 사람의 신청을 걱정하지 않아도 돼요.",
  },
  {
    icon: SmartphoneRoundedIcon,
    title: "앱 설치 없이",
    description:
      "휴대폰이나 PC 브라우저에서 바로 써요. 회원은 이메일로 받은 링크로 로그인해요.",
  },
];

export const audiences = [
  "PT",
  "필라테스",
  "요가",
  "음악 레슨",
  "댄스",
  "미술",
  "코칭",
];

export const audienceDescriptions = [
  "혼자 수업하면서 예약과 회원 관리도 직접 하는 강사",
  "카톡으로 일정 조율하는 시간을 줄이고 싶은 강사",
  "비싼 매장 관리 프로그램까지는 필요 없는 소규모 스튜디오",
];

export const upcoming = [
  {
    icon: ConfirmationNumberRoundedIcon,
    title: "수강권·잔여 횟수 관리",
    description: "회원별 남은 수업 횟수를 자동으로 계산해요.",
  },
  {
    icon: NotificationsNoneRoundedIcon,
    title: "신청·수업 알림",
    description: "새 신청과 다가오는 수업을 알림으로 알려드려요.",
  },
  {
    icon: BoltRoundedIcon,
    title: "회원 취소 요청",
    description:
      "확정된 수업도 회원이 직접 취소를 요청할 수 있게 할 예정이에요.",
  },
];

export const faqs = [
  {
    question: "핏노트는 무료인가요?",
    answer: "네, 현재 모든 기능을 무료로 이용할 수 있어요.",
  },
  {
    question: "회원도 앱을 설치해야 하나요?",
    answer:
      "아니요. 강사님이 공유한 수업 페이지 링크를 휴대폰이나 PC 브라우저로 열기만 하면 돼요.",
  },
  {
    question: "회원은 어떻게 수업을 신청하나요?",
    answer:
      "강사님이 회원의 이메일을 등록해 두면, 회원은 수업 페이지에서 이메일로 받은 로그인 링크를 눌러 연결한 뒤 캘린더의 빈 시간에 신청할 수 있어요.",
  },
  {
    question: "같은 시간에 예약이 겹치면 어떻게 되나요?",
    answer:
      "이미 일정이 있는 시간에는 신청과 승인이 되지 않아요. 그래서 겹치는 예약이 생기지 않아요.",
  },
  {
    question: "어떤 수업에 쓸 수 있나요?",
    answer:
      "PT, 필라테스, 요가, 음악·댄스 레슨처럼 시간을 정해 1:1이나 소규모로 진행하는 수업이라면 모두 쓸 수 있어요.",
  },
  {
    question: "여러 강사가 함께 쓸 수 있나요?",
    answer:
      "지금은 강사 한 명이 계정 하나로 자신의 수업과 회원을 관리하는 방식이에요.",
  },
];

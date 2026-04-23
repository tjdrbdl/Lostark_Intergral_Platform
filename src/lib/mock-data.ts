/**
 * Mock 데이터 모듈
 * 실제 API 연동 전까지 사용. IS_MOCK_MODE === true 시 API 라우트에서 호출됨.
 *
 * TODO: 실제 API 연동 완료 시 이 파일 전체 삭제
 * 제거 기준: LOSTARK_API_KEY 환경변수 설정 + 모든 API 라우트 실데이터 검증 완료
 */

import type { CharacterData } from "@/types/character";
import type { ExpeditionData } from "@/types/expedition";
import type { WeeklyData } from "@/types/weekly";
import type { HomeData } from "@/types/home";
import type { SavedData } from "@/types/saved";
import type { RoiCard } from "@/types/roi";

export const MOCK_HOME: HomeData = {
  notices: [
    {
      id: "n1",
      title: "정기 점검 안내 (매주 목요일 06:00 ~ 10:00)",
      type: "maintenance",
      startAt: "2026-04-16T06:00:00+09:00",
      endAt: "2026-04-16T10:00:00+09:00",
      url: null,
    },
  ],
  featuredContents: [
    {
      id: "fc1",
      name: "에기르 (노말)",
      imageUrl: null,
      recommendedItemLevel: 1620,
      category: "군단장 레이드",
    },
    {
      id: "fc2",
      name: "베히모스",
      imageUrl: null,
      recommendedItemLevel: 1640,
      category: "군단장 레이드",
    },
    {
      id: "fc3",
      name: "카제로스 (노말)",
      imageUrl: null,
      recommendedItemLevel: 1660,
      category: "군단장 레이드",
    },
  ],
};

export const MOCK_CHARACTER: CharacterData = {
  character: {
    characterName: "아르페지오",
    serverName: "카마인",
    characterClass: "소서리스",
    characterLevel: 60,
    itemLevel: 1680,
    thumbnailUrl: null,
    equipment: [
      { type: "무기", name: "고대 소서리스의 지팡이", tier: 3, level: 25, quality: 88 },
      { type: "투구", name: "고대 소서리스의 투구", tier: 3, level: 25, quality: 92 },
      { type: "상의", name: "고대 소서리스의 로브", tier: 3, level: 25, quality: 75 },
      { type: "하의", name: "고대 소서리스의 하의", tier: 3, level: 25, quality: 80 },
      { type: "장갑", name: "고대 소서리스의 장갑", tier: 3, level: 25, quality: 85 },
      { type: "어깨", name: "고대 소서리스의 어깨", tier: 3, level: 25, quality: 78 },
    ],
    gems: [
      { level: 10, type: "멸화", skill: "혜성", effect: "10레벨 멸화 - 혜성 피해 증가" },
      { level: 9, type: "홍염", skill: "혜성", effect: "9레벨 홍염 - 혜성 쿨타임 감소" },
      { level: 9, type: "멸화", skill: "블리자드", effect: "9레벨 멸화 - 블리자드 피해 증가" },
      { level: 7, type: "홍염", skill: "블리자드", effect: "7레벨 홍염 - 블리자드 쿨타임 감소" },
    ],
    engravings: [
      { name: "갈증", level: 3 },
      { name: "얼음 속성 강화", level: 3 },
      { name: "원한", level: 3 },
      { name: "아드레날린", level: 3 },
      { name: "예리한 둔기", level: 1 },
    ],
    stats: {
      치명: 1200,
      특화: 800,
      신속: 400,
    },
  },
  siblings: [
    { characterName: "아르페지오", characterClass: "소서리스", itemLevel: 1680 },
    { characterName: "아르페지오2", characterClass: "워로드", itemLevel: 1650 },
    { characterName: "아르페지오3", characterClass: "버서커", itemLevel: 1630 },
  ],
};

export const MOCK_EXPEDITION: ExpeditionData = {
  representativeName: "아르페지오",
  serverName: "카마인",
  characters: [
    { characterName: "아르페지오", characterClass: "소서리스", itemLevel: 1680, serverName: "카마인", isRepresentative: true },
    { characterName: "아르페지오2", characterClass: "워로드", itemLevel: 1650, serverName: "카마인", isRepresentative: false },
    { characterName: "아르페지오3", characterClass: "버서커", itemLevel: 1630, serverName: "카마인", isRepresentative: false },
    { characterName: "아르페지오4", characterClass: "스트라이커", itemLevel: 1610, serverName: "카마인", isRepresentative: false },
  ],
  topCharacter: MOCK_CHARACTER.character,
  totalCharacterCount: 4,
  roiCards: [], // MOCK_ROI_CARDS는 아래에서 별도 정의 후 api route에서 결합
};

/** 다음 목요일 06:00 (서버시간 KST) 계산 */
function getNextWeeklyReset(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 4=Thu
  const daysUntilThursday = (4 - day + 7) % 7 || 7;
  const reset = new Date(now);
  reset.setDate(now.getDate() + daysUntilThursday);
  reset.setHours(6, 0, 0, 0);
  return reset.toISOString();
}

export const MOCK_WEEKLY: WeeklyData = {
  representativeName: "아르페지오",
  weeklyResetAt: getNextWeeklyReset(),
  characters: [
    {
      characterName: "아르페지오",
      characterClass: "소서리스",
      itemLevel: 1680,
      contents: [
        { id: "aegir-nm", name: "에기르 (노말)", category: "레이드", minItemLevel: 1620, maxGates: 4, completed: false, goldReward: 9000 },
        { id: "aegir-hd", name: "에기르 (하드)", category: "레이드", minItemLevel: 1640, maxGates: 4, completed: false, goldReward: 15000 },
        { id: "behemoth", name: "베히모스", category: "레이드", minItemLevel: 1640, maxGates: 2, completed: false, goldReward: 7000 },
        { id: "kazeroth-nm", name: "카제로스 (노말)", category: "레이드", minItemLevel: 1660, maxGates: 4, completed: false, goldReward: 12000 },
      ],
    },
    {
      characterName: "아르페지오2",
      characterClass: "워로드",
      itemLevel: 1650,
      contents: [
        { id: "aegir-nm", name: "에기르 (노말)", category: "레이드", minItemLevel: 1620, maxGates: 4, completed: false, goldReward: 9000 },
        { id: "aegir-hd", name: "에기르 (하드)", category: "레이드", minItemLevel: 1640, maxGates: 4, completed: false, goldReward: 15000 },
        { id: "behemoth", name: "베히모스", category: "레이드", minItemLevel: 1640, maxGates: 2, completed: false, goldReward: 7000 },
      ],
    },
  ],
  roiFollowups: [], // mock 모드에서는 API 라우트에서 ROI 엔진으로 생성
};

export const MOCK_SAVED: SavedData = {
  items: [
    {
      id: "s1",
      type: "expedition",
      key: "아르페지오",
      label: "아르페지오 원정대",
      pinned: true,
      tags: ["메인"],
      lastSeenAt: "2026-04-16T12:00:00+09:00",
    },
    {
      id: "s2",
      type: "character",
      key: "아르페지오2",
      label: "아르페지오2 (워로드)",
      pinned: false,
      tags: ["서브"],
      lastSeenAt: "2026-04-15T08:00:00+09:00",
    },
  ],
  changeEvents: [
    {
      id: "ce1",
      itemId: "s1",
      eventType: "spec_change",
      summary: "아르페지오 아이템 레벨 1675 → 1680 변경",
      before: { itemLevel: 1675 },
      after: { itemLevel: 1680 },
      severity: "mid",
      detectedAt: "2026-04-16T14:30:00+09:00",
    },
    {
      id: "ce2",
      itemId: "s2",
      eventType: "weekly_change",
      summary: "아르페지오2 에기르 (하드) 클리어 확인",
      before: { completed: false },
      after: { completed: true },
      severity: "low",
      detectedAt: "2026-04-16T20:00:00+09:00",
    },
  ],
};

export const MOCK_ROI_CARDS: RoiCard[] = [
  {
    id: "roi1",
    targetType: "character",
    targetKey: "아르페지오3",
    title: "아르페지오3 아이템 레벨 1640 달성",
    reason: "1640 달성 시 에기르(하드), 베히모스 입장 가능 → 주간 골드 +22,000",
    estimatedCost: { gold: 45000, time: "mid" },
    expectedImpact: "주간 골드 수입 약 50% 증가",
    roiScore: 82,
    confidence: "mid",
    actions: ["재련 +2 시도", "장비 품질 업그레이드"],
  },
  {
    id: "roi2",
    targetType: "character",
    targetKey: "아르페지오4",
    title: "아르페지오4 아이템 레벨 1620 달성",
    reason: "1620 달성 시 에기르(노말) 입장 가능 → 주간 골드 +9,000",
    estimatedCost: { gold: 15000, time: "low" },
    expectedImpact: "신규 골드 소스 확보",
    roiScore: 75,
    confidence: "mid",
    actions: ["재련 +1 시도"],
  },
  {
    id: "roi3",
    targetType: "character",
    targetKey: "아르페지오",
    title: "보석 레벨 균일화 (7렙 → 9렙)",
    reason: "블리자드 홍염 보석이 7레벨로 딜 사이클 효율 저하",
    estimatedCost: { gold: 30000, time: "low" },
    expectedImpact: "DPS 약 5~8% 향상",
    roiScore: 60,
    confidence: "low",
    actions: ["홍염 7렙 → 9렙 합성 또는 구매"],
  },
];

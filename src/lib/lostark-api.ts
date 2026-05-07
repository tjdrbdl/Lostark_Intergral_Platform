/**
 * 로스트아크 Open API 클라이언트 (서버 전용)
 * 원칙: 프론트에서 직접 호출 금지. 반드시 /api/* 라우트를 통해서만 접근.
 *
 * TODO: 실제 API 키는 LOSTARK_API_KEY 환경변수에서 읽는다.
 *       .env.local에 LOSTARK_API_KEY=<발급받은 키> 를 추가할 것.
 *       제거 기준: 실제 API 연동 완료 및 E2E 테스트 통과 시
 */

const LOSTARK_API_BASE = "https://developer-lostark.game.onstove.com";

// TODO: 환경변수 없으면 mock으로 fallback하도록 설계됨
const API_KEY = process.env.LOSTARK_API_KEY ?? "";

export const IS_MOCK_MODE = !API_KEY;

interface FetchOptions {
  /** 캐시 TTL (초). Next.js revalidate에 전달됨 */
  revalidate?: number;
}

/** API 인증 실패 전용 에러 — 잘못된 키 또는 만료된 키 */
export class LostArkAuthError extends Error {
  constructor() {
    super("LostArk API 인증 실패: API 키가 잘못되었거나 만료되었습니다.");
    this.name = "LostArkAuthError";
  }
}

async function lostarkFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data: T; fetchedAt: string }> {
  if (IS_MOCK_MODE) {
    throw new Error("MOCK_MODE: use mock data instead of real API");
  }

  const url = `${LOSTARK_API_BASE}${path}`;
  const fetchedAt = new Date().toISOString();

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      authorization: `bearer ${API_KEY}`,
    },
    next: { revalidate: options.revalidate ?? 300 },
  });

  if (res.status === 401) {
    throw new LostArkAuthError();
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LostArk API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as T;
  return { data, fetchedAt };
}

/** 캐릭터 기본 프로필 조회 — 존재하지 않으면 null 반환 가능 */
export async function fetchCharacterProfile(characterName: string) {
  return lostarkFetch<LostArkCharacterProfile | null>(
    `/armories/characters/${encodeURIComponent(characterName)}/profiles`,
    { revalidate: 300 }
  );
}

/** 캐릭터 장비 조회 — 장비 없으면 null 반환 가능 */
export async function fetchCharacterEquipment(characterName: string) {
  return lostarkFetch<LostArkEquipment[] | null>(
    `/armories/characters/${encodeURIComponent(characterName)}/equipment`,
    { revalidate: 300 }
  );
}

/** 캐릭터 보석 조회 — 보석 없으면 null 반환 가능 */
export async function fetchCharacterGems(characterName: string) {
  return lostarkFetch<{ Gems: LostArkGem[] | null } | null>(
    `/armories/characters/${encodeURIComponent(characterName)}/gems`,
    { revalidate: 300 }
  );
}

/** 캐릭터 각인 조회 — 실제 응답은 배열이 아닌 객체 { Engravings, Effects } */
export async function fetchCharacterEngravings(characterName: string) {
  return lostarkFetch<LostArkEngravingResponse>(
    `/armories/characters/${encodeURIComponent(characterName)}/engravings`,
    { revalidate: 300 }
  );
}

/** 원정대 캐릭터 목록 조회 — 1인 원정대이거나 비공개 시 null 반환 가능 */
export async function fetchExpeditionCharacters(characterName: string) {
  return lostarkFetch<LostArkSibling[] | null>(
    `/characters/${encodeURIComponent(characterName)}/siblings`,
    { revalidate: 300 }
  );
}

// ─── 로스트아크 Open API 원시 타입 ───────────────────────────────────────────
// TODO: 실제 API 응답 필드에 맞춰 검증 필요 (현재는 공식 문서 기반 추정)
// 제거 기준: Zod 등 런타임 검증 라이브러리 도입 시 교체

export interface LostArkCharacterProfile {
  CharacterName: string;
  ServerName: string;
  CharacterClassName: string;
  CharacterLevel: number;
  ItemAvgLevel: string; // "1,620.00" 형태
  ItemMaxLevel: string;
  CharacterImage: string | null;
}

export interface LostArkEquipment {
  Type: string;
  Name: string;
  Grade: string;
  Icon: string;
  Tooltip: string; // JSON 문자열
}

export interface LostArkGem {
  Slot: number;
  Name: string;
  Icon: string;
  Level: number;
  Grade: string;
  Tooltip: string;
}

export interface LostArkEngraving {
  Name: string;
  Icon: string;
  Level: number;
}

/** 각인 엔드포인트 실제 응답 래퍼 */
export interface LostArkEngravingResponse {
  /** 각인 목록 — 각인 없으면 null 반환 */
  Engravings: LostArkEngraving[] | null;
  Effects: { Name: string; Description: string }[] | null;
}

export interface LostArkSibling {
  ServerName: string;
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
}

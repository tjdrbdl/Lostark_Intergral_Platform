/**
 * 단일 사용자 in-memory 저장소
 *
 * 정책:
 * - 로그인/권한 없음 (MVP 범위 밖)
 * - 서버 재시작 시 휘발 (영속성은 Sprint 3 이후 DB 연동 시 교체)
 * - 개발/테스트 환경에서 mock 시드 데이터로 초기화
 * - 최대 항목 수: 50개 (초과 시 lastSeenAt 오래된 것부터 제거)
 *
 * 제거 기준: DB/사용자 식별 정책 확정 후 교체
 */

import { MOCK_SAVED } from "./mock-data";
import type { SavedItem, ChangeEvent } from "@/types/saved";

const MAX_ITEMS = 50;

// 서버 모듈 싱글톤 (Next.js hot-reload 대응)
declare global {
  // eslint-disable-next-line no-var
  var __savedStore: SavedStore | undefined;
}

interface SavedStore {
  items: SavedItem[];
  changeEvents: ChangeEvent[];
}

function initStore(): SavedStore {
  return {
    items: [...MOCK_SAVED.items],
    changeEvents: [...MOCK_SAVED.changeEvents],
  };
}

function getStore(): SavedStore {
  if (!global.__savedStore) {
    global.__savedStore = initStore();
  }
  return global.__savedStore;
}

/** 정렬: pinned 우선 → lastSeenAt 최신순 */
function sortItems(items: SavedItem[]): SavedItem[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const ta = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
    const tb = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
    return tb - ta;
  });
}

export function savedStoreGetAll(): SavedStore {
  const store = getStore();
  return {
    items: sortItems(store.items),
    changeEvents: [...store.changeEvents],
  };
}

export function savedStoreCreate(
  item: Omit<SavedItem, "id" | "lastSeenAt">
): { created: SavedItem; alreadyExists: boolean } {
  const store = getStore();

  const existing = store.items.find(
    (i) => i.type === item.type && i.key === item.key
  );
  if (existing) {
    // 이미 있으면 lastSeenAt만 갱신
    existing.lastSeenAt = new Date().toISOString();
    return { created: existing, alreadyExists: true };
  }

  const newItem: SavedItem = {
    ...item,
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    lastSeenAt: new Date().toISOString(),
  };

  store.items.push(newItem);

  // 최대 항목 초과 시 lastSeenAt 오래된 것 제거
  if (store.items.length > MAX_ITEMS) {
    store.items = sortItems(store.items).slice(0, MAX_ITEMS);
  }

  return { created: newItem, alreadyExists: false };
}

export function savedStorePatch(
  id: string,
  patch: Partial<Pick<SavedItem, "pinned" | "tags" | "label">>
): SavedItem | null {
  const store = getStore();
  const item = store.items.find((i) => i.id === id);
  if (!item) return null;

  if (patch.pinned !== undefined) item.pinned = patch.pinned;
  if (patch.tags !== undefined) item.tags = patch.tags;
  if (patch.label !== undefined) item.label = patch.label;
  item.lastSeenAt = new Date().toISOString();

  return item;
}

export function savedStoreDelete(id: string): boolean {
  const store = getStore();
  const before = store.items.length;
  store.items = store.items.filter((i) => i.id !== id);
  // 연관 변경 이벤트도 함께 제거
  store.changeEvents = store.changeEvents.filter((e) => e.itemId !== id);
  return store.items.length < before;
}

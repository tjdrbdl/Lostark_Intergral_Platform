const SEOUL_TIME_ZONE = "Asia/Seoul";

function getSeoulParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

/** 수요일 06:00 KST를 기준으로 다음 주간 초기화 시각을 반환한다. */
export function getNextWeeklyReset(now: Date = new Date()): string {
  const seoul = getSeoulParts(now);
  const seoulDate = new Date(Date.UTC(seoul.year, seoul.month - 1, seoul.day));
  const weekday = seoulDate.getUTCDay(); // Sunday=0, Wednesday=3
  const beforeReset = seoul.hour < 6;
  const daysUntilWednesday = weekday < 3 ? 3 - weekday : weekday > 3 ? 10 - weekday : beforeReset ? 0 : 7;
  const resetDay = new Date(Date.UTC(seoul.year, seoul.month - 1, seoul.day + daysUntilWednesday));

  // KST is UTC+09:00 and has no DST; 06:00 KST is 21:00 UTC on the prior date.
  return new Date(Date.UTC(resetDay.getUTCFullYear(), resetDay.getUTCMonth(), resetDay.getUTCDate(), -3, 0, 0, 0)).toISOString();
}

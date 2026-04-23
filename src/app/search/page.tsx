import { redirect } from "next/navigation";

type SearchType = "character" | "expedition" | "weekly";

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

function normalizeType(input?: string): SearchType {
  if (input === "character") return "character";
  if (input === "weekly") return "weekly";
  return "expedition";
}

export default async function SearchRedirectPage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    redirect("/");
  }

  const normalizedType = normalizeType(type);
  const pathPrefix =
    normalizedType === "character"
      ? "/character"
      : normalizedType === "weekly"
      ? "/weekly"
      : "/expedition";

  redirect(`${pathPrefix}/${encodeURIComponent(query)}`);
}

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "emphasis"; title: string; text: string };

export type ArticleSection = {
  title: string;
  blocks: ArticleBlock[];
};

export type ColossiansArticle = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  sections: ArticleSection[];
};

// Intentionally empty until the supplied Colossians study notes are added.
export const colossiansArticles: ColossiansArticle[] = [];

export function getArticle(slug: string) {
  return colossiansArticles.find((article) => article.slug === slug);
}

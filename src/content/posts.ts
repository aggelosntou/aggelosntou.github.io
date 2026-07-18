export type WritingPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string;
};

const postFiles = import.meta.glob("./posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const readFrontMatter = (source: string) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("A writing post is missing its front matter.");

  const metadata = Object.fromEntries(
    match[1].split("\n").map((line) => {
      const separator = line.indexOf(":");
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      return [key, value];
    }),
  );

  return { metadata, content: match[2].trim() };
};

export const writingPosts: WritingPost[] = Object.entries(postFiles)
  .map(([path, source]) => {
    const { metadata, content } = readFrontMatter(source);
    return {
      slug: path.split("/").pop()!.replace(/\.md$/, ""),
      title: metadata.title,
      date: metadata.date,
      summary: metadata.summary,
      content,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));


import { notFound } from "next/navigation";
import UserPage from "./User";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/profile?username=${params.slug}`,
  );
  const data = await res.json();
  if (!data.user) return notFound();
  const title = `${
    data.user.displayname ? data.user.displayname : data.user.username
  } (@${data.user.username}) / antarctica`;
  return {
    title: title,
    description: data.user.description,
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/@${data.user.username}`,
      images: [`${process.env.NEXTAUTH_URL}/avatars/${data.user.avatar}`],
      type: "website",
      title: title,
      siteName: "antarctica",
      description: data.user.description,
    },
    twitter: {
      title: title,
      description: data.user.description,
      images: [`${process.env.NEXTAUTH_URL}/avatars/${data.user.avatar}`],
      siteName: "antarctica",
      card: "summary",
      creator: "@arcaninebellies",
      creatorId: "1292500579604996096",
    },
  };
}
export default function User({ params }: { params: { slug: string } }) {
  return <UserPage params={params} />;
}

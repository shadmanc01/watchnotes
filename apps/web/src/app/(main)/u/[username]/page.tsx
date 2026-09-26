import { PublicProfileScreen } from "../../../../features/social/components/PublicProfileScreen";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  return <PublicProfileScreen username={username} />;
}

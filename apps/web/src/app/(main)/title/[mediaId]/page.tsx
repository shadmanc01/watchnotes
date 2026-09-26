import { TitleDetailScreen } from "../../../../features/library/components/TitleDetailScreen";

type TitlePageProps = {
  params: Promise<{
    mediaId: string;
  }>;
};

export default async function TitlePage({ params }: TitlePageProps) {
  const { mediaId } = await params;
  return <TitleDetailScreen mediaId={mediaId} />;
}

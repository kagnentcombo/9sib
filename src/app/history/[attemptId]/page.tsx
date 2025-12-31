import AttemptDetailClient from "./AttemptDetailClient";
export default function AttemptDetailPage({ params }: { params: { attemptId: string } }) {
  return <AttemptDetailClient params={params} />;
}
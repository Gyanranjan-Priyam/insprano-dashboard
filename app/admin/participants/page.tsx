import { getAllParticipants } from "./action";
import ParticipantsPageClient from "./_components/participants-client";

export default async function ParticipantsPage() {
  const result = await getAllParticipants();

  if (result.status === "error") {
    return <ParticipantsPageClient participants={[]} error={result.message} />;
  }

  return <ParticipantsPageClient participants={result.data || []} />;
}

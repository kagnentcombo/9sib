"use client";

import { useSession } from "next-auth/react";
import Quiz from "@/components/Quiz";

type Props = React.ComponentProps<typeof Quiz>;

export default function PremiumAwareQuiz(props: Props) {
  const { data: session } = useSession();
  const isPremium = (session as any)?.user?.isPremium ?? false;

  return <Quiz {...props} isPremium={isPremium} />;
}

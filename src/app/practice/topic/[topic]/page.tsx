import Quiz from '@/components/Quiz';
import { notFound } from 'next/navigation';
import { toUIQuestions } from '@/data/adapters';
import { generalAllRaw } from '@/data/subjects/general/all';
import { mathAllRaw } from '@/data/subjects/math/all';

interface Props { params: { topic: string } }

export default function TopicPracticePage({ params }: Props) {
  const topic = decodeURIComponent(params.topic);
  const raw = [...generalAllRaw, ...mathAllRaw];
  const ui = toUIQuestions(raw, `topic-${topic}`);
  const filtered = ui.filter((q: any) => (q.topics ?? []).includes(topic));
  if (!filtered.length) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Quiz title={`ฝึกหัวข้อ: ${topic} • ${filtered.length} ข้อ`} questions={filtered} setKey={`practice-topic-${topic}`} isPremium={true} />
    </div>
  );
}

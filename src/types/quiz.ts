export type ChoiceKey = "A" | "B" | "C" | "D";

export type Choice = {
  key: ChoiceKey;
  label?: string;
  img?: string;
  imgAlt?: string;
};

export type Question = {
  id: string;
  text?: string;
  image?: string;
  imageAlt?: string;
  choices: Choice[];
  correctKey: ChoiceKey;
  explanation?: string | string[];
  topics?: string[] | import("@/data/types").Topic[];
};

import { z } from 'zod';

export const SituationSchema = z.object({
  id: z.number(),
  scenario: z.string(),
  age_group: z.string().optional().nullable(),
  cognitive_pillar: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  question: z.string(),
  options: z.string().optional().nullable(),
  expected_outcome: z.string().optional().nullable(),
});

export type Situation = z.infer<typeof SituationSchema>;

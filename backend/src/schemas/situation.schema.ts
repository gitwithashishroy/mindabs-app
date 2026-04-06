import { z } from 'zod';

export const SituationSchema = z.object({
    scenario: z.string().min(1, "Scenario is required"),
    age_group: z.string().optional(),
    cognitive_pillar: z.string().optional(),
    difficulty: z.string().optional(),
    question: z.string().min(1, "Question is required"),
    options: z.string().optional(),
    expected_outcome: z.string().optional()
});

export const UpdateSituationSchema = SituationSchema.partial();

export type SituationDTO = z.infer<typeof SituationSchema>;
export type UpdateSituationDTO = z.infer<typeof UpdateSituationSchema>;

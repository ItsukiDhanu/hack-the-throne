import { z } from 'zod';

export const ContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    tagline: z.string(),
    badges: z.array(z.string()).default([]),
  }),
  details: z.array(
    z.object({
      title: z.string(),
      body: z.string(),
    })
  ),
  schedule: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      body: z.string(),
    })
  ),
  team: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
    })
  ),
  faqs: z.array(
    z.object({
      q: z.string(),
      a: z.string(),
    })
  ),
  stats: z
    .array(
      z.object({
        title: z.string(),
        value: z.string(),
        caption: z.string(),
      })
    )
    .optional(),
  registerNote: z.string().optional(),
});

export type Content = z.infer<typeof ContentSchema>;

import { z } from 'zod';

export const aspectRatioSchema = z.enum(['16:9', '9:16', '1:1']);

export const shotSchema = z.object({
  start: z.number().min(0),
  end: z.number().positive(),
  camera: z.string().default(''),
  content: z.string().min(1, '分镜内容不能为空'),
});
export type Shot = z.infer<typeof shotSchema>;

export const videoParamsSchema = z.object({
  idea: z.string().min(1, '先写下你的想法'),
  durationSeconds: z.number().positive().max(120).default(10),
  aspectRatio: aspectRatioSchema.default('16:9'),
  style: z.string().default('写实'),
  subject: z.string().default(''),
  environment: z.string().default(''),
  lighting: z.string().default(''),
  cameraMovement: z.string().default(''),
  shots: z.array(shotSchema).default([]),
  audio: z.string().default(''),
  negativePrompt: z.string().default(''),
  requestedResolution: z.string().optional(),
});
export type VideoParams = z.infer<typeof videoParamsSchema>;

export const imageParamsSchema = z.object({
  idea: z.string().min(1),
  aspectRatio: aspectRatioSchema.default('16:9'),
  style: z.string().default('写实'),
  subject: z.string().default(''),
  environment: z.string().default(''),
  lighting: z.string().default(''),
  negativePrompt: z.string().default(''),
});
export type ImageParams = z.infer<typeof imageParamsSchema>;

export const documentParamsSchema = z.object({
  idea: z.string().min(1),
  docType: z.string().default('报告'),
  audience: z.string().default(''),
  tone: z.string().default('专业、清晰'),
  lengthHint: z.string().default(''),
  mustInclude: z.string().default(''),
});
export type DocumentParams = z.infer<typeof documentParamsSchema>;

export const tripParamsSchema = z.object({
  idea: z.string().min(1),
  destination: z.string().default(''),
  days: z.number().positive().default(3),
  travelers: z.string().default(''),
  budgetHint: z.string().default(''),
  interests: z.string().default(''),
  constraints: z.string().default(''),
});
export type TripParams = z.infer<typeof tripParamsSchema>;

export const generalParamsSchema = z.object({
  idea: z.string().min(1),
  context: z.string().default(''),
  outputFormat: z.string().default(''),
  constraints: z.string().default(''),
});
export type GeneralParams = z.infer<typeof generalParamsSchema>;

export const scenarioIds = ['video', 'image', 'document', 'trip', 'general'] as const;
export type ScenarioId = (typeof scenarioIds)[number];

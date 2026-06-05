import { z } from "zod";

export const roles = ["admin", "recruiter", "manager", "candidate"] as const;
export type Role = (typeof roles)[number];

export const pipelineStages = ["applied", "screening", "interview", "offer", "hired", "rejected"] as const;
export type PipelineStage = (typeof pipelineStages)[number];

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(roles),
  organizationId: z.string().uuid().nullable(),
});
export type UserRecord = z.infer<typeof userSchema>;

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type OrganizationRecord = z.infer<typeof organizationSchema>;

export const jobSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  stage: z.enum(pipelineStages),
  location: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type JobRecord = z.infer<typeof jobSchema>;

export const candidateSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  fullName: z.string().min(1),
  email: z.string().email(),
  source: z.string().default("manual"),
  score: z.number().min(0).max(100),
});
export type CandidateRecord = z.infer<typeof candidateSchema>;

export const applicationSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  stage: z.enum(pipelineStages),
  aiRank: z.number().min(0).max(100),
  createdAt: z.string().datetime(),
});
export type ApplicationRecord = z.infer<typeof applicationSchema>;

export const apiEnvelopeSchema = <T extends z.ZodTypeAny>(payloadSchema: T) =>
  z.object({
    success: z.literal(true),
    data: payloadSchema,
  });

import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8).optional(), // Only used for registration
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Login schema
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginCredentials = z.infer<typeof LoginSchema>;

// Job schemas
export const JobSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  requirements: z.string().min(1),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']),
  salary: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Job = z.infer<typeof JobSchema>;

// Resume schemas
export const ResumeSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  content: z.string().min(1),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string(),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
    })
  ),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Resume = z.infer<typeof ResumeSchema>;

// Cover Letter schemas
export const CoverLetterSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  jobId: z.string().uuid(),
  content: z.string().min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type CoverLetter = z.infer<typeof CoverLetterSchema>; 
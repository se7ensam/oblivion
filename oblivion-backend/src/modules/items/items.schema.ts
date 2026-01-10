import { z } from "zod";

export const createItemSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1)
});

export const updateItemSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional()
});

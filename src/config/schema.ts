import { z } from "zod";

export const userConfigSchema = z.object({
	url: z.string().url().optional(),
	outputFormat: z.enum(["human", "json"]).optional(),
	verbose: z.boolean().optional(),
});

export type UserConfig = z.infer<typeof userConfigSchema>;

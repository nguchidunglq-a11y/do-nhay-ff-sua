import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { createUserFile, getUserFiles } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const MAX_FILE_BYTES = 50 * 1024 * 1024;

function safeFileName(fileName: string) {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 180) || "upload.bin";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  files: router({
    list: protectedProcedure.query(({ ctx }) => getUserFiles(ctx.user.id)),
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(128),
        size: z.number().int().nonnegative().max(MAX_FILE_BYTES),
        dataBase64: z.string().min(1).max(70_000_000),
      }))
      .mutation(async ({ ctx, input }) => {
        const bytes = Buffer.from(input.dataBase64, "base64");
        if (bytes.byteLength > MAX_FILE_BYTES || input.size > MAX_FILE_BYTES) {
          throw new Error("File vượt quá giới hạn 50MB");
        }
        if (!bytes.byteLength) throw new Error("File rỗng hoặc không hợp lệ");

        const fileName = safeFileName(input.fileName);
        const { key, url } = await storagePut(
          `${ctx.user.id}-files/${Date.now()}-${fileName}`,
          bytes,
          input.mimeType,
        );
        return createUserFile({
          userId: ctx.user.id,
          fileName,
          fileKey: key,
          url,
          mimeType: input.mimeType,
          size: bytes.byteLength,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;

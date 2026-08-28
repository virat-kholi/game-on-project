import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { agentReply, agentView, resolveGuess, roster } from "./vault.server";

export const getRoster = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ playerId: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => roster(data.playerId));

export const getAgent = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ playerId: z.string().min(1), agentId: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => agentView(data.playerId, data.agentId));

export const sendChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        agentId: z.string().min(1),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(1000),
            }),
          )
          .max(40),
      })
      .parse(data),
  )
  .handler(async ({ data }) => ({ reply: await agentReply(data.agentId, data.history) }));

export const submitGuess = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        playerId: z.string().min(1),
        agentId: z.string().min(1),
        plaintext: z.string().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) => resolveGuess(data.playerId, data.agentId, data.plaintext));

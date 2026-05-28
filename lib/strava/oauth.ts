import { z } from "zod";

const StravaTokenBaseSchema = z.object({
  token_type: z.string().optional(),
  expires_at: z.number(),
  expires_in: z.number().optional(),
  refresh_token: z.string(),
  access_token: z.string()
});

export const StravaTokenResponseSchema = StravaTokenBaseSchema.extend({
  athlete: z.object({
    id: z.number(),
    username: z.string().nullable().optional(),
    firstname: z.string().nullable().optional(),
    lastname: z.string().nullable().optional()
  })
});

export const StravaRefreshTokenResponseSchema = StravaTokenBaseSchema;

export type StravaTokenResponse = z.infer<typeof StravaTokenResponseSchema>;
export type StravaRefreshTokenResponse = z.infer<typeof StravaRefreshTokenResponseSchema>;

export async function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code"
    })
  });

  if (!res.ok) throw new Error(`STRAVA_CODE_EXCHANGE_FAILED:${res.status}`);
  return StravaTokenResponseSchema.parse(await res.json());
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaRefreshTokenResponse> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  });

  if (!res.ok) throw new Error(`STRAVA_REFRESH_FAILED:${res.status}`);
  return StravaRefreshTokenResponseSchema.parse(await res.json());
}

/**
 * Profiles service — all Supabase interactions for the profiles table.
 */
import { type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"
import { logger } from "@/lib/logger"

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

export async function getProfileById(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    logger.error("ProfilesService", "getProfileById failed", { error, userId })
    throw new Error(error.message)
  }

  return data
}

export async function upsertProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: { name?: string; email?: string },
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates }, { onConflict: "id" })
    .select()
    .single()

  if (error) {
    logger.error("ProfilesService", "upsertProfile failed", { error, userId })
    throw new Error(error.message)
  }

  return data
}

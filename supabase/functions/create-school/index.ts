import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "@supabase/supabase-js/cors";
import { z } from "https://esm.sh/zod@3.23.8";

const BodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9-]+$/),
  principalEmail: z.string().trim().email().max(255),
  principalName: z.string().trim().min(2).max(100),
});

function genPassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let p = "";
  const arr = new Uint32Array(14);
  crypto.getRandomValues(arr);
  for (const n of arr) p += chars[n % chars.length];
  return p + "!9";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is a super_admin using their JWT
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden — super_admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { name, slug, principalEmail, principalName } = parsed.data;

    // 1. Create school
    const { data: school, error: schoolErr } = await admin
      .from("schools").insert({ name, slug }).select("id").single();
    if (schoolErr) {
      return new Response(JSON.stringify({ error: schoolErr.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Find or create principal user
    let principalUserId: string | null = null;
    let tempPassword: string | null = null;

    // Look up by email
    const { data: existing } = await admin.auth.admin.listUsers();
    const found = existing.users.find((u) => u.email?.toLowerCase() === principalEmail.toLowerCase());

    if (found) {
      principalUserId = found.id;
    } else {
      tempPassword = genPassword();
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: principalEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: principalName },
      });
      if (createErr || !created.user) {
        await admin.from("schools").delete().eq("id", school.id);
        return new Response(JSON.stringify({ error: createErr?.message ?? "Failed to create user" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      principalUserId = created.user.id;
    }

    // 3. Link profile to school
    await admin.from("profiles").update({ school_id: school.id, full_name: principalName }).eq("user_id", principalUserId);

    // 4. Assign principal role
    await admin.from("user_roles").insert({
      user_id: principalUserId,
      role: "principal",
      school_id: school.id,
    });

    // 5. Audit
    await admin.from("audit_log").insert({
      actor_id: userData.user.id,
      school_id: school.id,
      action: "school_created",
      entity_type: "school",
      entity_id: school.id,
      details: { principal_email: principalEmail },
    });

    return new Response(JSON.stringify({ schoolId: school.id, principalUserId, tempPassword }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

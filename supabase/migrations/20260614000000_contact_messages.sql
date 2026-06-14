-- Persist contact form submissions (suggestions, bug reports, "join the journey" requests).
CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "role" "text",
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "contact_messages_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'read'::"text", 'resolved'::"text"])))
);

ALTER TABLE "public"."contact_messages" OWNER TO "postgres";

-- RLS enabled, no policies defined => default-deny for anon/authenticated roles.
-- Only the service_role key (used by lib/supabase-admin.ts) can read/write this table.
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;




SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    -- On essaie de récupérer le nom depuis les métadonnées
    -- Si l'utilisateur ne l'a pas fourni, on prend la partie
    -- avant le @ dans son email comme nom par défaut
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_avg_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  update profiles
  set
    avg_rating = (
      select round(avg(score)::numeric, 1)
      from ratings
      where rated_id = NEW.rated_id
    ),
    ratings_count = (
      select count(*)
      from ratings
      where rated_id = NEW.rated_id
    )
  where id = NEW.rated_id;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."update_avg_rating"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid",
    "project_id" "uuid",
    "message" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "connections_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "completed" boolean DEFAULT false,
    "position" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "country" "text",
    "bio" "text",
    "avg_rating" double precision DEFAULT 0,
    "ratings_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "preferred_contact_type" "text",
    "preferred_contact_value" "text",
    "first_name" "text",
    "last_name" "text",
    "school" "text",
    "major" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid",
    "role" "text",
    "status" "text" DEFAULT 'active'::"text",
    "rating_required" boolean DEFAULT false,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_members_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'left'::"text"])))
);


ALTER TABLE "public"."project_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "skill_needed" "text" NOT NULL
);


ALTER TABLE "public"."project_skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid",
    "title" "text" NOT NULL,
    "problem" "text",
    "level" "text",
    "domain" "text",
    "status" "text" DEFAULT 'open'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "duration" "text",
    "spots" integer DEFAULT 2,
    CONSTRAINT "projects_level_check" CHECK (("level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text", 'débutant'::"text", 'intermédiaire'::"text", 'avancé'::"text", 'Beginner'::"text", 'Intermediate'::"text", 'Advanced'::"text"]))),
    CONSTRAINT "projects_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ratings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_member_id" "uuid",
    "rater_id" "uuid",
    "rated_id" "uuid",
    "score" integer,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ratings_score_check" CHECK ((("score" >= 0) AND ("score" <= 5)))
);


ALTER TABLE "public"."ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "skill" "text" NOT NULL
);


ALTER TABLE "public"."user_skills" OWNER TO "postgres";


ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_project_id_user_id_key" UNIQUE ("project_id", "user_id");



ALTER TABLE ONLY "public"."project_skills"
    ADD CONSTRAINT "project_skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_project_member_id_rater_id_key" UNIQUE ("project_member_id", "rater_id");



ALTER TABLE ONLY "public"."user_skills"
    ADD CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "on_new_rating" AFTER INSERT ON "public"."ratings" FOR EACH ROW EXECUTE FUNCTION "public"."update_avg_rating"();



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_skills"
    ADD CONSTRAINT "project_skills_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_project_member_id_fkey" FOREIGN KEY ("project_member_id") REFERENCES "public"."project_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_rated_id_fkey" FOREIGN KEY ("rated_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_skills"
    ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Ajouter ses propres skills" ON "public"."user_skills" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Créer son propre profil" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Créer son propre projet" ON "public"."projects" FOR INSERT WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Envoyer une demande" ON "public"."connections" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "Insérer les skills de son projet" ON "public"."project_skills" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "project_skills"."project_id"))));



CREATE POLICY "Members can rate collaborators" ON "public"."ratings" FOR INSERT WITH CHECK ((("auth"."uid"() = "rater_id") AND (EXISTS ( SELECT 1
   FROM ("public"."project_members" "pm"
     JOIN "public"."projects" "p" ON (("p"."id" = "pm"."project_id")))
  WHERE (("pm"."user_id" = "auth"."uid"()) AND ("pm"."project_id" = ( SELECT "project_members"."project_id"
           FROM "public"."project_members"
          WHERE ("project_members"."id" = "ratings"."project_member_id"))))))));



CREATE POLICY "Membres visibles par tous" ON "public"."project_members" FOR SELECT USING (true);



CREATE POLICY "Milestones visible by all" ON "public"."milestones" FOR SELECT USING (true);



CREATE POLICY "Modifier le statut membre" ON "public"."project_members" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "project_members"."project_id")))));



CREATE POLICY "Modifier son propre profil" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Modifier son propre projet" ON "public"."projects" FOR UPDATE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Noter un collaborateur" ON "public"."ratings" FOR INSERT WITH CHECK ((("auth"."uid"() = "rater_id") AND (EXISTS ( SELECT 1
   FROM "public"."project_members"
  WHERE (("project_members"."project_id" = ( SELECT "project_members_1"."project_id"
           FROM "public"."project_members" "project_members_1"
          WHERE ("project_members_1"."id" = "ratings"."project_member_id"))) AND ("project_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Notes visibles par tous" ON "public"."ratings" FOR SELECT USING (true);



CREATE POLICY "Owner adds milestones" ON "public"."milestones" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "milestones"."project_id"))));



CREATE POLICY "Owner ajoute les skills recherchées" ON "public"."project_skills" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "project_skills"."project_id"))));



CREATE POLICY "Owner ajoute un membre" ON "public"."project_members" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "project_members"."project_id"))));



CREATE POLICY "Owner deletes milestones" ON "public"."milestones" FOR DELETE USING (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "milestones"."project_id"))));



CREATE POLICY "Owner gère les demandes" ON "public"."connections" FOR UPDATE USING (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "connections"."project_id"))));



CREATE POLICY "Owner manages connection requests" ON "public"."connections" FOR UPDATE USING (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "connections"."project_id"))));



CREATE POLICY "Owner supprime les skills recherchées" ON "public"."project_skills" FOR DELETE USING (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "project_skills"."project_id"))));



CREATE POLICY "Owner updates milestones" ON "public"."milestones" FOR UPDATE USING (("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "milestones"."project_id"))));



CREATE POLICY "Owner updates project status" ON "public"."projects" FOR UPDATE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Profils visibles par tous" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Project skills visibles par tous" ON "public"."project_skills" FOR SELECT USING (true);



CREATE POLICY "Projets visibles par tous" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Ratings visible by all" ON "public"."ratings" FOR SELECT USING (true);



CREATE POLICY "Skills visibles par tous" ON "public"."user_skills" FOR SELECT USING (true);



CREATE POLICY "Supprimer ses propres skills" ON "public"."user_skills" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Supprimer son propre projet" ON "public"."projects" FOR DELETE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Update rating required flag" ON "public"."project_members" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "project_members"."project_id")))));



CREATE POLICY "Voir ses propres connexions" ON "public"."connections" FOR SELECT USING ((("auth"."uid"() = "sender_id") OR ("auth"."uid"() = ( SELECT "projects"."owner_id"
   FROM "public"."projects"
  WHERE ("projects"."id" = "connections"."project_id")))));



ALTER TABLE "public"."connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."milestones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_skills" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_avg_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_avg_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_avg_rating"() TO "service_role";


















GRANT ALL ON TABLE "public"."connections" TO "anon";
GRANT ALL ON TABLE "public"."connections" TO "authenticated";
GRANT ALL ON TABLE "public"."connections" TO "service_role";



GRANT ALL ON TABLE "public"."milestones" TO "anon";
GRANT ALL ON TABLE "public"."milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."milestones" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_members" TO "anon";
GRANT ALL ON TABLE "public"."project_members" TO "authenticated";
GRANT ALL ON TABLE "public"."project_members" TO "service_role";



GRANT ALL ON TABLE "public"."project_skills" TO "anon";
GRANT ALL ON TABLE "public"."project_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."project_skills" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."ratings" TO "anon";
GRANT ALL ON TABLE "public"."ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."ratings" TO "service_role";



GRANT ALL ON TABLE "public"."user_skills" TO "anon";
GRANT ALL ON TABLE "public"."user_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."user_skills" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



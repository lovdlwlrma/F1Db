-- Create "users" table
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL,
  "username" character varying(50) NOT NULL,
  "email" character varying(255) NOT NULL,
  "password_hash" text NOT NULL,
  "full_name" character varying(100) NULL,
  "avatar_url" text NULL,
  "role" character varying(20) NULL DEFAULT 'user',
  "is_active" boolean NULL DEFAULT true,
  "created_at" timestamptz NULL DEFAULT now(),
  "updated_at" timestamptz NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "users_email_key" UNIQUE ("email"),
  CONSTRAINT "users_username_key" UNIQUE ("username")
);
-- Create index "idx_users_email" to table: "users"
CREATE INDEX "idx_users_email" ON "public"."users" ("email");
-- Create index "idx_users_username" to table: "users"
CREATE INDEX "idx_users_username" ON "public"."users" ("username");

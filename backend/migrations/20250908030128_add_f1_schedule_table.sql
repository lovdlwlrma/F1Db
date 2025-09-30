-- Create "f1_schedule" table
CREATE TABLE "public"."f1_schedule" (
  "id" serial NOT NULL,
  "year" integer NOT NULL,
  "grand_prix" character varying(100) NOT NULL,
  "country" character varying(100) NOT NULL,
  "circuit_name" character varying(150) NOT NULL,
  "q1_start" timestamp NULL,
  "q2_start" timestamp NULL,
  "q3_start" timestamp NULL,
  "sprint_qualify_start" timestamp NULL,
  "sprint_start" timestamp NULL,
  "qualify_start" timestamp NULL,
  "race_start" timestamp NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "unique_race" UNIQUE ("year", "grand_prix", "circuit_name")
);

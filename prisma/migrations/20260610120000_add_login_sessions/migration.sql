-- CreateTable (IF NOT EXISTS porque db push puede haberla creado antes)
CREATE TABLE IF NOT EXISTS "login_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "hospital_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_sessions_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'login_sessions_user_id_fkey'
    ) THEN
        ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

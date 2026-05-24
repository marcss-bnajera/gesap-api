-- CreateEnum
CREATE TYPE "HospitalLevel" AS ENUM ('REFERENCIA_NACIONAL', 'ESPECIALIZADO', 'REGIONAL', 'DEPARTAMENTAL', 'DISTRITAL', 'CENTRO_SALUD_A', 'CENTRO_SALUD_B', 'CAP');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "availability_status" "AvailabilityStatus",
ADD COLUMN     "fleet_id" VARCHAR(50),
ADD COLUMN     "hospital_id" INTEGER;

-- CreateTable
CREATE TABLE "hospitals" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "level" "HospitalLevel" NOT NULL,
    "department" VARCHAR(50) NOT NULL,
    "municipality" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255),
    "phone" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_code_key" ON "hospitals"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

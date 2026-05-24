-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "unidentified_patients" (
    "id" SERIAL NOT NULL,
    "estimated_age" INTEGER,
    "sex" "Sex" NOT NULL,
    "hat_description" VARCHAR(255),
    "head_face_description" VARCHAR(255),
    "shirt_description" VARCHAR(255),
    "jacket_description" VARCHAR(255),
    "pants_description" VARCHAR(255),
    "shoes_description" VARCHAR(255),
    "additional_notes" TEXT,
    "hospital_id" INTEGER NOT NULL,
    "transfer_date" TIMESTAMP(3) NOT NULL,
    "created_by_id" INTEGER NOT NULL,
    "identified_patient_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidentified_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergencies" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "unidentified_patient_id" INTEGER,
    "created_by_id" INTEGER NOT NULL,
    "assigned_to_id" INTEGER,
    "hospital_destination_id" INTEGER NOT NULL,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'PENDING',
    "primary_assessment" JSONB,
    "secondary_assessment" JSONB,
    "completion_record" JSONB,
    "notes" TEXT,
    "transfer_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergencies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "unidentified_patients" ADD CONSTRAINT "unidentified_patients_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidentified_patients" ADD CONSTRAINT "unidentified_patients_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidentified_patients" ADD CONSTRAINT "unidentified_patients_identified_patient_id_fkey" FOREIGN KEY ("identified_patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergencies" ADD CONSTRAINT "emergencies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergencies" ADD CONSTRAINT "emergencies_unidentified_patient_id_fkey" FOREIGN KEY ("unidentified_patient_id") REFERENCES "unidentified_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergencies" ADD CONSTRAINT "emergencies_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergencies" ADD CONSTRAINT "emergencies_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergencies" ADD CONSTRAINT "emergencies_hospital_destination_id_fkey" FOREIGN KEY ("hospital_destination_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "medical_records" ADD COLUMN     "hospital_id" INTEGER;

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "hospital_id" INTEGER;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

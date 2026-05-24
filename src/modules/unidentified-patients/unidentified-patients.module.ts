import { Module } from '@nestjs/common';
import { UnidentifiedPatientsService } from './unidentified-patients.service';
import { UnidentifiedPatientsController } from './unidentified-patients.controller';

@Module({
    controllers: [UnidentifiedPatientsController],
    providers: [UnidentifiedPatientsService],
    exports: [UnidentifiedPatientsService],
})
export class UnidentifiedPatientsModule {}

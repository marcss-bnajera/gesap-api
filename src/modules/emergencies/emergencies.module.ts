import { Module } from '@nestjs/common';
import { EmergenciesService } from './emergencies.service';
import { EmergenciesController } from './emergencies.controller';

@Module({
    controllers: [EmergenciesController],
    providers: [EmergenciesService],
    exports: [EmergenciesService],
})
export class EmergenciesModule {}

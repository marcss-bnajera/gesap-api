import { Module } from '@nestjs/common';
import { UserEventsGateway } from './user-events.gateway';

@Module({
    providers: [UserEventsGateway],
    exports: [UserEventsGateway],
})
export class EventsModule {}

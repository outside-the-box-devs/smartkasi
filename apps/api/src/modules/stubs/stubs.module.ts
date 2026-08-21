import { Module } from '@nestjs/common';
import { DeliveryStubController } from './delivery.controller';
import { AiStubController } from './ai.controller';
import { PaymentsStubController } from './payments.controller';

/**
 * v1 STUBS.
 *
 * Every route here returns a fixed, schema-valid response. No database, no
 * logic, no model call. They exist so the Flutter and Next.js teams can wire
 * screens against a stable shape today.
 *
 * Rules for whoever implements these for real:
 *   1. The response SHAPES are contractual. Change values freely; changing a
 *      field name breaks two client apps.
 *   2. CustomerDelivery must never grow coordinates, a route, or a courier
 *      phone number. See docs/API_CONTRACT.md § Route privacy.
 *   3. Delete the stub controller in the same commit that adds the real one.
 *      A stub that outlives its replacement is a silent liar.
 */
@Module({
  controllers: [DeliveryStubController, AiStubController, PaymentsStubController],
})
export class StubsModule {}

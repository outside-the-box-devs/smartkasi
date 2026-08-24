import { Module } from '@nestjs/common';
import { AiStubController } from './ai.controller';
import { PaymentsStubController } from './payments.controller';

/**
 * v1 STUBS — what is left of them.
 *
 * Delivery graduated: it is a real, database-backed module now, in
 * src/modules/delivery/. These two have not, and every response they return
 * still carries `_stub: true`.
 *
 * No database, no logic, no model call. They exist so the Flutter and Next.js
 * teams can wire screens against a stable shape today.
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
  controllers: [AiStubController, PaymentsStubController],
})
export class StubsModule {}

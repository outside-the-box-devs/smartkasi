-- =============================================================================
-- Shop licence rejection reason — 2026-09-13
--
-- Fixes the one open item on SK-06 (issue #26): `PATCH /admin/shops/:id/licence`
-- could already move a shop to `rejected`, but nothing recorded *why* — an
-- owner saw the red banner and had no way to know what to fix before
-- resubmitting. docs/API_CONTRACT.md § 8 documented this as a known gap
-- ("A rejection reason ... there is no column to put words in"); this closes
-- it for shops. Couriers keep the same gap, tracked separately in the row
-- above it in that table.
--
-- `licence_rejection_reason` is nullable and cleared (not left stale) by the
-- API whenever a shop leaves `rejected` for any other status, or resubmits —
-- see shops.service.ts `setLicenceStatus` / `submitLicence`.
-- =============================================================================

alter table "shops" add column "licence_rejection_reason" text;

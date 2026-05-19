# Security Specification for Wrench Mob

## Data Invariants
1. A **RepairOrder** must be owned by the user who created it (`userId`).
2. An **InventoryItem** must be owned by the user who created it (`userId`).
3. A **Customer** must be owned by the user who created it (`userId`).
4. Timestamps (`createdAt`, `updatedAt`) must be validated against `request.time`.
5. Status and Priority fields must match their respective enums.

## The Dirty Dozen Payloads (Targeting RepairOrders as Example)

1. **Identity Spoofing**: `create` RepairOrder where `userId` is someone else's UID.
2. **Identity Spoofing (Update)**: `update` RepairOrder to change `userId` to a different user.
3. **Ghost Field Injection**: `create` RepairOrder with an extra field `isPremium: true` that doesn't exist in the schema.
4. **Invalid Type (Cost)**: `create` RepairOrder where `estimatedCost` is a string `"1000"`.
5. **Malicious ID**: `create` RepairOrder with a document ID that is 2KB of junk characters.
6. **State Shortcutting**: `update` a RepairOrder directly to `status: 'completed'` from `pending` without bypassing validation.
7. **Temporal Fraud**: `create` a RepairOrder with a hardcoded `createdAt` from 2020.
8. **PII Leak**: A user attempts to `get` or `list` a Customer document created by another user.
9. **Blanket Read Attack**: An unauthenticated user attempts to `list` all RepairOrders.
10. **Size Poisoning**: `create` a RepairOrder where the `issue` description is 5MB of text.
11. **Enum Bypass**: `create` a RepairOrder where `status` is `"exploding"`.
12. **Admin Spoofing**: `update` a document as a normal user but claiming to be an admin via custom logic.

## Logic Gates
- `isValidRepairOrder(data)` check for exact keys and types.
- `isValidInventoryItem(data)` check for exact keys and types.
- `isValidCustomer(data)` check for exact keys and types.
- `isOwner(userId)` helper.
- `isValidId(id)` helper.

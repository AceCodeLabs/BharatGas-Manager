# Security Specification - BharatGas Manager

## Data Invariants
1. A user can only access their own `userProfile`.
2. `operatorAccounts` can only be viewed/modified by their `ownerId`.
3. `orders` must belong to an `accountId` that the user owns.
4. `transactions` must always have an `ownerId` matching the current user.
5. `totalPoints` in `userProfiles` can only be updated if a transaction exists (Atomicity - though difficult to enforce perfectly without server-side logic, we will use basic checks).
6. Timestamps (`createdAt`, `updatedAt`, `completedAt`) must use `request.time`.

## The "Dirty Dozen" Payloads (Rejected Cases)
1. **Identity Spoofing**: Attempting to create an `operatorAccount` with someone else's `ownerId`.
2. **Ghost Field**: Adding `isAdmin: true` to a `userProfile` during update.
3. **ID Poisoning**: Using a 2KB string as `orderId`.
4. **State Shortcutting**: Updating an order status from `pending` to `completed` without setting a `completedAt` timestamp.
5. **PII Blanket Leak**: Attempting to list all `userProfiles` without a per-user filter.
6. **Immutable Breach**: Attempting to change `mobile` number of an existing `operatorAccount`.
7. **Negative Balance**: Attempting to set `totalPoints` to a negative value.
8. **Resource Exhaustion**: Sending a 1MB string in the `reason` field of a transaction.
9. **Unverified Auth**: Writing data with a non-verified email account.
10. **Shadow Transaction**: Creating a `debit` transaction with a positive amount.
11. **System Field Injection**: Manually setting `updatedAt` instead of using `request.time`.
12. **Orphaned Order**: Creating an order for an `accountId` that doesn't exist.

## Test Cases (To be verified)
- `create` operator account by owner -> ALLOW
- `create` operator account by non-owner -> DENY
- `update` totalPoints by user -> ALLOW (with restrictions)
- `list` orders for ownerId == current -> ALLOW
- `list` orders for ownerId != current -> DENY

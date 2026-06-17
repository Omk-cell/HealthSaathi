# Security Specification for HealthSaathi Firestore Invariants

This document outlines the security architecture designed for HealthSaathi to avoid access privilege escalation, update drift, data leakage, and Denial of Wallet attacks.

## 1. Data Invariants
1. **User Identity Invariant**: A user document of matching `{userId}` under `users/{userId}` can only be created and handled by an authenticated user matching `request.auth.uid`. No user can rewrite or access another user's profile.
2. **Booking Identity Invariant**: A booking document under `bookings/{bookingId}` can only be read or written by the user that created it. `userId` in the booking record must correspond to `request.auth.uid`.
3. **Temporal Invariant**: The `createdAt` fields on creation elements are strictly defined by the server's time `request.time`. No backdating is possible.
4. **Valid ID Structure**: Doc paths, user IDs, and booking IDs must conform to alphanumeric characters and dashes, and must stay within 128 characters.

---

## 2. The "Dirty Dozen" Payloads (Malicious Attacks)

### User Profile Intercepts
1. **U1: User Session Spoofing**
   - *Target Document*: `users/victim-uid`
   - *Malicious Payload*: `{ "uid": "victim-uid", "name": "Attacker", "email": "victim@domain.com", "createdAt": "request.time" }`
   - *Attacker identity*: `request.auth.uid = "attacker-uid"`
   - *Expected Outcome*: `PERMISSION_DENIED`

2. **U2: Self-Assumed System-Level Admin Privilege**
   - *Target Document*: `users/attacker-uid`
   - *Malicious Payload*: `{ "uid": "attacker-uid", "name": "Attacker", "email": "attacker@domain.com", "role": "admin", "createdAt": "request.time" }`
   - *Attacker identity*: `request.auth.uid = "attacker-uid"`
   - *Expected Outcome*: `PERMISSION_DENIED` (No role fields or custom keys outside user schema allowed)

3. **U3: User Metadata Over-size Denials**
   - *Target Document*: `users/attacker-uid`
   - *Malicious Payload*: `{ "uid": "attacker-uid", "name": "A" * 15000, "email": "attacker@domain.com", "createdAt": "request.time" }`
   - *Expected Outcome*: `PERMISSION_DENIED` (Name size limit strictly enforced)

### Booking/Appointment Trait Intercepts
4. **B1: Booking hijacking (Writing other's UID)**
   - *Target Document*: `bookings/book-xyz`
   - *Malicious Payload*: `{ "id": "book-xyz", "userId": "victim-uid", "userEmail": "victim@domain.com", "userName": "Victim Name", "doctorId": "doc-1", "doctorName": "Dr. Vivek Nair", "specialty": "Cardiology", "hospital": "Saathi Multispecialty Hospital", "date": "2026-06-03", "time": "10:00 AM", "status": "Confirmed", "fees": 800, "type": "Video Call", "createdAt": "request.time" }`
   - *Attacker identity*: `request.auth.uid = "attacker-uid"`
   - *Expected Outcome*: `PERMISSION_DENIED` (userId must equal request.auth.uid)

5. **B2: Booking status shortcutting (Pre-confirming state on creation)**
   - *Target Document*: `bookings/book-abc`
   - *Malicious Payload*: Same as B1, with `status: "Completed"` on creation or early-confirm. (Wait, checking that users cannot force confirmed status unless allowed, or strictly validating update transitions).
   - *Expected Outcome*: `PERMISSION_DENIED`

6. **B3: Sibling Identity Hijacking on Update**
   - *Target Document*: `bookings/book-victim` (whose real owner is `victim-uid`)
   - *Malicious Payload*: `{ "status": "Cancelled" }`
   - *Attacker identity*: `request.auth.uid = "attacker-uid"`
   - *Expected Outcome*: `PERMISSION_DENIED` (Cannot write to a booking document you do not own)

7. **B4: Date/Time backdating or tampering**
   - *Target Document*: `bookings/book-xyz`
   - *Malicious Payload*: Tampered `createdAt` string `"2020-01-01"` instead of server-verified `request.time`.
   - *Expected Outcome*: `PERMISSION_DENIED`

8. **B5: System Field Poisoning (Injecting unrequested fields)**
   - *Target Document*: `bookings/book-xyz`
   - *Malicious Payload*: `{ "id": "book-xyz", "userId": "attacker-uid", ..., "extraFieldSecretAuditInfo": "Malice" }`
   - *Expected Outcome*: `PERMISSION_DENIED` (Strict key verification size checks)

9. **B6: Path Variable Injection / Oversize Doc IDs**
   - *Target Document*: `bookings/book-xyz_VERY_LONG_STRING_ATTEMPTING_DENIAL_OF_WALLET...[1KB]`
   - *Expected Outcome*: `PERMISSION_DENIED` (isValidId verification enforces size limits < 128 chars and alphanumeric format)

10. **B7: Read-Scraping Blanket List Attack**
    - *Operation*: Listing all bookings without narrowing query filter to target user.
    - *Expected Outcome*: `PERMISSION_DENIED` (Allow list enforces `resource.data.userId == request.auth.uid`)

11. **B8: Temporal drift on update**
    - *Operation*: Modifying `createdAt` field on an and existing booking to a new value.
    - *Expected Outcome*: `PERMISSION_DENIED` (createdAt must remain immutable after creation)

12. **B9: Out-of-bounds fee rate injecting**
    - *Malicious Payload*: Modifying `fees` to negative values (e.g. `-1000`) or exceptionally massive values.
    - *Expected Outcome*: `PERMISSION_DENIED` (fees range validations enforced)

---

## 3. The Test Runner Reference
Included in our code pipeline, a suite of automated unit statements verify these invariants against the deployed emulator configurations to prevent configuration drift.

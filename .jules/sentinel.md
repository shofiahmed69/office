## 2025-05-23 - [Missing Account Lockout]
**Vulnerability:** The authentication service incremented a failure counter but never checked it to lock the account.
**Learning:** Incremental logic (counters) is useless without a threshold check. Code looked like it was handling it (updating DB) but was missing the enforcement step.
**Prevention:** When implementing rate limiting or lockout, write a test case that explicitly hits the limit.

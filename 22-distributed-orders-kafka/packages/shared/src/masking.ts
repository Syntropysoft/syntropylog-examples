/**
 * One masking rule set, declared once, enforced on every log of every service.
 * `enableDefaultRules` keeps the engine-managed defaults (email, card, ssn, phone,
 * password, token) — which carry an internal fast-path flag — and we ADD one custom
 * rule so the card CVV is fully redacted too.
 */
import { MaskingStrategy } from 'syntropylog';

export const maskingConfig = {
  enableDefaultRules: true,
  maskChar: '*',
  rules: [
    // Custom: redact CVV / security code (not covered by the defaults).
    { pattern: /cvv|cvc|securitycode/i, strategy: MaskingStrategy.PASSWORD },
  ],
};

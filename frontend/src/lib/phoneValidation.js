export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

const countryRules = [
  { names: ["United States", "US", "USA"], dialCode: "1", nationalMin: 10, nationalMax: 10 },
  { names: ["Canada", "CA"], dialCode: "1", nationalMin: 10, nationalMax: 10 },
  { names: ["United Arab Emirates", "UAE", "AE"], dialCode: "971", nationalMin: 9, nationalMax: 9 },
  { names: ["Saudi Arabia", "SA"], dialCode: "966", nationalMin: 9, nationalMax: 9 },
  { names: ["Qatar", "QA"], dialCode: "974", nationalMin: 8, nationalMax: 8 },
  { names: ["Kuwait", "KW"], dialCode: "965", nationalMin: 8, nationalMax: 8 },
  { names: ["Bahrain", "BH"], dialCode: "973", nationalMin: 8, nationalMax: 8 },
  { names: ["Oman", "OM"], dialCode: "968", nationalMin: 8, nationalMax: 8 },
  { names: ["India", "IN"], dialCode: "91", nationalMin: 10, nationalMax: 10 },
  { names: ["Pakistan", "PK"], dialCode: "92", nationalMin: 10, nationalMax: 10 },
  { names: ["United Kingdom", "UK", "GB"], dialCode: "44", nationalMin: 10, nationalMax: 10 },
  { names: ["Germany", "DE"], dialCode: "49", nationalMin: 5, nationalMax: 11 },
  { names: ["France", "FR"], dialCode: "33", nationalMin: 9, nationalMax: 9 },
  { names: ["Belgium", "BE"], dialCode: "32", nationalMin: 8, nationalMax: 9 },
  { names: ["South Korea", "KR"], dialCode: "82", nationalMin: 8, nationalMax: 10 },
  { names: ["Sweden", "SE"], dialCode: "46", nationalMin: 7, nationalMax: 10 },
  { names: ["Israel", "IL"], dialCode: "972", nationalMin: 8, nationalMax: 9 },
];

const normalizeCountry = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

const normalizedRules = countryRules.map((rule) => ({
  ...rule,
  normalizedNames: rule.names.map(normalizeCountry),
}));

export const phoneDigits = (value) =>
  String(value || "")
    .replace(/^00/, "+")
    .replace(/\D/g, "");

export const getPhoneRuleForCountry = (country) => {
  const normalized = normalizeCountry(country);
  if (!normalized) return null;
  return normalizedRules.find((rule) => rule.normalizedNames.includes(normalized)) || null;
};

export const getCountryNameFromDialCode = (dialCode) => {
  const digits = phoneDigits(dialCode);
  const rule = normalizedRules.find((item) => item.dialCode === digits);
  return rule?.names?.[0] || "";
};

const getRuleFromPhone = (digits) =>
  normalizedRules
    .slice()
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((rule) => digits.startsWith(rule.dialCode));

const validateLength = (digits, min, max, label) => {
  if (digits.length < min || digits.length > max) {
    return `${label} must be ${min === max ? min : `${min}-${max}`} digits`;
  }
  return "";
};

export const validatePhoneNumber = (value, country) => {
  const raw = String(value || "").trim();
  const digits = phoneDigits(raw);

  if (!digits) return "Phone number is required";
  if (digits.length < PHONE_MIN_DIGITS || digits.length > PHONE_MAX_DIGITS) {
    return `Phone number must be ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits`;
  }

  const countryRule = getPhoneRuleForCountry(country);
  if (countryRule) {
    const hasInternationalPrefix = raw.trim().startsWith("+") || raw.trim().startsWith("00");
    const nationalDigits = digits.startsWith(countryRule.dialCode)
      ? digits.slice(countryRule.dialCode.length)
      : digits;

    if (hasInternationalPrefix && !digits.startsWith(countryRule.dialCode)) {
      return `Phone country code must match ${countryRule.names[0]}`;
    }

    const detectedRule = getRuleFromPhone(digits);
    if (detectedRule && detectedRule.dialCode !== countryRule.dialCode && digits.length > countryRule.nationalMax) {
      return `Phone country code must match ${countryRule.names[0]}`;
    }

    return validateLength(nationalDigits, countryRule.nationalMin, countryRule.nationalMax, `${countryRule.names[0]} phone number`);
  }

  const detectedRule = getRuleFromPhone(digits);
  if (detectedRule && digits.length > detectedRule.nationalMax) {
    return validateLength(
      digits.slice(detectedRule.dialCode.length),
      detectedRule.nationalMin,
      detectedRule.nationalMax,
      `${detectedRule.names[0]} phone number`,
    );
  }

  return "";
};

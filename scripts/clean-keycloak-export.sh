#!/bin/bash

# Clean exported Keycloak realm configuration
# Usage: ./clean-keycloak-export.sh <input-file> [output-file]

INPUT_FILE="${1:-realm-export.json}"
OUTPUT_FILE="${2:-keycloak-config/portal-realm-clean.json}"

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found"
    echo "Usage: $0 <input-file> [output-file]"
    exit 1
fi

echo "Cleaning Keycloak export: $INPUT_FILE -> $OUTPUT_FILE"

jq 'del(
  .id, .containerId, .accessTokenLifespanForImplicitFlow,
  .accessTokenLifespanForWebApps, .accessTokenLifespan, .offlineSessionIdleTimeout,
  .accessTokenLifespanInSeconds, .ssoSessionIdleTimeout, .ssoSessionMaxLifespan,
  .ssoSessionIdleTimeoutRememberMe, .ssoSessionMaxLifespanRememberMe,
  .accessCodeLifespan, .accessCodeLifespanLogin, .accessCodeLifespanUserAction,
  .accessCodeLifespanMobile, .notBefore, .registrationAllowed,
  .registrationEmailAsUsername, .rememberMe, .verifyEmail, .resetPasswordFlow,
  .editUsernameAllowed, .bruteForceProtected, .permanentLockout, .maxFailureWaitSeconds,
  .minimumQuickLoginWaitSeconds, .waitIncrementSeconds, .quickLoginCheckMilliSeconds,
  .maxDeltaTimeSeconds, .failureFactor, .requiredCredentials, .otpPolicyType,
  .otpPolicyAlgorithm, .otpPolicyInitialCounter, .otpPolicyDigits, .otpPolicyLookAheadWindow,
  .otpPolicyPeriod, .otpSupportedApplications, .webAuthnPolicyRpEntityName,
  .webAuthnPolicyAttestationConveyancePreference, .webAuthnPolicyAuthenticatorAttachment,
  .webAuthnPolicyRequireResidentKey, .webAuthnPolicyUserVerificationRequirement,
  .webAuthnPolicyCreateTimeout, .webAuthnPolicyAssertionTimeout,
  .webAuthnPolicyRegistrationRecoveryEnabled, .webAuthnPolicyRegistrationRecoveryCodesQuantity,
  .webAuthnPolicyRegistrationTokenBindingRequired, .webAuthnPolicyRegistrationAttestationConveyancePreference,
  .webAuthnPolicyRegistrationAuthenticatorSelectionCriteria, .keys
) 
| walk(if type == "object" then del(.id) else . end)' < "$INPUT_FILE" > "$OUTPUT_FILE"


echo "✅ Minimal export saved to $OUTPUT_FILE"
echo "📝 Review the file and add environment variables where needed"

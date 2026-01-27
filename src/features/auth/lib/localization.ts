"use client";

import { useTranslations } from "next-intl";

/**
 * Hook that maps next-intl translations to Better Auth UI localization format
 * This converts our locale structure to Better Auth UI's expected format
 *
 * All Better Auth UI components will use these translated strings automatically
 * when this hook is used in the AuthUIProviderTanstack localization prop
 */
export function useBetterAuthUILocalization(): Record<string, string> {
  const t = useTranslations();
  return {
    // Authentication views
    SIGN_IN: t("auth.signIn"),
    SIGN_IN_DESCRIPTION: t("auth.signInDescription"),
    SIGN_UP: t("auth.signUp"),
    SIGN_UP_DESCRIPTION: t("auth.createAccount"),
    FORGOT_PASSWORD: t("auth.forgotPassword"),
    RESET_PASSWORD: t("auth.resetPassword"),
    TWO_FACTOR: t("auth.twoFactor"),
    TWO_FACTOR_DESCRIPTION: t("auth.completeTwoFactor"),
    MAGIC_LINK: t("auth.magicLink"),
    MAGIC_LINK_DESCRIPTION: t("auth.magicLinkDescription"),
    RECOVER_ACCOUNT: t("auth.recoverAccount"),
    RECOVER_ACCOUNT_DESCRIPTION: t("auth.recoverAccountDescription"),
    SIGN_OUT: t("auth.signOut"),
    SIGN_OUT_DESCRIPTION: t("auth.signOutDescription"),

    // Form fields
    EMAIL_PLACEHOLDER: t("auth.emailPlaceholder"),
    PASSWORD_PLACEHOLDER: t("auth.passwordPlaceholder"),
    CONFIRM_PASSWORD_PLACEHOLDER: t("auth.confirmPasswordPlaceholder"),
    USERNAME_PLACEHOLDER: t("auth.usernamePlaceholder"),
    NAME_PLACEHOLDER: t("auth.namePlaceholder"),

    // Buttons and actions
    CONTINUE: t("common.continue"),
    SUBMIT: t("common.submit"),
    CANCEL: t("common.cancel"),
    SAVE: t("common.save"),
    DELETE: t("common.delete"),
    EDIT: t("common.edit"),
    CLOSE: t("common.close"),
    BACK: t("common.back"),
    NEXT: t("common.next"),
    PREVIOUS: t("common.previous"),

    // Messages
    MAGIC_LINK_EMAIL: t("auth.magicLinkEmail"),
    FORGOT_PASSWORD_EMAIL: t("auth.forgotPasswordEmail"),
    RESET_PASSWORD_SUCCESS: t("auth.resetPasswordSuccess"),
    CHANGE_PASSWORD_SUCCESS: t("auth.changePasswordSuccess"),
    DELETE_ACCOUNT_SUCCESS: t("auth.deleteAccountSuccess"),

    // Account settings
    SETTINGS: t("account.settings"),
    ACCOUNT: t("account.account"),
    SECURITY: t("account.security"),
    PROFILE: t("account.profile"),

    // Two-factor authentication
    TWO_FACTOR_ENABLED: t("account.twoFactorEnabled"),
    TWO_FACTOR_DISABLED: t("account.twoFactorDisabled"),
    TWO_FACTOR_ENABLE_INSTRUCTIONS: t("account.twoFactorEnableInstructions"),
    TWO_FACTOR_DISABLE_INSTRUCTIONS: t("account.twoFactorDisableInstructions"),
    TWO_FACTOR_CARD_DESCRIPTION: t("account.twoFactorCardDescription"),
    TWO_FACTOR_ACTION: t("account.twoFactorAction"),
    TWO_FACTOR_TOTP_LABEL: t("account.twoFactorTotpLabel"),
    TWO_FACTOR_PROMPT: t("account.twoFactorPrompt"),
    SEND_VERIFICATION_CODE: t("account.sendVerificationCode"),

    // Sessions
    SESSIONS: t("account.sessions"),
    ACTIVE_SESSIONS: t("account.activeSessions"),
    TRUST_DEVICE: t("account.trustDevice"),

    // API Keys
    API_KEYS: t("account.apiKeys"),
    CREATE_API_KEY: t("account.createApiKey"),

    // Profile
    UPDATE_NAME: t("account.updateName"),
    UPDATE_EMAIL: t("account.updateEmail"),
    UPDATE_USERNAME: t("account.updateUsername"),
    UPDATE_AVATAR: t("account.updateAvatar"),
    CHANGE_PASSWORD: t("account.changePassword"),
    DELETE_ACCOUNT: t("account.deleteAccount"),

    // OAuth/Providers
    LINK_ACCOUNT: t("account.linkAccount"),
    UNLINK: t("account.unlink"),
    SWITCH_ACCOUNT: t("account.switchAccount"),

    // General
    UPDATED_SUCCESSFULLY: t("account.updatedSuccessfully"),
    OPTIONAL_BRACKETS: t("account.optionalBrackets"),
    LOADING: t("common.loading"),
    ERROR: t("common.error"),
    RETRY: t("common.retry"),

    // Passkeys
    PASSKEYS: t("account.passkeys"),
    CREATE_PASSKEY: t("account.createPasskey"),

    // Additional fields
    USERNAME: t("account.username"),
    USERNAME_DESCRIPTION: t("account.usernameDescription"),
    USERNAME_INSTRUCTIONS: t("account.usernameInstructions"),
    SIGN_IN_USERNAME_PLACEHOLDER: t("account.signInUsernamePlaceholder"),
    SET_PASSWORD_DESCRIPTION: t("account.setPasswordDescription"),
  };
}

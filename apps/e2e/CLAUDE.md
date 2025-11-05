
## End-to-End Testing with Playwright

### Page Object Pattern (Required)

Always use Page Objects for test organization and reusability:

```typescript
// Example: auth.po.ts
export class AuthPageObject {
  constructor(private readonly page: Page) {}

  async signIn(params: { email: string; password: string }) {
    await this.page.fill('input[name="email"]', params.email);
    await this.page.fill('input[name="password"]', params.password);
    await this.page.click('button[type="submit"]');
  }

  async signOut() {
    await this.page.click('[data-test="account-dropdown-trigger"]');
    await this.page.click('[data-test="account-dropdown-sign-out"]');
  }
}
```

### Reliability Patterns

**Use `toPass()` for flaky operations** - Always wrap unreliable operations:

```typescript
// ✅ CORRECT - Reliable email/OTP operations
await expect(async () => {
  const otpCode = await this.getOtpCodeFromEmail(email);
  expect(otpCode).not.toBeNull();
  await this.enterOtpCode(otpCode);
}).toPass();

// ✅ CORRECT - Network requests with validation
await expect(async () => {
  const response = await this.page.waitForResponse(resp =>
    resp.url().includes('auth/v1/user')
  );
  expect(response.status()).toBe(200);
}).toPass();

// ✅ CORRECT - Complex operations with custom intervals
await expect(async () => {
  await auth.submitMFAVerification(AuthPageObject.MFA_KEY);
}).toPass({
  intervals: [500, 2500, 5000, 7500, 10_000, 15_000, 20_000]
});
```

### Test Data Management

**Email Testing**: Use `createRandomEmail()` for unique test emails:
```typescript
createRandomEmail() {
  const value = Math.random() * 10000000000000;
  return `${value.toFixed(0)}@makerkit.dev`;
}
```

**User Bootstrapping**: Use `bootstrapUser()` for consistent test user creation:
```typescript
await auth.bootstrapUser({
  email: 'test@example.com',
  password: 'testingpassword',
  name: 'Test User'
});
```

This method creates a user with an API call.

To sign in:

```tsx
await auth.loginAsUser({
  email: 'test@example.com',
  password: 'testingpassword',
});
```

### Test Selectors

**Always use `data-test` attributes** for reliable element selection:
```typescript
// ✅ CORRECT - Use data-test attributes
await this.page.click('[data-test="submit-button"]');
await this.page.fill('[data-test="email-input"]', email);

// ✅ OR
await this.page.getByTestId('submit-button').click();

// ❌ AVOID - Fragile selectors
await this.page.click('.btn-primary');
await this.page.click('button:nth-child(2)');
```

### Test Organization

- **Feature-based folders**: `/tests/authentication/`
- **Page Objects**: `*.po.ts` files for reusable page interactions
- **Setup files**: `auth.setup.ts` for global test setup
- **Utility classes**: `/tests/utils/` for shared functionality
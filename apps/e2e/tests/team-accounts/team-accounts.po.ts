import { Page, expect } from '@playwright/test';

import { AuthPageObject } from '../authentication/auth.po';
import { OtpPo } from '../utils/otp.po';

export class TeamAccountsPageObject {
  private readonly page: Page;
  public auth: AuthPageObject;
  public otp: OtpPo;

  constructor(page: Page) {
    this.page = page;
    this.auth = new AuthPageObject(page);
    this.otp = new OtpPo(page);
  }

  async setup(params = this.createTeamName()) {
    const auth = new AuthPageObject(this.page);

    const email = auth.createRandomEmail();

    await auth.bootstrapUser({
      email,
      name: 'Test User',
    });

    await auth.loginAsUser({ email });

    await this.createTeam(params);

    return {
      email: email,
      teamName: params.teamName,
      slug: params.slug,
    };
  }

  getTeamFromSelector(teamName: string) {
    return this.page.locator(`[data-test="account-selector-team"]`, {
      hasText: teamName,
    });
  }

  getTeams() {
    return this.page.locator('[data-test="account-selector-team"]');
  }

  goToSettings() {
    return expect(async () => {
      await this.page
        .locator('a', {
          hasText: 'Settings',
        })
        .click();

      await this.page.waitForURL('**/home/*/settings');
    }).toPass();
  }

  goToMembers() {
    return expect(async () => {
      await this.page
        .locator('a', {
          hasText: 'Members',
        })
        .click();

      await this.page.waitForURL('**/home/*/members');
    }).toPass();
  }


  openAccountsSelector() {
    return expect(async () => {
      await this.page.click('[data-test="account-selector-trigger"]');

      return expect(
        this.page.locator('[data-test="account-selector-content"]'),
      ).toBeVisible();
    }).toPass();
  }

  async tryCreateTeam(teamName: string) {
    await this.page.locator('[data-test="create-team-form"] input').fill('');
    await this.page.waitForTimeout(200);

    await this.page
      .locator('[data-test="create-team-form"] input')
      .fill(teamName);

    return this.page.click('[data-test="create-team-form"] button:last-child');
  }

  async createTeam({ teamName, slug } = this.createTeamName()) {
    await this.openAccountsSelector();

    await this.page.click('[data-test="create-team-account-trigger"]');
    await this.page.fill('[data-test="create-team-form"] input', teamName);

    const click = this.page.click(
      '[data-test="create-team-form"] button:last-child',
    );

    const response = this.page.waitForURL(`/home/${slug}`);

    await Promise.all([click, response]);
  }

  async updateName(name: string, slug: string) {
    await expect(async () => {
      await this.page.fill(
        '[data-test="update-team-account-name-form"] input',
        name,
      );

      const click = this.page.click(
        '[data-test="update-team-account-name-form"] button',
      );

      // the slug should be updated to match the new team name
      const response = this.page.waitForURL(`**/home/${slug}/settings`);

      return Promise.all([click, response]);
    }).toPass();
  }

  async deleteAccount(email: string) {
    await expect(async () => {
      await this.page.click('[data-test="delete-team-trigger"]');

      await this.otp.completeOtpVerification(email);

      const click = this.page.click(
        '[data-test="delete-team-form-confirm-button"]',
      );

      const response = this.page.waitForURL('**/home');

      return Promise.all([click, response]);
    }).toPass();
  }

  async updateMemberRole(memberEmail: string, newRole: string) {
    await expect(async () => {
      // Find the member row and click the actions button
      const memberRow = this.page.getByRole('row', { name: memberEmail });
      await memberRow.getByRole('button').click();

      // Click the update role option in the dropdown menu
      await this.page.getByText('Update Role').click();

      // Select the new role
      await this.page.click('[data-test="role-selector-trigger"]');
      await this.page.click(`[data-test="role-option-${newRole}"]`);

      // Wait for the update to complete and page to reload
      const response = this.page.waitForResponse('**/members');

      return Promise.all([
        this.page.click('[data-test="confirm-update-member-role"]'),
        response,
      ]);
    }).toPass();
  }

  async transferOwnership(memberEmail: string, ownerEmail: string) {
    await expect(async () => {
      // Find the member row and click the actions button
      const memberRow = this.page.getByRole('row', { name: memberEmail });
      await memberRow.getByRole('button').click();

      // Click the transfer ownership option in the dropdown menu
      await this.page.getByText('Transfer Ownership').click();

      // Complete OTP verification
      await this.otp.completeOtpVerification(ownerEmail);

      // Wait for the transfer to complete and page to reload
      const response = this.page.waitForResponse('**/members');

      return Promise.all([
        this.page.click('[data-test="confirm-transfer-ownership-button"]'),
        response,
      ]);
    }).toPass();
  }

  createTeamName() {
    const random = (Math.random() * 100000000).toFixed(0);

    const teamName = `Team-Name-${random}`;
    const slug = `team-name-${random}`;

    return { teamName, slug };
  }
}

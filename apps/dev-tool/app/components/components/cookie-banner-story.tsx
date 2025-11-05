'use client';

import { useState } from 'react';

import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { CookieBanner, useCookieConsent } from '@portal/ui/cookie-banner';
import { Label } from '@portal/ui/label';
import { Switch } from '@portal/ui/switch';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface CookieBannerControls {
  showBanner: boolean;
  position: 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function CookieBannerStory() {
  const { controls, updateControl } = useStoryControls<CookieBannerControls>({
    showBanner: true,
    position: 'bottom-left',
  });

  const [demoConsent, setDemoConsent] = useState<
    'unknown' | 'accepted' | 'rejected'
  >('unknown');
  const cookieConsent = useCookieConsent();

  const generateCode = () => {
    return `import { CookieBanner, useCookieConsent } from '@portal/ui/cookie-banner';

function App() {
  const { status, accept, reject, clear } = useCookieConsent();

  return (
    <div>
      {/* Your app content */}
      <CookieBanner />
      
      {/* Optional: Check consent status */}
      {status === 'accepted' && (
        <script>
          // Load analytics or tracking scripts
        </script>
      )}
    </div>
  );
}`;
  };

  const DemoCookieBanner = () => {
    if (demoConsent !== 'unknown' || !controls.showBanner) {
      return null;
    }

    return (
      <div
        className={`bg-background animate-in fade-in zoom-in-95 slide-in-from-bottom-16 fixed z-50 w-full max-w-lg border p-6 shadow-2xl ${
          controls.position === 'bottom-left'
            ? 'bottom-4 left-4 rounded-lg'
            : controls.position === 'bottom-center'
              ? 'bottom-0 left-1/2 -translate-x-1/2 transform lg:bottom-4 lg:rounded-lg'
              : 'right-4 bottom-4 rounded-lg'
        }`}
      >
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-lg font-semibold">We use cookies</h3>
          </div>

          <div className="text-gray-500 dark:text-gray-400">
            <p className="text-sm">
              We use cookies to enhance your experience on our site, analyze
              site usage, and assist in our marketing efforts.
            </p>
          </div>

          <div className="flex justify-end space-x-2.5">
            <Button variant="ghost" onClick={() => setDemoConsent('rejected')}>
              Reject
            </Button>

            <Button autoFocus onClick={() => setDemoConsent('accepted')}>
              Accept
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => (
    <div className="bg-muted/20 relative h-64 overflow-hidden rounded-lg border">
      <div className="p-4">
        <h3 className="mb-2 font-semibold">Preview Area</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          This simulates how the cookie banner appears on your site.
        </p>

        <div className="space-y-2 text-sm">
          <div>
            <strong>Demo Status:</strong> {demoConsent}
          </div>
          <div>
            <strong>Real Status:</strong> {cookieConsent.status}
          </div>
        </div>

        <div className="mt-4 space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDemoConsent('unknown')}
          >
            Reset Demo Banner
          </Button>
          <Button size="sm" variant="outline" onClick={cookieConsent.clear}>
            Clear Real Consent
          </Button>
        </div>
      </div>

      <DemoCookieBanner />
    </div>
  );

  const renderControls = () => (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="showBanner">Show Banner</Label>
        <Switch
          id="showBanner"
          checked={controls.showBanner}
          onCheckedChange={(checked) => {
            updateControl('showBanner', checked);
            if (checked) {
              setDemoConsent('unknown');
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Position</Label>
        <div className="flex flex-col gap-2">
          {[
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-center', label: 'Bottom Center' },
            { value: 'bottom-right', label: 'Bottom Right' },
          ].map((option) => (
            <button
              key={option.value}
              className={`rounded border p-2 text-sm ${
                controls.position === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
              onClick={() => updateControl('position', option.value as any)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration with useCookieConsent Hook</CardTitle>
          <CardDescription>
            How to use the cookie consent hook in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-semibold">Current Consent Status</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      cookieConsent.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : cookieConsent.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {cookieConsent.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={cookieConsent.accept}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cookieConsent.reject}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cookieConsent.clear}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted/20 rounded-lg border p-4">
              <h4 className="mb-2 font-semibold">Conditional Content</h4>
              <p className="text-muted-foreground mb-2 text-sm">
                This content only shows when cookies are accepted:
              </p>
              {cookieConsent.status === 'accepted' ? (
                <div className="rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
                  🍪 Analytics and tracking enabled
                </div>
              ) : (
                <div className="rounded border border-gray-200 bg-gray-50 p-2 text-sm text-gray-600">
                  Analytics disabled - Accept cookies to enable tracking
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Different Consent States</CardTitle>
          <CardDescription>
            How the banner behaves in different states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <h4 className="mb-2 font-semibold">Unknown</h4>
                <p className="text-muted-foreground mb-2 text-xs">
                  First visit or cleared consent
                </p>
                <div className="text-2xl">❓</div>
                <p className="mt-2 text-xs">Banner shows</p>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <h4 className="mb-2 font-semibold">Accepted</h4>
                <p className="text-muted-foreground mb-2 text-xs">
                  User accepted cookies
                </p>
                <div className="text-2xl">✅</div>
                <p className="mt-2 text-xs">Banner hidden</p>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <h4 className="mb-2 font-semibold">Rejected</h4>
                <p className="text-muted-foreground mb-2 text-xs">
                  User rejected cookies
                </p>
                <div className="text-2xl">❌</div>
                <p className="mt-2 text-xs">Banner hidden</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>CookieBanner Components</CardTitle>
        <CardDescription>
          Complete API reference for CookieBanner and useCookieConsent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">CookieBanner</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A modal-style cookie consent banner that appears when consent
              status is unknown.
            </p>
            <div className="overflow-x-auto">
              <table className="border-border w-full border-collapse border">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Feature</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">Auto-positioning</td>
                    <td className="p-3">
                      Responsive positioning (bottom-left on desktop, full-width
                      on mobile)
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">Animation</td>
                    <td className="p-3">
                      Smooth entrance animation with fade and slide effects
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">Accessibility</td>
                    <td className="p-3">
                      Focus management and keyboard navigation
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">Persistence</td>
                    <td className="p-3">
                      Remembers user choice in localStorage
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold">
              useCookieConsent Hook
            </h4>
            <p className="text-muted-foreground mb-3 text-sm">
              Hook for managing cookie consent state throughout your
              application.
            </p>
            <div className="overflow-x-auto">
              <table className="border-border w-full border-collapse border">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Property</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">status</td>
                    <td className="p-3 font-mono text-sm">
                      'unknown' | 'accepted' | 'rejected'
                    </td>
                    <td className="p-3">Current consent status</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">accept</td>
                    <td className="p-3 font-mono text-sm">{'() => void'}</td>
                    <td className="p-3">Function to accept cookies</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">reject</td>
                    <td className="p-3 font-mono text-sm">{'() => void'}</td>
                    <td className="p-3">Function to reject cookies</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">clear</td>
                    <td className="p-3 font-mono text-sm">{'() => void'}</td>
                    <td className="p-3">Function to reset consent status</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsageGuidelines = () => (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guidelines</CardTitle>
          <CardDescription>Best practices for cookie consent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Implementation Best Practices
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Add CookieBanner to your root layout or App component</li>
              <li>
                • Check consent status before loading analytics/tracking scripts
              </li>
              <li>• Provide clear information about cookie usage</li>
              <li>• Respect user choice and don't show banner repeatedly</li>
              <li>• Allow users to change their preference later</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Common Mistakes
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Loading tracking scripts before consent</li>
              <li>• Not providing a way to change consent later</li>
              <li>• Hiding the reject option or making it hard to find</li>
              <li>• Not explaining what cookies are used for</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal Compliance</CardTitle>
          <CardDescription>GDPR and privacy considerations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">GDPR Requirements</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Consent must be freely given, specific, and informed</li>
              <li>• Users must be able to withdraw consent easily</li>
              <li>• Essential cookies don't require consent</li>
              <li>• Pre-ticked boxes are not valid consent</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Cookie Categories</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • <strong>Essential:</strong> Required for site functionality
              </li>
              <li>
                • <strong>Analytics:</strong> Usage statistics and performance
              </li>
              <li>
                • <strong>Marketing:</strong> Advertising and personalization
              </li>
              <li>
                • <strong>Functional:</strong> Enhanced features and preferences
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customization Options</CardTitle>
          <CardDescription>Adapting the banner to your needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Text Customization</h4>
            <p className="text-muted-foreground text-sm">
              Customize banner text through i18n keys: cookieBanner.title,
              cookieBanner.description, cookieBanner.accept,
              cookieBanner.reject.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Styling</h4>
            <p className="text-muted-foreground text-sm">
              The banner automatically adapts to your theme colors and spacing.
              Override CSS classes for custom styling if needed.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Advanced Features</h4>
            <p className="text-muted-foreground text-sm">
              For granular cookie control, extend the component to support
              different cookie categories with individual accept/reject options.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ComponentStoryLayout
      preview={renderPreview()}
      controls={renderControls()}
      generatedCode={generateCode()}
      examples={renderExamples()}
      apiReference={renderApiReference()}
      usageGuidelines={renderUsageGuidelines()}
    />
  );
}

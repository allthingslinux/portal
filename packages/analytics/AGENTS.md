# @portal/analytics Package

Analytics package providing a unified interface for tracking events, page views, and user identification across multiple analytics providers.

## Architecture

- **AnalyticsManager**: Central manager orchestrating multiple analytics providers
- **AnalyticsService**: Interface defining analytics operations (track, identify, pageView)
- **Provider System**: Pluggable providers (currently includes NullAnalyticsService)
- **Client/Server Split**: Separate entry points for client and server-side usage

## Usage

### Basic Import

```typescript
// Client-side
import { analytics } from '@portal/analytics';

// Server-side
import { analytics } from '@portal/analytics/server';
```

### Core Methods

```typescript
// Track events
await analytics.trackEvent('button_clicked', { 
  button_id: 'signup',
  page: 'homepage' 
});

// Track page views
await analytics.trackPageView('/dashboard');

// Identify users
await analytics.identify('user123', { 
  email: 'user@example.com',
  plan: 'premium' 
});
```

Page views and user identification are handled by the plugin by default.

## Creating Custom Providers

Implement the `AnalyticsService` interface:

```typescript
import { AnalyticsService } from '@portal/analytics';

class CustomAnalyticsService implements AnalyticsService {
  async initialize(): Promise<void> {
    // Initialize your analytics service
  }

  async trackEvent(name: string, properties?: Record<string, string | string[]>): Promise<void> {
    // Track event implementation
  }

  async trackPageView(path: string): Promise<void> {
    // Track page view implementation
  }

  async identify(userId: string, traits?: Record<string, string>): Promise<void> {
    // Identify user implementation
  }
}
```

## Default Behavior

- Uses `NullAnalyticsService` when no providers are active
- All methods return Promises that resolve to arrays of provider results
- Console debug logging when no active services or using null service
- Graceful error handling with console warnings for missing providers

## Server-Side Analytics

When using PostHog, you can track events server-side for better reliability and privacy:

```typescript
import { analytics } from '@portal/analytics/server';

// Server-side event tracking (e.g., in API routes)
export async function POST(request: Request) {
  // ... handle request
  
  // Track server-side events
  await analytics.trackEvent('api_call', {
    endpoint: '/api/users',
    method: 'POST',
    user_id: userId,
  });
  
  return Response.json({ success: true });
}

// Track user registration server-side
await analytics.identify(user.id, {
  email: user.email,
  created_at: user.created_at,
  plan: user.plan,
});
```
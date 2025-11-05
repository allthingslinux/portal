# Typescript

- Write clean, clear, well-designed, explicit Typescript
- Make sure types are validated strictly
- Use implicit type inference, unless impossible
- Consider using classes for server-side services, but export a function instead of the class

```tsx
// service.ts
class UserService {
  getUser(id: number) {
    // ... implementation ...
    return { id, name: 'Example User' };
  }
}

export function createUserService() {
  return new UserService();
}
```

- Follow the Single Responsibility Principle (SRP). Each module/function/class should have one reason to change.
- Favor composition over inheritance.
- Handle errors gracefully using try/catch and appropriate error types.
- Keep functions short and focused.
- Use descriptive names for variables, functions, and classes.
- Avoid unnecessary complexity.
- Avoid using `any` type as much as possible. If necessary, use `unknown`
- Use enums only when appropriate. Consider union types of string literals as an alternative.
- Be aware of performance implications of your code.

# React

## Core Principles

- **Component-Driven Development**: Build applications as a composition of isolated, reusable components
- **One-Way Data Flow**: Follow React's unidirectional data flow pattern
- **Single Responsibility**: Each component should have a clear, singular purpose
- **TypeScript First**: Use TypeScript for type safety and better developer experience
- **Internationalization (i18n) By Default**: All user-facing text should be translatable

## React Components

### Component Structure

- Always use functional components with TypeScript
- Name components using PascalCase (e.g., `UserProfile`)
- Use named exports for components, not default exports
- Split components by responsibility and avoid "god components"
- Name files to match their component name (e.g., `user-profile.tsx`)

### Props

- Always type props using TypeScript interfaces or type aliases
- Use discriminated unions for complex prop types with conditional rendering
- Destructure props at the start of component functions
- Use prop spreading cautiously and only when appropriate
- Provide default props for optional parameters when it makes sense

```typescript
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

function Button({ 
  variant, 
  size = 'md', 
  children, 
  disabled = false, 
  onClick 
}: ButtonProps) {
  // Component implementation
}
```

### State Management

- Keep state as local as possible
- Lift state up when multiple components need access
- Use Context sparingly and only for truly global state
- Prefer the "Container/Presenter" pattern when separating data and UI

```typescript
// Container component (manages data)
function UserProfileContainer() {
  const userData = useUserData();
  
  if (userData.isLoading) {
    return <LoadingSpinner />;
  }

  if (userData.error) {
    return <ErrorMessage error={userData.error} />;
  }
  
  return <UserProfilePresenter data={userData.data} />;
}

// Presenter component (renders UI)
function UserProfilePresenter({ data }: { data: UserData }) {
  return (
    <div>
      <h1>{data.name}</h1>
      {/* Rest of the UI */}
    </div>
  );
}
```

### Hooks

- Follow the Rules of Hooks (only call hooks at the top level, only call them from React functions)
- Create custom hooks for reusable logic
- Keep custom hooks focused on a single concern
- Name custom hooks with a 'use' prefix (e.g., `useUserProfile`)
- Extract complex effect logic into separate functions
- Always provide a complete dependencies array to `useEffect`

### Performance Optimization

- Apply `useMemo` for expensive calculations
- Use `useCallback` for functions passed as props to child components
- Split code using dynamic imports and `React.lazy()`

```typescript
const MemoizedComponent = React.memo(function Component(props: Props) {
  // Component implementation
});

// For expensive calculations
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// For callback functions passed as props
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Internationalization (i18n)

- Always use the `Trans` component for text rendering (no hardcoded strings)
- Ensure all i18n keys are available in locale files
- Use namespaces to organize translations logically
- Include interpolation variables in translation keys
- Test UI with different languages, especially those with longer text

```typescript
// Correct
<Trans i18nKey="user:profile.welcomeMessage" values={{ name: user.name }} />

// Incorrect
<p>Welcome, {user.name}!</p>
```

## Server Components

### Fundamentals

- Server Components render React server-side and never run on the client
- Use Server Components as the default choice, especially for data fetching
- No use of hooks, browser APIs, or event handlers in Server Components
- No use of `useState`, `useEffect`, or any other React hooks
- Server Components can render Client Components but not vice versa

### Data Fetching

- Fetch data directly using async/await in Server Components
- Use Suspense boundaries around data-fetching components
- Apply security checks before fetching sensitive data
- Never pass sensitive data (API keys, tokens) to Client Components
- Use React's `cache()` function for caching data requests

### Error Handling

- Implement error boundaries at appropriate levels
- Use the Next.js `error.tsx` file for route-level error handling
- Create fallback UI for when data fetching fails
- Log server errors appropriately without exposing details to clients

### Streaming and Suspense

- Use React Suspense for progressive loading experiences if specified
- Implement streaming rendering for large or complex pages
- Structure components to enable meaningful loading states
- Prioritize above-the-fold content when using streaming

## Client Components

### Fundamentals

- Add the `'use client'` directive at the top of files for Client Components
- Keep Client Components focused on interactivity and browser APIs
- Use hooks appropriately following the Rules of Hooks
- Implement controlled components for form elements
- Handle all browser events in Client Components

### Data Fetching

- Use React Query (TanStack Query) for data fetching in Client Components
- Create custom hooks for data fetching logic (e.g., `useUserData`)
- Always handle loading, success, and error states

### Form Handling

- Use libraries like React Hook Form for complex forms
- Implement proper validation with libraries like Zod
- Create reusable form components
- Handle form submissions with loading and error states
- Use controlled components for form inputs

### Error Handling

- Implement error boundaries to catch and handle component errors if using client components
- Always handle network request errors
- Provide user-friendly error messages
- Log errors appropriately
- Implement retry mechanisms where applicable

```typescript
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function UserProfileWithErrorHandling() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset application state here if needed
      }}
    >
      <UserProfile userId="123" />
    </ErrorBoundary>
  );
}
```


# Project Structure

```
apps/web/app/                          # Root directory (apps/web/app)
│
├── (marketing)/              # Marketing pages group
│   ├── _components/          # Shared components for marketing routes
│   │   ├── site-footer.tsx
│   │   ├── site-header.tsx
│   │   ├── site-navigation.tsx
│   │   └── site-page-header.tsx
│   │
│   ├── (legal)/              # Legal pages subgroup
│   │   ├── cookie-policy/
│   │   │   └── page.tsx
│   │   ├── privacy-policy/
│   │   │   └── page.tsx
│   │   └── terms-of-service/
│   │       └── page.tsx
│   │
│   ├── blog/                 # Blog section
│   │   ├── _components/      # Blog-specific components
│   │   │   ├── blog-pagination.tsx
│   │   │   ├── post-header.tsx
│   │   │   └── post-preview.tsx
│   │   ├── [slug]/           # Dynamic route for blog posts
│   │   │   └── page.tsx
│   │   └── page.tsx          # Blog listing page
│   │
│   ├── contact/              # Contact page
│   │   ├── _components/
│   │   │   └── contact-form.tsx
│   │   ├── _lib/             # Contact page utilities
│   │   │   ├── contact-email.schema.ts
│   │   │   └── server/
│   │   │       └── server-actions.ts
│   │   └── page.tsx
│   │
│   ├── docs/                 # Documentation pages
│   │   ├── _components/
│   │   ├── _lib/
│   │   │   ├── server/
│   │   │   │   └── docs.loader.ts
│   │   │   └── utils.ts
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── layout.tsx        # Layout specific to docs section
│   │   └── page.tsx
│   │
│   ├── faq/
│   │   └── page.tsx
│   │
│   ├── pricing/
│   │   └── page.tsx
│   │
│   ├── layout.tsx            # Layout for all marketing pages
│   ├── loading.tsx           # Loading state for marketing pages
│   └── page.tsx              # Home/landing page
│
├── (auth)/                   # Authentication pages group
│   ├── callback/             # Auth callback routes
│   │   ├── error/
│   │   │   └── page.tsx
│   │   └── route.ts          # API route handler for auth callback
│   │
│   ├── confirm/
│   │   └── route.ts
│   │
│   ├── password-reset/
│   │   └── page.tsx
│   │
│   ├── sign-in/
│   │   └── page.tsx
│   │
│   ├── sign-up/
│   │   └── page.tsx
│   │
│   ├── verify/
│   │   └── page.tsx
│   │
│   ├── layout.tsx            # Layout for auth pages
│   └── loading.tsx           # Loading state for auth pages
│
├── admin/                    # Admin section
│   ├── _components/
│   │   ├── admin-sidebar.tsx
│   │   └── mobile-navigation.tsx
│   │
│   ├── accounts/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
│
├── api/                      # API routes
│   ├── billing/
│   │   └── webhook/
│   │       └── route.ts
│   │
│   └── db/
│       └── webhook/
│           └── route.ts
│
├── home/                     # User dashboard area
│   ├── (user)/               # Personal user routes
│   │   ├── _components/      # User dashboard components
│   │   │   ├── home-account-selector.tsx
│   │   │   └── home-sidebar.tsx
│   │   │
│   │   ├── _lib/             # User dashboard utilities
│   │   │   └── server/
│   │   │       └── load-user-workspace.ts
│   │   │
│   │   ├── billing/          # Personal account billing
│   │   │   ├── _components/
│   │   │   ├── _lib/
│   │   │   │   ├── schema/
│   │   │   │   │   └── personal-account-checkout.schema.ts
│   │   │   │   └── server/
│   │   │   │       ├── personal-account-billing-page.loader.ts
│   │   │   │       ├── server-actions.ts
│   │   │   │       └── user-billing.service.ts
│   │   │   │
│   │   │   ├── error.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── return/
│   │   │       └── page.tsx
│   │   │
│   │   ├── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   │
│   ├── [account]/            # Team account routes (dynamic)
│   │   ├── _components/      # Team account components
│   │   │   ├── dashboard-demo.tsx
│   │   │   ├── team-account-accounts-selector.tsx
│   │   │   └── team-account-layout-sidebar.tsx
│   │   │
│   │   ├── _lib/             # Team account utilities
│   │   │   └── server/
│   │   │       ├── team-account-billing-page.loader.ts
│   │   │       └── team-account-workspace.loader.ts
│   │   │
│   │   ├── billing/          # Team billing section
│   │   │   ├── _components/
│   │   │   ├── _lib/
│   │   │   │   ├── schema/
│   │   │   │   │   └── team-billing.schema.ts
│   │   │   │   └── server/
│   │   │   │       ├── server-actions.ts
│   │   │   │       └── team-billing.service.ts
│   │   │   │
│   │   │   ├── error.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── return/
│   │   │       └── page.tsx
│   │   │
│   │   ├── members/          # Team members management
│   │   │   ├── _lib/
│   │   │   │   └── server/
│   │   │   │       └── members-page.loader.ts
│   │   │   └── page.tsx
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   │
│   └── loading.tsx
│
├── join/                     # Team join page
│   └── page.tsx
│
├── update-password/
│   └── page.tsx
│
├── error.tsx                 # Global error page
├── global-error.tsx          # Global error component
├── layout.tsx                # Root layout
├── not-found.tsx             # 404 page
├── robots.ts                 # Robots.txt config
├── sitemap.xml/              # Sitemap generation
│   └── route.ts
└── version/                  # Version info endpoint
    └── route.ts
```

## Key Organization Patterns

1. **Route Groups**
    - `(marketing)` - Groups all marketing/public pages
    - `(auth)` - Groups all authentication related pages
    - `(user)` - Groups all personal user dashboard pages

2. **Component Organization**
    - `_components/` - Route-specific components
    - Global components are in the root `/components` directory (not shown)

3. **Utilities & Data**
    - `_lib/` - Route-specific utilities, types, and helpers
    - `_lib/server/` - Server-side utilities including data loaders
    - `/lib/` - Global utilities (not shown)

4. **Data Fetching**
    - Use of React's `cache()` function for request deduplication

5. **Server Actions**
    - `server-actions.ts` - Server-side actions for mutating data
    - Follows 'use server' directive pattern

6. **Special Files**
    - `layout.tsx` - Define layouts for routes
    - `loading.tsx` - Loading UI for routes
    - `error.tsx` - Error handling for routes
    - `page.tsx` - Page component for routes
    - `route.ts` - API route handlers

7. **Dynamic Routes**
    - `[account]` -  Dynamic route for team accounts. The [account] property is the account slug in the table `public.accounts`.
    - `[slug]` - Dynamic route for blog posts and documentation

# Creating Pages

# Portal Page & Layout Guidelines

## Page Structure Overview

Portal uses Next.js App Router architecture with a clear separation of concerns for layouts and pages. The application's structure reflects the multi-tenant approach with specific routing patterns:

```
- app
  - home        # protected routes
    - (user)    # user workspace (personal account context)
    - [account] # team workspace (team account context)
  - (marketing) # marketing pages
  - auth        # auth pages
```

## Key Components

### Layouts

Layouts in Portal provide the structure for various parts of the application:

1. **Root Layout**: The base structure for the entire application
2. **Workspace Layouts**:
    - User Workspace Layout (`app/home/(user)/layout.tsx`): For personal account context
    - Team Workspace Layout (`app/home/[account]/layout.tsx`): For team account context

Layouts handle:
- Workspace context providers
- Navigation components
- Authentication requirements
- UI structure (sidebar vs header style)

### Pages

Pages represent the actual content for each route and follow a consistent pattern:

1. **Metadata Generation**: Using `generateMetadata()` for SEO and page titles
2. **Content Structure**:
    - Page headers with titles and descriptions
    - Page body containing the main content
3. **i18n Implementation**: Wrapped with `withI18n` HOC

## Creating a New Page

### 1. Define the Page Structure

Create a new file within the appropriate route folder:

```tsx
// app/home/(user)/my-feature/page.tsx
import { PageBody } from '@portal/ui/page';
import { Trans } from '@portal/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

// Import components from the _components folder if needed
import { MyFeatureHeader } from './_components/my-feature-header';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:myFeaturePage');

  return {
    title,
  };
};

function MyFeaturePage() {
  return (
    <>
      <MyFeatureHeader
        title={<Trans i18nKey={'common:routes.myFeature'} />}
        description={<Trans i18nKey={'common:myFeatureDescription'} />}
      />

      <PageBody>
        {/* Main page content */}
      </PageBody>
    </>
  );
}

export default withI18n(MyFeaturePage);
```

- Authentication is enforced already in the middleware
- Authorization is normally enforced by RLS at the database level
- In the rare case you use the Supabase Admin client, you must enforce both authentication and authorization manually

### 2. Create a Loading State

```tsx
// app/home/(user)/my-feature/loading.tsx
import { GlobalLoader } from '@portal/ui/global-loader';

export default GlobalLoader;
```

### 3. Create a Layout (if needed)

If the feature requires a specific layout, create a layout file:

```tsx
// app/home/(user)/my-feature/layout.tsx
import { use } from 'react';

import { UserWorkspaceContextProvider } from '@portal/accounts/components';
import { Page, PageNavigation } from '@portal/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from '../_lib/server/load-user-workspace';

// Import components from the _components folder
import { MyFeatureNavigation } from './_components/my-feature-navigation';

function MyFeatureLayout({ children }: React.PropsWithChildren) {
  const workspace = use(loadUserWorkspace());

  return (
    <UserWorkspaceContextProvider value={workspace}>
      <Page>
        <PageNavigation>
          <MyFeatureNavigation workspace={workspace} />
        </PageNavigation>

        {children}
      </Page>
    </UserWorkspaceContextProvider>
  );
}

export default withI18n(MyFeatureLayout);
```

## Layout Patterns

### 1. User Workspace Layout

For pages in the personal account context, use the user workspace layout pattern:

```tsx
import { use } from 'react';

import { UserWorkspaceContextProvider } from '@portal/accounts/components';
import { Page } from '@portal/ui/page';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from './_lib/server/load-user-workspace';

function MyLayout({ children }: React.PropsWithChildren) {
  const workspace = use(loadUserWorkspace());

  return (
    <UserWorkspaceContextProvider value={workspace}>
      <Page>
        {/* Navigation components */}
        {children}
      </Page>
    </UserWorkspaceContextProvider>
  );
}

export default withI18n(MyLayout);
```

### 2. Team Workspace Layout

For pages in the team account context, use the team workspace layout pattern:

```tsx
import { use } from 'react';

import { TeamAccountWorkspaceContextProvider } from '@portal/team-accounts/components';
import { Page } from '@portal/ui/page';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadTeamWorkspace } from './_lib/server/load-team-workspace';

function TeamLayout({ children, params }: LayoutParams) {
  const workspace = use(loadTeamWorkspace(params.account));

  return (
    <TeamAccountWorkspaceContextProvider value={workspace}>
      <Page>
        {/* Navigation components */}
        {children}
      </Page>
    </TeamAccountWorkspaceContextProvider>
  );
}

export default withI18n(TeamLayout);
```

## UI Components Structure

### Page Components

Break down pages into reusable components:

1. **Page Headers**: Create header components for consistent titling:
   ```tsx
   // _components/my-feature-header.tsx
   import { PageHeader } from '@portal/ui/page-header';

   export function MyFeatureHeader({
     title,
     description
   }: {
     title: React.ReactNode,
     description: React.ReactNode
   }) {
     return (
       <PageHeader
         title={title}
         description={description}
       />
     );
   }
   ```

2. **Feature Components**: Create components for feature-specific functionality:
   ```tsx
   // _components/my-feature-component.tsx
   'use client';

   import { useUserWorkspace } from '@portal/accounts/hooks/use-user-workspace';

   export function MyFeatureComponent() {
     const { user } = useUserWorkspace();

     return (
       <div>
         {/* Component content */}
       </div>
     );
   }
   ```

### Navigation Components

Create navigation components to handle sidebar or header navigation:

```tsx
// _components/my-feature-navigation.tsx
'use client';

import { NavigationMenu } from '@portal/ui/navigation-menu';

export function MyFeatureNavigation({
  workspace
}: {
  workspace: UserWorkspace
}) {
  return (
    <NavigationMenu>
      {/* Navigation items */}
    </NavigationMenu>
  );
}
```

## Layout Styles

Portal supports different layout styles that can be toggled by the user:

1. **Sidebar Layout**: A vertical sidebar navigation
2. **Header Layout**: A horizontal header navigation

The layout style is stored in cookies and can be accessed server-side:

```tsx
async function getLayoutState() {
  const cookieStore = await cookies();
  const layoutStyleCookie = cookieStore.get('layout-style');

  return {
    style: layoutStyleCookie?.value ?? defaultStyle,
    // Other layout state properties
  };
}
```

## Best Practices

1. **Server vs. Client Components**:
    - Use Server Components for data fetching and initial rendering
    - Use Client Components ('use client') for interactive elements

2. **Data Loading**:
    - Load workspace data in layouts using server functions
    - Pass data down to components that need it
    - Use React Query for client-side data fetching

3. **Component Organization**:
    - Place feature-specific components in a `_components` folder
    - Place feature-specific server utilities in a `_lib/server` folder
    - Place feature-specific client utilities in a `_lib/client` folder

4. **i18n Support**:
    - Always use `withI18n` HOC for pages and layouts
    - Use `<Trans>` component for translated text
    - Define translation keys in the appropriate namespace in `apps/web/public/locales/<locale>/<namespace>.json`

5. **Metadata**:
    - Always include `generateMetadata` for SEO and UX
    - Use translations for page titles and descriptions

6. **Loading States**:
    - Always provide a loading state for each route
    - Use the `GlobalLoader` or custom loading components

7. **Error Handling**:
    - Implement error.tsx files for route error boundaries
    - Handle data fetching errors gracefully


# UI Components

- Reusable UI components are defined in the "packages/ui" package named "@portal/ui".
- By exporting the component from the "exports" field, we can import it using the "@portal/ui/{component-name}" format.

## Styling
- Styling is done using Tailwind CSS. We use the "cn" function from the "@portal/ui/utils" package to generate class names.
- Avoid fixes classes such as "bg-gray-500". Instead, use Shadcn classes such as "bg-background", "text-secondary-foreground", "text-muted-foreground", etc.

Portal leverages two sets of UI components:
1. **Shadcn UI Components**: Base components from the Shadcn UI library
2. **Portal-specific Components**: Custom components built on top of Shadcn UI

## Importing Components

```tsx
// Import Shadcn UI components
import { Button } from '@portal/ui/button';
import { Card } from '@portal/ui/card';
import { toast } from '@portal/ui/sonner';

// Import Portal-specific components
import { If } from '@portal/ui/if';
import { Trans } from '@portal/ui/trans';
import { ProfileAvatar } from '@portal/ui/profile-avatar';
```

## Core Shadcn UI Components

| Component | Description | Import Path |
|-----------|-------------|-------------|
| `Accordion` | Expandable/collapsible content sections | `@portal/ui/accordion` [accordion.tsx](mdc:packages/ui/src/shadcn/accordion.tsx) |
| `AlertDialog` | Modal dialog for important actions | `@portal/ui/alert-dialog` [alert-dialog.tsx](mdc:packages/ui/src/shadcn/alert-dialog.tsx) |
| `Alert` | Status/notification messages | `@portal/ui/alert` [alert.tsx](mdc:packages/ui/src/shadcn/alert.tsx) |
| `Avatar` | User profile images with fallback | `@portal/ui/avatar` [avatar.tsx](mdc:packages/ui/src/shadcn/avatar.tsx) |
| `Badge` | Small status indicators | `@portal/ui/badge` [badge.tsx](mdc:packages/ui/src/shadcn/badge.tsx) |
| `Breadcrumb` | Navigation path indicators | `@portal/ui/breadcrumb` [breadcrumb.tsx](mdc:packages/ui/src/shadcn/breadcrumb.tsx) |
| `Button` | Clickable action elements | `@portal/ui/button` [button.tsx](mdc:packages/ui/src/shadcn/button.tsx) |
| `Calendar` | Date picker and date display | `@portal/ui/calendar` [calendar.tsx](mdc:packages/ui/src/shadcn/calendar.tsx) |
| `Card` | Container for grouped content | `@portal/ui/card` [card.tsx](mdc:packages/ui/src/shadcn/card.tsx) |
| `Checkbox` | Selection input | `@portal/ui/checkbox` [checkbox.tsx](mdc:packages/ui/src/shadcn/checkbox.tsx) |
| `Command` | Command palette interface | `@portal/ui/command` [command.tsx](mdc:packages/ui/src/shadcn/command.tsx) |
| `DataTable` | Table | `@portal/ui/data-table` [data-table.tsx](mdc:packages/ui/src/shadcn/data-table.tsx) |
| `Dialog` | Modal window for focused interactions | `@portal/ui/dialog` [dialog.tsx](mdc:packages/ui/src/shadcn/dialog.tsx) |
| `DropdownMenu` | Menu triggered by a button | `@portal/ui/dropdown-menu` [dropdown-menu.tsx](mdc:packages/ui/src/shadcn/dropdown-menu.tsx) |
| `Form` | Form components with validation | `@portal/ui/form` [form.tsx](mdc:packages/ui/src/shadcn/form.tsx) |
| `Input` | Text input field | `@portal/ui/input` [input.tsx](mdc:packages/ui/src/shadcn/input.tsx) |
| `Input OTP` | OTP Text input field | `@portal/ui/input-otp` [input-otp.tsx](mdc:packages/ui/src/shadcn/input-otp.tsx) |
| `Label` | Text label for form elements | `@portal/ui/label` [label.tsx](mdc:packages/ui/src/shadcn/label.tsx) |
| `NavigationMenu` | Hierarchical navigation component | `@portal/ui/navigation-menu` [navigation-menu.tsx](mdc:packages/ui/src/shadcn/navigation-menu.tsx) |
| `Popover` | Floating content triggered by interaction | `@portal/ui/popover` [popover.tsx](mdc:packages/ui/src/shadcn/popover.tsx) |
| `RadioGroup` | Radio button selection group | `@portal/ui/radio-group` [radio-group.tsx](mdc:packages/ui/src/shadcn/radio-group.tsx) |
| `ScrollArea` | Customizable scrollable area | `@portal/ui/scroll-area` [scroll-area.tsx](mdc:packages/ui/src/shadcn/scroll-area.tsx) |
| `Select` | Dropdown selection menu | `@portal/ui/select` [select.tsx](mdc:packages/ui/src/shadcn/select.tsx) |
| `Separator` | Visual divider between content | `@portal/ui/separator` [separator.tsx](mdc:packages/ui/src/shadcn/separator.tsx) |
| `Sheet` | Sliding panel from screen edge | `@portal/ui/sheet` [sheet.tsx](mdc:packages/ui/src/shadcn/sheet.tsx) |
| `Sidebar` | Advanced sidebar navigation | `@portal/ui/shadcn-sidebar` [sidebar.tsx](mdc:packages/ui/src/shadcn/sidebar.tsx) |
| `Skeleton` | Loading placeholder | `@portal/ui/skeleton` [skeleton.tsx](mdc:packages/ui/src/shadcn/skeleton.tsx) |
| `Switch` | Toggle control | `@portal/ui/switch` [switch.tsx](mdc:packages/ui/src/shadcn/switch.tsx) |
| `Toast` | Toaster | `@portal/ui/sonner` [sonner.tsx](mdc:packages/ui/src/shadcn/sonner.tsx) |
| `Tabs` | Tab-based navigation | `@portal/ui/tabs` [tabs.tsx](mdc:packages/ui/src/shadcn/tabs.tsx) |
| `Textarea` | Multi-line text input | `@portal/ui/textarea` [textarea.tsx](mdc:packages/ui/src/shadcn/textarea.tsx) |
| `Tooltip` | Contextual information on hover | `@portal/ui/tooltip` [tooltip.tsx](mdc:packages/ui/src/shadcn/tooltip.tsx) |

## Portal-specific Components

| Component | Description | Import Path |
|-----------|-------------|-------------|
| `If` | Conditional rendering component | `@portal/ui/if` [if.tsx](mdc:packages/ui/src/makerkit/if.tsx) |
| `Trans` | Internationalization text component | `@portal/ui/trans` [trans.tsx](mdc:packages/ui/src/makerkit/trans.tsx) |
| `Page` | Page layout with navigation | `@portal/ui/page` [page.tsx](mdc:packages/ui/src/makerkit/page.tsx) |
| `GlobalLoader` | Full-page loading indicator | `@portal/ui/global-loader` [global-loader.tsx](mdc:packages/ui/src/makerkit/global-loader.tsx) |
| `ImageUploader` | Image upload component | `@portal/ui/image-uploader` [image-uploader.tsx](mdc:packages/ui/src/makerkit/image-uploader.tsx) |
| `ProfileAvatar` | User avatar with fallback | `@portal/ui/profile-avatar` [profile-avatar.tsx](mdc:packages/ui/src/makerkit/profile-avatar.tsx) |
| `DataTable` (Enhanced) | Extended data table with pagination | `@portal/ui/enhanced-data-table` [data-table.tsx](mdc:packages/ui/src/makerkit/data-table.tsx) |
| `Stepper` | Multi-step process indicator | `@portal/ui/stepper` [stepper.tsx](mdc:packages/ui/src/makerkit/stepper.tsx) |
| `CookieBanner` | GDPR-compliant cookie notice | `@portal/ui/cookie-banner` [cookie-banner.tsx](mdc:packages/ui/src/makerkit/cookie-banner.tsx) |
| `CardButton` | Card-styled button | `@portal/ui/card-button` [card-button.tsx](mdc:packages/ui/src/makerkit/card-button.tsx) |
| `MultiStepForm` | Form with multiple steps | `@portal/ui/multi-step-form` [multi-step-form.tsx](mdc:packages/ui/src/makerkit/multi-step-form.tsx) |
| `EmptyState` | Empty data placeholder | `@portal/ui/empty-state` [empty-state.tsx](mdc:packages/ui/src/makerkit/empty-state.tsx) |
| `AppBreadcrumbs` | Application path breadcrumbs | `@portal/ui/app-breadcrumbs` [app-breadcrumbs.tsx](mdc:packages/ui/src/makerkit/app-breadcrumbs.tsx) |

## Marketing Components

Import all marketing components with:
```tsx
import {
  Hero,
  HeroTitle,
  GradientText,
  // etc.
} from '@portal/ui/marketing';
```

Key marketing components:
- `Hero` - Hero sections [hero.tsx](mdc:packages/ui/src/makerkit/marketing/hero.tsx)
- `SecondaryHero` [secondary-hero.tsx](mdc:packages/ui/src/makerkit/marketing/secondary-hero.tsx)
- `FeatureCard`, `FeatureGrid` - Feature showcases [feature-card.tsx](mdc:packages/ui/src/makerkit/marketing/feature-card.tsx)
- `Footer` - Page Footer [footer.tsx](mdc:packages/ui/src/makerkit/marketing/footer.tsx)
- `Header` - Page Header [header.tsx](mdc:packages/ui/src/makerkit/marketing/header.tsx)
- `NewsletterSignup` - Email collection [newsletter-signup-container.tsx](mdc:packages/ui/src/makerkit/marketing/newsletter-signup-container.tsx)
- `ComingSoon` - Coming soon page template [coming-soon.tsx](mdc:packages/ui/src/makerkit/marketing/coming-soon.tsx)


# Forms

- Use React Hook Form for form validation and submission.
- Use Zod for form validation.
- Use the `zodResolver` function to resolve the Zod schema to the form.
- Use Server Actions [server-actions.mdc](mdc:.cursor/rules/server-actions.mdc) for server-side code handling
- Use Sonner for writing toasters for UI feedback

Follow the example below to create all forms:

## Define the schema

Zod schemas should be defined in the `schema` folder and exported, so we can reuse them across a Server Action and the client-side form:

```tsx
// _lib/schema/create-note.schema.ts
import { z } from 'zod';

export const CreateNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});
```

## Create the Server Action

Server Actions [server-actions.mdc](mdc:.cursor/rules/server-actions.mdc) can help us create endpoints for our forms.

```tsx
'use server';

import { z } from 'zod';
import { enhanceAction } from '@portal/next/actions';
import { CreateNoteSchema } from '../schema/create-note.schema';

export const createNoteAction = enhanceAction(
  async function (data, user) {
    // 1. "data" has been validated against the Zod schema, and it's safe to use
    // 2. "user" is the authenticated user

    // ... your code here
    return {
      success: true,
    };
  },
  {
    auth: true,
    schema: CreateNoteSchema,
  },
);
```

## Create the Form Component

Then create a client component to handle the form submission:

```tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Textarea } from '@portal/ui/textarea';
import { Input } from '@portal/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@portal/ui/form';
import { toast } from '@portal/ui/sonner';
import { useTranslation } from 'react-i18next';

import { CreateNoteSchema } from '../_lib/schema/create-note.schema';

export function CreateNoteForm() {
  const [pending, startTransition] = useTransition();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = (data) => {
    startTransition(async () => {
      await toast.promise(createNoteAction(data), {
        loading: t('notes:creatingNote`),
        success: t('notes:createNoteSuccess`),
        error: t('notes:createNoteError`)
      })
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Form {...form}>
        <FormField name={'title'} render={({ field }) => (
          <FormItem>
            <FormLabel>
              <span className={'text-sm font-medium'}>Title</span>
            </FormLabel>

            <FormControl>
              <Input
                type={'text'}
                className={'w-full'}
                placeholder={'Title'}
                {...field}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )} />

        <FormField name={'content'} render={({ field }) => (
          <FormItem>
            <FormLabel>
              <span className={'text-sm font-medium'}>Content</span>
            </FormLabel>

            <FormControl>
              <Textarea
                className={'w-full'}
                placeholder={'Content'}
                {...field}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )} />

        <button disabled={pending} type={'submit'} className={'w-full'}>
          Submit
        </button>
      </Form>
    </form>
  );
}
```

Always use `@portal/ui` for writing the UI of the form.


# Data Fetching

## General Data Flow
- In a Server Component context, please use the Supabase Client directly for data fetching
- In a Client Component context, please use the `useQuery` hook from the "@tanstack/react-query" package

Data Flow works in the following way:

1. Server Component uses the Supabase Client to fetch data.
2. Data is rendered in Server Components or passed down to Client Components when absolutely necessary to use a client component (e.g. when using React Hooks or any interaction with the DOM).

```tsx
import { getSupabaseServerClient } from '@portal/supabase/server-client';

async function ServerComponent() {
  const client = getSupabaseServerClient();
  const { data, error } = await client.from('notes').select('*');

  // use data
}
```

or pass down the data to a Client Component:

```tsx
import { getSupabaseServerClient } from '@portal/supabase/server-client';

export default function ServerComponent() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('notes').select('*');

  if (error) {
    return <SomeErrorComponent error={error} />;
  }

  return <SomeClientComponent data={data} />;
}
```

## Supabase Clients
- In a Server Component context, use the `getSupabaseServerClient` function from the "@portal/supabase/server-client" package [server-client.ts](mdc:packages/supabase/src/clients/server-client.ts)
- In a Client Component context, use the `useSupabase` hook from the "@portal/supabase/hooks/use-supabase" package.

### Admin Actions

Only in rare cases suggest using the Admin client `getSupabaseServerAdminClient` when needing to bypass RLS from the package `@portal/supabase/server-admin-client` [server-admin-client.ts](mdc:packages/supabase/src/clients/server-admin-client.ts)

## React Query

When using `useQuery`, make sure to define the data fetching hook. Create two components: one that fetches the data and one that displays the data. For example a good usage is [roles-data-provider.tsx](mdc:packages/features/team-accounts/src/components/members/roles-data-provider.tsx) as shown in [update-member-role-dialog.tsx](mdc:packages/features/team-accounts/src/components/members/update-member-role-dialog.tsx)

## Error Handling

- Logging using the `@portal/shared/logger` package [logger.ts](mdc:packages/shared/src/logger/logger.ts)
- Don't swallow errors, always handle them appropriately
- Handle promises and async/await gracefully
- Consider the unhappy path and handle errors appropriately
- Context without sensitive data

```tsx
'use server';

import { getLogger } from '@portal/shared/logger';

export async function myServerAction() {
  const logger = await getLogger();

  logger.info('Request started...');

  try {
    // your code here
    await someAsyncFunction();

    logger.info('Request succeeded...');
  } catch (error) {
    logger.error('Request failed...');

    // handle error
  }

  return {
    success: true,
  };
}
```

# Database Rules

## Database Architecture
- Supabase uses Postgres
- We strive to create a safe, robust, performant schema
- Accounts are the general concept of a user account, defined by the having the same ID as Supabase Auth's users (personal). They can be a team account or a personal account.
- Generally speaking, other tables will be used to store data related to the account. For example, a table `notes` would have a foreign key `account_id` to link it to an account.

## Schemas
- The DB schemas are available at `apps/web/supabase/schemas`
- To edit the DB schema, we can either change the schema files, or created new ones
- To create a new schema, create a file at `apps/web/supabase/schemas/<number>-<name>.sql`

## Migrations
- After creating a schema, we can create a migration
- Use the command `pnpm --filter web supabase:db:diff` for creating migrations from schemas
- After generating a migration, reset the database for applying the changes using the command `pnpm --filter web supabase:reset`

## Security & RLS
- Using RLS, we must ensure that only the account owner can access the data. Always write safe RLS policies and ensure that the policies are enforced.
- Unless specified, always enable RLS when creating a table. Propose the required RLS policies ensuring the safety of the data.
- Always consider any required constraints and triggers are in place for data consistency
- Always consider the compromises you need to make and explain them so I can make an educated decision. Follow up with the considerations make and explain them.
- Always consider the security of the data and explain the security implications of the data.
- Always use Postgres schemas explicitly (e.g., `public.accounts`)
- Consider the required compromises between simplicity, functionality and developer experience. However, never compromise on security, which is paramount and fundamental.
- Use existing helper functions for access control instead of making your own queries, unless unavailable

## Schema Overview

Portal uses a Supabase Postgres database with a well-defined schema focused on multi-tenancy through the concepts of accounts (both personal and team) and robust permission systems.

### Database Schema

1. Enums [01-enums.sql](mdc:apps/web/supabase/schemas/01-enums.sql)
2. Config [02-config.sql](mdc:apps/web/supabase/schemas/02-config.sql)
3. Accounts [03-accounts.sql](mdc:apps/web/supabase/schemas/03-accounts.sql)
4. Roles [04-roles.sql](mdc:apps/web/supabase/schemas/04-roles.sql)
5. Memberships [05-memberships.sql](mdc:apps/web/supabase/schemas/05-memberships.sql)
6. Roles Permissions [06-roles-permissions.sql](mdc:apps/web/supabase/schemas/06-roles-permissions.sql)
7. Invitations [07-invitations.sql](mdc:apps/web/supabase/schemas/07-invitations.sql)
8. Billing Customers [08-billing-customers.sql](mdc:apps/web/supabase/schemas/08-billing-customers.sql)
9. Subscriptions [09-subscriptions.sql](mdc:apps/web/supabase/schemas/09-subscriptions.sql)
10. Orders [10-orders.sql](mdc:apps/web/supabase/schemas/10-orders.sql)
11. Notifications [11-notifications.sql](mdc:apps/web/supabase/schemas/11-notifications.sql)
12. One Time Tokens [12-one-time-tokens.sql](mdc:apps/web/supabase/schemas/12-one-time-tokens.sql)
13. Multi Factor Auth [13-mfa.sql](mdc:apps/web/supabase/schemas/13-mfa.sql)
14. Super Admin [14-super-admin.sql](mdc:apps/web/supabase/schemas/14-super-admin.sql)
15. Account Views [15-account-views.sql](mdc:apps/web/supabase/schemas/15-account-views.sql)
16. Storage [16-storage.sql](mdc:apps/web/supabase/schemas/16-storage.sql)

## Database Best Practices

### Inferring Database types

Fetch auto-generated data types using the `@portal/supabase/database` import. Do not write types manually if the shape is the same as the one from the database row.

```tsx
import { Tables } from '@portal/supabase/database';

// public.accounts
type Account = Tables<'accounts'>;

// public.subscriptions
type Subscription = Tables<'subscriptions'>;

// public.notifications
type Notification = Tables<'notifications'>;

// ...
```

### Security

- **Always enable RLS** on new tables unless explicitly instructed otherwise
- **Create proper RLS policies** for all CRUD operations following existing patterns
- **Always associate data with accounts** using a foreign key to ensure proper access control
- **Use explicit schema references** (`public.table_name` not just `table_name`)
- **Private schema**: Place internal functions in the `kit` schema
- **Search Path**: Always set search path to '' when defining functions
- **Security Definer**: Do not use `security definer` functions unless stricly required

### Data Access Patterns

- Use `public.has_role_on_account(account_id, role?)` to check membership
- Use `public.has_permission(user_id, account_id, permission)` for permission checks
- Use `public.is_account_owner(account_id)` to identify account ownership

### SQL Coding Style

- Use explicit transactions for multi-step operations
- Follow existing naming conventions:
    - Tables: snake_case, plural nouns (`accounts`, `subscriptions`)
    - Functions: snake_case, verb phrases (`create_team_account`, `verify_nonce`)
    - Triggers: descriptive action names (`set_slug_from_account_name`)
- Document functions and complex SQL with comments
- Use parameterized queries to prevent SQL injection

### Common Patterns

- **Account Lookup**: Typically by `id` (UUID) or `slug` (for team accounts)
- **Permission Check**: Always verify proper permissions before mutations
- **Timestamp Automation**: Use the `trigger_set_timestamps()` function
- **User Tracking**: Use the `trigger_set_user_tracking()` function
- **Configuration**: Use `is_set(field_name)` to check enabled features

## Best Practices for Database Code

### 1. RLS Policy Management

#### Always Enable RLS

Always enable RLS for your tables unless you have a specific reason not to.
  ```sql
  ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
  ```

#### Use Helper Functions to validate permissions and access control
Use the existing structure for policies:
  ```sql
  -- SELECT policy
  CREATE POLICY "my_table_read" ON public.my_table FOR SELECT
    TO authenticated USING (
      account_id = (select auth.uid()) OR
      public.has_role_on_account(account_id)
    );

  -- INSERT/UPDATE/DELETE policies follow similar patterns
  ```

When using RLS at team-account level, use `public.has_role_on_account(account_id)` for a generic check to understand if a user is part of a team.

When using RLS at user-account level, use `account_id = (select auth.uid())`.

When an entity can belong to both, use both.

When requiring a specific role, use the role parameter `public.has_role_on_account(account_id, 'owner')`

### 2. Account Association

- **Associate Data with Accounts**: Always link data to accounts using a foreign key:
  ```sql
  CREATE TABLE if not exists public.my_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    /* other fields */
  );
  ```

### 3. Permission System

- **Use the Permission System**: Leverage the built-in permission system for access control:
  ```sql
  -- Check if a user has a specific permission
  SELECT public.has_permission(
    auth.uid(),
    account_id,
    'my.permission'::public.app_permissions
  );
  ```

### 4. Schema Organization

- **Use Schemas Explicitly**: Always use schema prefixes explicitly:
  ```sql
  -- Good
  SELECT * FROM public.accounts;

  -- Avoid
  SELECT * FROM accounts;
  ```

- **Put Internal Functions in 'kit' Schema**: Use the 'kit' schema for internal helper functions
  ```sql
  CREATE OR REPLACE FUNCTION kit.my_helper_function()
  RETURNS void AS $$
  -- function body
  $$ LANGUAGE plpgsql;
  ```

### 5. Types and Constraints

- **Use Enums for Constrained Values**: Create and use enum types for values with a fixed set:
  ```sql
  CREATE TYPE public.my_status AS ENUM('active', 'inactive', 'pending');

  CREATE TABLE if not exists public.my_table (
    status public.my_status NOT NULL DEFAULT 'pending'
  );
  ```

- **Apply Appropriate Constraints**: Use constraints to ensure data integrity:
  ```sql
  CREATE TABLE if not exists public.my_table (
    email VARCHAR(255) NOT NULL CHECK (email ~* '^.+@.+\..+$'),
    count INTEGER NOT NULL CHECK (count >= 0),
    /* other fields */
  );
  ```

### 6. Authentication and User Management

- **Use Supabase Auth**: Leverage auth.users for identity management
- **Handle User Creation**: Use triggers like `kit.setup_new_user` to set up user data after registration

### 7. Function Security

- **Apply Security Definer Carefully**: For functions that need elevated privileges:
  ```sql
  CREATE OR REPLACE FUNCTION public.my_function()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = '' AS $$
  -- function body
  $$;
  ```

- **Set Proper Function Permissions**:
  ```sql
  GRANT EXECUTE ON FUNCTION public.my_function() TO authenticated, service_role;
  ```

### 8. Error Handling and Validation

- **Use Custom Error Messages**: Return meaningful errors:
  ```sql
  IF NOT validation_passed THEN
    RAISE EXCEPTION 'Validation failed: %', error_message;
  END IF;
  ```

### 9. Triggers for Automation

- **Use Triggers for Derived Data**: Automate updates to derived fields:
  ```sql
  CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON public.my_table
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamps();
  ```

### 10. View Structure for Commonly Used Queries

- **Create Views for Complex Joins**: As done with `user_account_workspace`
  ```sql
  CREATE OR REPLACE VIEW public.my_view
  WITH (security_invoker = true) AS
  SELECT ...
  ```

You always must use `(security_invoker = true)` for views.

## Key Functions to Know

1. **Account Access**
    - `public.has_role_on_account(account_id, account_role)`
    - `public.is_account_owner(account_id)`
    - `public.is_team_member(account_id, user_id)`

2. **Permissions**
    - `public.has_permission(user_id, account_id, permission_name)`
    - `public.has_more_elevated_role(target_user_id, target_account_id, role_name)`

3. **Team Management**
    - `public.create_team_account(account_name)`

4. **Billing & Subscriptions**
    - `public.has_active_subscription(target_account_id)`

5. **One-Time Tokens**
    - `public.create_nonce(...)`
    - `public.verify_nonce(...)`
    - `public.revoke_nonce(...)`

6. **Super Admins**
    - `public.is_super_admin()`

7. **MFA**:
    - `public.is_aal2()`
    - `public.is_mfa_compliant()`

## Configuration Control

- **Use the `config` Table**: The application has a central configuration table
- **Check Features with `public.is_set(field_name)`**:
  ```sql
  -- Check if team accounts are enabled
  SELECT public.is_set('enable_team_accounts');
  ```

# Server Actions

- For Data Mutations from Client Components, always use Server Actions
- Always name the server actions file as "server-actions.ts"
- Always name exported Server Actions suffixed as "Action", ex. "createPostAction"
- Always use the `enhanceAction` function from the "@portal/supabase/actions" package [index.ts](mdc:packages/next/src/actions/index.ts)
- Always use the 'use server' directive at the top of the file
- Place the Zod schema in a separate file so it can be reused with `react-hook-form`

```tsx
'use server';

import { z } from 'zod';
import { enhanceAction } from '@portal/next/actions';
import { EntitySchema } from '../entity.schema.ts`;

export const myServerAction = enhanceAction(
  async function (data, user) {
    // 1. "data" is already a valid EntitySchema and it's safe to use
    // 2. "user" is the authenticated user

    // ... your code here
    return {
      success: true,
    };
  },
  {
    auth: true,
    schema: EntitySchema,
  },
);
```

# Route Handler / API Routes

- Use Route Handlers when data fetching from Client Components
- To create API routes (route.ts), always use the `enhanceRouteHandler` function from the "@portal/supabase/routes" package. [index.ts](mdc:packages/next/src/routes/index.ts)

```tsx
import { z } from 'zod';
import { enhanceRouteHandler } from '@portal/next/routes';
import { NextResponse } from 'next/server';

const ZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const POST = enhanceRouteHandler(
  async function({ body, user, request }) {
    // 1. "body" is already a valid ZodSchema and it's safe to use
    // 2. "user" is the authenticated user
    // 3. "request" is NextRequest
    // ... your code here
    return NextResponse.json({
      success: true,
    });
  },
  {
    schema: ZodSchema,
  },
);

// example of unauthenticated route (careful!)
export const GET = enhanceRouteHandler(
  async function({ user, request }) {
    // 1. "user" is null, as "auth" is false and we don't require authentication
    // 2. "request" is NextRequest
    // ... your code here
    return NextResponse.json({
      success: true,
    });
  },
  {
    auth: false,
  },
);
```

# Access Control & Permissions Guidelines

This rule provides guidance for implementing access control, permissions, and subscription-related functionality in the application.

## Role-Based Access Control

### Account Roles
- Roles are defined in the `roles` table with hierarchy levels (lower number = higher privilege)
- Default roles include `owner` (hierarchy_level=1) and `member` with specific permissions
- Primary account owner has special privileges that cannot be revoked
- Role hierarchy controls what actions users can perform on other members

### Role Permissions
- Permissions are stored in `role_permissions` table mapping roles to specific permissions
- Core permissions:
    - `roles.manage`: Manage roles of users with lower hierarchy
    - `billing.manage`: Access/update billing information
    - `settings.manage`: Update account settings
    - `members.manage`: Add/remove members
    - `invites.manage`: Create/update/delete invitations

### Permission Checking
- Use `has_permission(user_id, account_id, permission_name)` to check specific permissions
- Use `can_action_account_member(target_team_account_id, target_user_id)` to verify if a user can act on another
- Use `is_account_owner(account_id)` to check if user is primary owner
- Primary owners can perform any action regardless of explicit permissions

## Team Account Access

### Team Membership
- Use `has_role_on_account(account_id, account_role)` to check if user is a member with specific role
- Use `is_team_member(account_id, user_id)` to check if a specific user is a member
- Use the authenticated user's `TeamAccountWorkspaceContext` to access current permissions array

### Invitations
- Only users with `invites.manage` permission can create/manage invitations
- Users can only invite others with the same or lower role hierarchy than they have
- Invitations have expiry dates (default: 7 days)
- Accept invitations using `accept_invitation` function with token

## Subscription Access

### Subscription Status Checking
- Check active subscriptions with `has_active_subscription(account_id)`
- Active status includes both `active` and `trialing` subscriptions
- Guard premium features with subscription checks in both frontend and backend

### Billing Access
- Only users with `billing.manage` permission can access billing functions
- All billing operations should be guarded with permission checks
- Per-seat billing automatically updates when members are added/removed

## Row Level Security

### Table RLS
- Most tables have RLS policies restricting access based on team membership
- Personal account data is only accessible by the account owner
- Team account data is accessible by all team members based on their roles

### Actions on Members
- Higher roles can update/remove lower roles but not equal or higher roles
- Primary owner cannot be removed from their account
- Ownership transfer requires OTP verification and is limited to primary owners


# i18n System Guide

This document provides a comprehensive overview of the internationalization (i18n) system in our Next.js application.

## Architecture Overview

The i18n system consists of:

1. **Core i18n Package**: Located in `packages/i18n`, providing the foundation for i18n functionality
2. **Application-specific Implementation**: Located in `apps/web/lib/i18n`, customizing the core functionality
3. **Translation Files**: Located in `apps/web/public/locales/[language]/[namespace].json`

## Usage Guide

### 1. Setting Up a Page or Layout with i18n

Wrap your page or layout component with the `withI18n` HOC:

```typescript
import { withI18n } from '~/lib/i18n/with-i18n';

function HomePage() {
  // Your component code
}

export default withI18n(HomePage);
```

### 2. Using Translations in Client Components

Use the `useTranslation` hook from react-i18next:

```tsx
'use client';

import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation('common');
  
  return <h1>{t('homeTabLabel')}</h1>;
}
```

### 3. Using Translations with the Trans Component

For complex translations that include HTML or variables:

```tsx
import { Trans } from '@portal/ui/trans';

export function MyComponent() {
  return (
    <div>
      <Trans 
        i18nKey="teams:inviteAlertBody" 
        values={{ accountName: 'My Team' }}
      />
    </div>
  );
}
```

### 4. Adding Language Selection to Your UI

Use the `LanguageSelector` component:

```tsx
import { LanguageSelector } from '@portal/ui/language-selector';

export function SettingsPage() {
  return (
    <div>
      <h2>Language Settings</h2>
      <LanguageSelector />
    </div>
  );
}
```

### 5. Adding New Translations

1. Create or update JSON files in `apps/web/public/locales/[language]/[namespace].json`
2. Follow the existing structure, adding your new keys

For example, in `apps/web/public/locales/en/common.json`:
```json
{
  "existingKey": "Existing translation",
  "newKey": "New translation text"
}
```

### 6. Adding a New Language

1. Add the language code to the `languages` array in `i18n.settings.ts`
2. Create corresponding translation files in `apps/web/public/locales/[new-language]/`
3. Copy the structure from the English files as a template

### 7. Adding a New Namespace

1. Add the namespace to `defaultI18nNamespaces` in `i18n.settings.ts`
2. Create corresponding translation files for all supported languages

## Advanced Usage

### Dynamic Namespace Loading

When you need translations from namespaces not included in the default set:

```typescript
import { getI18nSettings } from '~/lib/i18n/i18n.settings';

// Load specific namespaces
const settings = getI18nSettings(language, ['specific-namespace']);
```

### Language Priority

The system uses the following priority to determine the language:
1. User-selected language (from cookie)
2. Browser language (if priority is set to 'user')
3. Default language from environment variable

### Common Issues

- **Translation not showing**: Check that you're using the correct namespace
- **Dynamic content not interpolated**: Make sure to use the `values` prop with `Trans` component

## Available Namespaces and Keys

Here's a brief overview of the available namespaces:

- **common**: General UI elements, navigation, errors [common.json](mdc:apps/web/public/locales/en/common.json)
- **auth**: Authentication-related text [auth.json](mdc:apps/web/public/locales/en/auth.json)
- **account**: Account settings and profile [account.json](mdc:apps/web/public/locales/en/account.json)
- **teams**: Team management [teams.json](mdc:apps/web/public/locales/en/teams.json)
- **billing**: Subscription and payment [billing.json](mdc:apps/web/public/locales/en/billing.json)
- **marketing**: Landing pages, blog, etc. [marketing.json](mdc:apps/web/public/locales/en/marketing.json)

When creating a new functionality, it can be useful to add a new namespace.

# Security Best Practices

## Next.js-Specific Security

### Client Component Data Passing

- **Never pass sensitive data** to Client Components
- **Never pass unsanitized data** to Client Components (raw cookies, client-provided data)

### Server Components Security

- **Always sanitize user input** before using in Server Components
- **Validate cookies and headers** in Server Components

### Environment Variables

- **Use `import 'server-only'`** for code that should only be run on the server side
- **Never expose server-only env vars** to the client
- **Never pass environment variables as props to client components** unless they're suffixed with `NEXT_PUBLIC_`
- **Never use `NEXT_PUBLIC_` prefix** for sensitive data (ex. API keys, secrets)
- **Use `NEXT_PUBLIC_` prefix** only for client-safe variables

### Client Hydration Protection

- **Never expose sensitive data** in initial HTML

## Authentication & Authorization

### Row Level Security (RLS)

- **Always enable RLS** on all tables unless explicitly specified otherwise [database.mdc](mdc:.cursor/rules/database.mdc)

### Super Admin Protected Routes
Always perform extra checks when writing Super Admin code [super-admin.mdc](mdc:.cursor/rules/super-admin.mdc)

## Server Actions & API Routes

### Server Actions

- Always use `enhanceAction` wrapper for consistent security [server-actions.mdc](mdc:.cursor/rules/server-actions.mdc)
- Always use 'use server' directive at the top of the file to safely bundle server-side code
- Validate input with Zod schemas
- Implement authentication checks:

```typescript
'use server';

import { enhanceAction } from '@portal/next/actions';
import { MyActionSchema } from '../schema';

export const secureAction = enhanceAction(
  async function(data, user) {
    // Additional permission checks
    const hasPermission = await checkUserPermission(user.id, data.accountId, 'action.perform');
    if (!hasPermission) throw new Error('Insufficient permissions');

    // Validated data available
    return processAction(data);
  },
  {
    auth: true,
    schema: MyActionSchema
  }
);
```

### API Routes

- Use `enhanceRouteHandler` for consistent security [route-handlers.mdc](mdc:.cursor/rules/route-handlers.mdc)
- Implement authentication and authorization checks:

```typescript
import { enhanceRouteHandler } from '@portal/next/routes';
import { RouteSchema } from '../schema';

export const POST = enhanceRouteHandler(
  async function({ body, user, request }) {
    // Additional authorization checks
    const canAccess = await canAccessResource(user.id, body.resourceId);

    if (!canAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Safe to process with validated body
    return NextResponse.json({ success: true });
  },
  {
    auth: true,
    schema: RouteSchema
  }
);
```

## Client Components Security

### Context Awareness

- Use appropriate workspace contexts for access control:
    - `useUserWorkspace()` in personal account pages
    - `useTeamAccountWorkspace()` in team account pages
- Check permissions before rendering sensitive UI elements:

```typescript
function SecureComponent() {
  const { account, user } = useTeamAccountWorkspace();
  const canEdit = account.permissions.includes('entity.update');

  if (!canEdit) return null;

  return <EditComponent />;
}
```

### Data Fetching

- Use React Query with proper error handling
- Never trust client-side permission checks alone

## One-Time Tokens

Consider using OTP tokens when implementing highly destructive operations like deleting an entity that would otherwise require a full backup: [otp.mdc](mdc:.cursor/rules/otp.mdc)

## Critical Data Protection

### Personal Information

- Never log or expose sensitive user data
- Use proper session management

## Error Handling

- Never expose internal errors to clients
- Log errors securely with appropriate context
- Return generic error messages to users

```typescript
try {
  await sensitiveOperation();
} catch (error) {
  logger.error({ error, context }, 'Operation failed');
  return { error: 'Unable to complete operation' };
}
```

## Database Security

- Avoid dynamic SQL generation
- Use SECURITY DEFINER functions sparingly and carefully, warn user if you do so
- Implement proper foreign key constraints
- Use appropriate data types with constraints
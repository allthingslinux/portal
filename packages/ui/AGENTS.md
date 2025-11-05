# UI Components & Styling Instructions

This file contains instructions for working with UI components, styling, and forms.

## Core UI Library

Import from `packages/ui/src/`:

```tsx
// Shadcn components
import { Button } from '@portal/ui/button';
import { Card } from '@portal/ui/card';

// Portal components
import { If } from '@portal/ui/if';
import { ProfileAvatar } from '@portal/ui/profile-avatar';
import { toast } from '@portal/ui/sonner';
import { Trans } from '@portal/ui/trans';
```

NB: imports must follow the convention "@portal/ui/<name>", no matter the folder they're placed in

## Styling Guidelines

- Use **Tailwind CSS v4** with semantic classes
- Prefer Shadcn-ui classes like `bg-background`, `text-muted-foreground`
- Use `cn()` utility from `@portal/ui/cn` for class merging

```tsx
import { cn } from '@portal/ui/cn';

function MyComponent({ className }) {
  return (
    <div className={cn('bg-background text-foreground', className)}>
      Content
    </div>
  );
}
```

### Conditional Rendering

Use the `If` component from `packages/ui/src/makerkit/if.tsx`:

```tsx
import { If } from '@portal/ui/if';

<If condition={isLoading} fallback={<Content />}>
  <Spinner />
</If>

// With type inference
<If condition={error}>
  {(err) => <ErrorMessage error={err} />}
</If>
```

### Testing Attributes

```tsx
<button data-test="submit-button">Submit</button>
<div data-test="user-profile" data-user-id={user.id}>Profile</div>
```

## Forms with React Hook Form & Zod

```typescript
// 1. Schema in separate file
export const CreateNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

// 2. Client component with form
'use client';
const form = useForm({
  resolver: zodResolver(CreateNoteSchema),
});

const onSubmit = (data) => {
  startTransition(async () => {
    await toast.promise(createNoteAction(data), {
      loading: 'Creating...',
      success: 'Created!',
      error: 'Failed!',
    }).unwrap();
  });
};
```

### Form Examples

- Contact form: `apps/web/app/(marketing)/contact/_components/contact-form.tsx`
- Verify OTP form: `packages/otp/src/components/verify-otp-form.tsx`

### Guidelines

- Place Zod resolver outside so it can be reused with Server Actions
- Never add generics to `useForm`, use Zod resolver to infer types instead
- Never use `watch()` instead use hook `useWatch`
- Add `FormDescription` (optionally) and always add `FormMessage` to display errors

## Internationalization

Always use `Trans` component from `packages/ui/src/makerkit/trans.tsx`:

```tsx
import { Trans } from '@portal/ui/trans';

<Trans
  i18nKey="user:welcomeMessage"
  values={{ name: user.name }}
/>

// With HTML elements
<Trans
  i18nKey="terms:agreement"
  components={{
    TermsLink: <a href="/terms" className="underline" />,
  }}
/>
```

## Toast Notifications

Use the `toast` utility from `@portal/ui/sonner`:

```tsx
import { toast } from '@portal/ui/sonner';

// Simple toast
toast.success('Success message');
toast.error('Error message');

// Promise-based toast
await toast.promise(asyncFunction(), {
  loading: 'Processing...',
  success: 'Done!',
  error: 'Failed!',
});
```

## Common Component Patterns

### Loading States

```tsx
import { Spinner } from '@portal/ui/spinner';

<If condition={isLoading} fallback={<Content />}>
  <Spinner className="h-4 w-4" />
</If>
```

### Error Handling

```tsx
import { Alert, AlertDescription, AlertTitle } from '@portal/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

<If condition={Boolean(error)}>
  <Alert variant="destructive">
    <ExclamationTriangleIcon className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
</If>
```

### Button Patterns

```tsx
import { Button } from '@portal/ui/button';

// Loading button
<Button disabled={isPending}>
  {isPending ? (
    <>
      <Spinner className="mr-2 h-4 w-4" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
```

### Card Layouts

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@portal/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

## Form Components

### Input Fields

```tsx
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@portal/ui/form';

<FormField
  name="title"
  control={form.control}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Title</FormLabel>

      <FormControl>
        <Input placeholder="Enter title" {...field} />
      </FormControl>

      <FormDescription>
        The title of your task
      </FormDescription>

      <FormMessage />
    </FormItem>
  )}
/>
```

### Select Components

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@portal/ui/select';

<FormField
  name="category"
  control={form.control}
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
        </FormControl>
        
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>

      <FormDescription>
        The category of your task
      </FormDescription>

      <FormMessage />
    </FormItem>
  )}
/>
```

## Accessibility Guidelines

- Always include proper ARIA labels
- Use semantic HTML elements
- Ensure proper keyboard navigation

```tsx
<button
  aria-label="Close modal"
  aria-describedby="modal-description"
  onClick={onClose}
>
  <X className="h-4 w-4" />
</button>
```

## Dark Mode Support

The UI components automatically support dark mode through CSS variables. Use semantic color classes:

```tsx
// Good - semantic colors
<div className="bg-background text-foreground border-border">
  <p className="text-muted-foreground">Secondary text</p>
</div>

// Avoid - hardcoded colors
<div className="bg-white text-black border-gray-200">
  <p className="text-gray-500">Secondary text</p>
</div>
```
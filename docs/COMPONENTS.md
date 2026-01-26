# Component Conventions

This document outlines component architecture, usage guidelines, and best practices for Portal.

## Component Structure

### Directory Organization

```
src/components/
├── ui/              # shadcn/ui base components (Button, Input, Card, etc.)
├── layout/          # Layout components (Sidebar, Header, Navigation)
├── admin/           # Admin-specific components
├── integrations/    # Integration-specific components
└── ...              # Feature-specific components
```

### Base Components (`src/components/ui/`)

Base UI components are built on top of [shadcn/ui](https://ui.shadcn.com/) and Radix UI primitives. These components provide the foundation for all UI in Portal.

**Key Principles:**

- Composable and accessible
- Type-safe with TypeScript
- Styled with Tailwind CSS
- Use `cn()` utility for class merging

## Component Patterns

### Using Base Components

**Import Pattern**:

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

**Composition Example**:

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>View Profile</Button>
      </CardContent>
    </Card>
  )
}
```

### Variant Patterns

Many components use `class-variance-authority` (CVA) for variant management:

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        destructive: "destructive-classes",
      },
      size: {
        default: "default-size",
        sm: "small-size",
      },
    },
  }
)

function Button({ variant, size, ...props }: VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }))} {...props} />
}
```

### Component Props

**Standard Props Pattern**:

```typescript
import type * as React from "react"
import { cn } from "@/lib/utils"

function Component({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("base-classes", className)} {...props}>
      {children}
    </div>
  )
}
```

**With Variants**:

```typescript
function Component({
  variant = "default",
  size = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof componentVariants>) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

## When to Create New Components

### ✅ Create a New Component When

1. **Reusability**: Component will be used in multiple places
2. **Complexity**: Encapsulates complex logic or state
3. **Composition**: Combines multiple base components into a cohesive unit
4. **Feature-Specific**: Component is specific to a feature domain

### ❌ Don't Create a Component When

1. **One-Time Use**: Only used once in a specific context
2. **Simple Composition**: Just wrapping a single base component
3. **Trivial Logic**: No meaningful abstraction or logic

### Component Naming

- **Base Components**: Use simple names (`Button`, `Card`, `Input`)
- **Feature Components**: Use descriptive names (`UserCard`, `IntegrationManagement`)
- **Layout Components**: Use layout names (`Sidebar`, `Header`, `Navigation`)

## Component Guidelines

### Accessibility

**ARIA Attributes**:

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`)
- Add ARIA labels when needed: `aria-label`, `aria-describedby`
- Support keyboard navigation
- Ensure proper focus management

**Example**:

```typescript
<Button
  aria-label="Close dialog"
  onClick={handleClose}
>
  <XIcon />
</Button>
```

### Styling

**Tailwind CSS**:

- Use Tailwind utility classes for styling
- Use `cn()` for conditional and merged classes
- Follow design system tokens (colors, spacing, typography)

**Example**:

```typescript
<div className={cn(
  "flex items-center gap-4 p-4",
  isActive && "bg-accent",
  className
)}>
```

### Type Safety

**Props Types**:

- Use TypeScript for all component props
- Extend base HTML element types when appropriate
- Use `React.ComponentProps<"div">` for HTML element props

**Example**:

```typescript
interface UserCardProps extends React.ComponentProps<"div"> {
  user: User
  onEdit?: (user: User) => void
}

function UserCard({ user, onEdit, ...props }: UserCardProps) {
  // ...
}
```

### State Management

**Local State**:

- Use `useState` for component-local state
- Use `useReducer` for complex state logic

**Server State**:

- Use TanStack Query for server data
- Use custom hooks (`use-user`, `use-admin`) for data fetching

**Example**:

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId)
  
  if (isLoading) return <Skeleton />
  if (!user) return <Empty />
  
  return <Card>{/* user data */}</Card>
}
```

## Component Composition

### Compound Components

Use compound components for related functionality:

```typescript
function Card({ children, ...props }) {
  return <div className="card" {...props}>{children}</div>
}

function CardHeader({ children, ...props }) {
  return <div className="card-header" {...props}>{children}</div>
}

function CardContent({ children, ...props }) {
  return <div className="card-content" {...props}>{children}</div>
}

Card.Header = CardHeader
Card.Content = CardContent

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

### Render Props Pattern

Use render props for flexible component composition:

```typescript
function DataTable<T>({
  data,
  renderRow,
}: {
  data: T[]
  renderRow: (item: T) => React.ReactNode
}) {
  return (
    <table>
      {data.map((item) => (
        <tr key={item.id}>{renderRow(item)}</tr>
      ))}
    </table>
  )
}
```

## Available Base Components

### Form Components

#### Button

Button component with multiple variants and sizes.

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

**Sizes:** `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`

**Example:**

```typescript
import { Button } from "@/components/ui/button"

<Button variant="default" size="default">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

#### Input

Text input field with validation states.

**Example:**

```typescript
import { Input } from "@/components/ui/input"

<Input type="email" placeholder="Enter email" />
<Input type="password" aria-invalid="true" />
```

#### Textarea

Multi-line text input.

**Example:**

```typescript
import { Textarea } from "@/components/ui/textarea"

<Textarea placeholder="Enter description" rows={4} />
```

#### Checkbox

Checkbox input with label support.

**Example:**

```typescript
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms</Label>
```

#### Select

Dropdown select with search support.

**Example:**

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Field

Form field wrapper with label and error message.

**Example:**

```typescript
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"

<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" />
  <FieldDescription>Enter your email address</FieldDescription>
  <FieldError>Email is required</FieldError>
</Field>
```

#### Form

Form wrapper with react-hook-form integration.

**Example:**

```typescript
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"

const form = useForm()
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### Layout Components

#### Card

Card container with header, content, and footer sections.

**Example:**

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Sidebar

Collapsible sidebar navigation component.

**Example:**

```typescript
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"

<Sidebar>
  <SidebarHeader>Header</SidebarHeader>
  <SidebarContent>Navigation items</SidebarContent>
  <SidebarFooter>Footer</SidebarFooter>
</Sidebar>
```

#### Separator

Visual separator line.

**Example:**

```typescript
import { Separator } from "@/components/ui/separator"

<div>
  <p>Content above</p>
  <Separator />
  <p>Content below</p>
</div>
```

#### Tabs

Tab navigation component.

**Example:**

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Feedback Components

#### Alert

Alert message component with variants.

**Variants:** `default`, `destructive`

**Example:**

```typescript
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

<Alert>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert description text</AlertDescription>
</Alert>
```

#### Dialog

Modal dialog component.

**Example:**

```typescript
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    Dialog content
    <DialogFooter>
      <Button>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Toast (Sonner)

Toast notifications via Sonner.

**Example:**

```typescript
import { toast } from "sonner"

toast.success("Success message")
toast.error("Error message")
toast("Info message")
```

#### Badge

Status badge component.

**Variants:** `default`, `secondary`, `destructive`, `outline`

**Example:**

```typescript
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Data Display

#### Table

Data table component with sorting and filtering.

**Example:**

```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Empty

Empty state display component.

**Example:**

```typescript
import { Empty, EmptyDescription, EmptyIcon, EmptyTitle } from "@/components/ui/empty"

<Empty>
  <EmptyIcon />
  <EmptyTitle>No items</EmptyTitle>
  <EmptyDescription>There are no items to display</EmptyDescription>
</Empty>
```

#### Item

List item component with variants.

**Variants:** `default`, `outline`, `muted`

**Example:**

```typescript
import { Item } from "@/components/ui/item"

<Item variant="default">
  <ItemMedia>Icon</ItemMedia>
  <ItemContent>
    <ItemTitle>Item Title</ItemTitle>
    <ItemDescription>Item description</ItemDescription>
  </ItemContent>
</Item>
```

### Navigation

#### Command

Command palette component for search and navigation.

**Example:**

```typescript
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command"

<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandGroup heading="Actions">
      <CommandItem>Action 1</CommandItem>
      <CommandItem>Action 2</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

#### Navigation Menu

Navigation menu component with dropdown support.

**Example:**

```typescript
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink>Home</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Additional Components

- **Accordion** - Collapsible content sections
- **Alert Dialog** - Confirmation dialogs
- **Aspect Ratio** - Maintain aspect ratios
- **Avatar** - User avatar display
- **Breadcrumb** - Breadcrumb navigation
- **Button Group** - Grouped buttons
- **Calendar** - Date picker calendar
- **Carousel** - Image/content carousel
- **Chart** - Data visualization charts
- **Collapsible** - Collapsible content
- **Context Menu** - Right-click context menu
- **Drawer** - Slide-out drawer
- **Dropdown Menu** - Dropdown menu
- **Hover Card** - Hover card tooltip
- **Input Group** - Input with prefix/suffix
- **Input OTP** - OTP input fields
- **KBD** - Keyboard key display
- **Label** - Form label
- **Menubar** - Application menubar
- **Pagination** - Pagination controls
- **Popover** - Popover tooltip
- **Progress** - Progress indicator
- **Radio Group** - Radio button group
- **Resizable** - Resizable panels
- **Scroll Area** - Custom scrollable area
- **Sheet** - Slide-out sheet
- **Skeleton** - Loading skeleton
- **Slider** - Range slider input
- **Spinner** - Loading spinner
- **Switch** - Toggle switch
- **Toggle** - Toggle button
- **Toggle Group** - Grouped toggle buttons
- **Tooltip** - Tooltip popover

## Custom Components

### IntegrationCard

Card component for displaying integration information.

**Example:**

```typescript
import { IntegrationCard } from "@/components/integrations/integration-card"

<IntegrationCard
  title="XMPP Integration"
  description="Connect your XMPP account"
>
  <IntegrationManagement integrationId="xmpp" />
</IntegrationCard>
```

### IntegrationManagement

Generic component for managing integration accounts.

**Example:**

```typescript
import { IntegrationManagement } from "@/components/integrations/integration-management"

<IntegrationManagement
  integrationId="xmpp"
  title="XMPP Account"
  description="Manage your XMPP account"
  createLabel="Connect XMPP Account"
  createInputLabel="XMPP Username"
  createInputPlaceholder="username@atl.chat"
/>
```

### UserManagement

Admin component for managing users.

**Example:**

```typescript
import { UserManagement } from "@/components/admin/user-management"

<UserManagement />
```

### CommandMenu

Global command palette for navigation and actions.

**Example:**

```typescript
import { CommandMenu } from "@/components/command-menu"

// Rendered in layout, accessible via Cmd+K
<CommandMenu />
```

## Theme Customization

### Design Tokens

Portal uses CSS variables (OKLCH color space) for theming. Customize in `src/styles/globals.css`:

**Color Tokens:**

```css
:root {
  /* Base colors */
  --background: oklch(0.9135 0.0068 277.1562);
  --foreground: oklch(0.4355 0.043 279.325);
  
  /* Card colors */
  --card: oklch(0.967 0.003 264.542);
  --card-foreground: oklch(0.4355 0.043 279.325);
  
  /* Primary colors */
  --primary: oklch(0.5999 0.1804 257.5267);
  --primary-foreground: oklch(0.4297 0.0471 193.5404);
  
  /* Secondary colors */
  --secondary: oklch(0.8143 0.0492 272.3606);
  --secondary-foreground: oklch(0.4355 0.043 279.325);
  
  /* Muted colors */
  --muted: oklch(0.906 0.0117 264.5071);
  --muted-foreground: oklch(0.5653 0.0983 271.3204);
  
  /* Accent colors */
  --accent: oklch(0.8352 0.0254 275.8484);
  --accent-foreground: oklch(0.4355 0.043 279.325);
  
  /* Destructive colors */
  --destructive: oklch(0.6337 0.2326 11.5662);
  --destructive-foreground: oklch(0.5527 0.0749 75.1934);
  
  /* Border and input */
  --border: oklch(0.7735 0.0057 274.9433);
  --input: oklch(0.9135 0.0068 277.1562);
  --ring: oklch(0.5121 0.1563 264.096);
  
  /* Chart colors */
  --chart-1: oklch(0.5547 0.2503 297.0156);
  --chart-2: oklch(0.682 0.1448 235.3822);
  --chart-3: oklch(0.625 0.1772 140.4448);
  --chart-4: oklch(0.692 0.2041 42.4293);
  --chart-5: oklch(0.7141 0.1045 33.0967);
  
  /* Sidebar colors */
  --sidebar: oklch(0.8734 0.02 270.1891);
  --sidebar-foreground: oklch(0.4355 0.043 279.325);
  --sidebar-primary: oklch(0.4355 0.043 279.325);
  --sidebar-primary-foreground: oklch(0.5653 0.0983 271.3204);
  --sidebar-accent: oklch(0.682 0.1448 235.3822);
  --sidebar-accent-foreground: oklch(0.4355 0.043 279.325);
  --sidebar-border: oklch(0.4355 0.043 279.325);
  --sidebar-ring: oklch(0.5547 0.2503 297.0156);
  
  /* Typography */
  --font-sans: var(--font-inter);
  --font-serif: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  
  /* Border radius */
  --radius: 0.6rem;
  
  /* Shadows */
  --shadow-xs: 0px 4px 6px 0px hsl(240 30% 25% / 0.06);
  --shadow-sm: 0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12);
  --shadow: 0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 1px 2px -1px hsl(240 30% 25% / 0.12);
  --shadow-md: 0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 2px 4px -1px hsl(240 30% 25% / 0.12);
  --shadow-lg: 0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 4px 6px -1px hsl(240 30% 25% / 0.12);
  --shadow-xl: 0px 4px 6px 0px hsl(240 30% 25% / 0.12), 0px 8px 10px -1px hsl(240 30% 25% / 0.12);
  --shadow-2xl: 0px 4px 6px 0px hsl(240 30% 25% / 0.3);
}
```

**Using Tokens in Components:**

```typescript
// Use Tailwind classes that reference CSS variables
<div className="bg-background text-foreground border-border">
  <Button className="bg-primary text-primary-foreground">
    Primary Button
  </Button>
</div>
```

### Dark Mode

Dark mode is handled automatically via `next-themes`. Dark mode tokens are defined in `.dark` class:

```css
.dark {
  --background: oklch(0.2263 0.0214 280.4871);
  --foreground: oklch(0.8456 0.0611 274.7629);
  /* ... */
}
```

**Using Dark Mode:**

```typescript
// Components automatically adapt via CSS variables
<div className="bg-background text-foreground">
  {/* Works in both light and dark mode */}
</div>

// Or use explicit dark mode variants
<div className="bg-white dark:bg-gray-900">
  {/* Explicit dark mode styling */}
</div>
```

### Customizing Theme

**1. Modify Color Tokens:**

Edit `src/styles/globals.css` and update the CSS variables:

```css
:root {
  --primary: oklch(0.6 0.2 250); /* Your custom primary color */
}
```

**2. Add Custom Tokens:**

```css
:root {
  --custom-color: oklch(0.5 0.15 200);
}

@theme inline {
  --color-custom: var(--custom-color);
}
```

**3. Use Custom Tokens:**

```typescript
<div className="bg-custom text-foreground">
  Custom colored element
</div>
```

### Color Format

Portal uses OKLCH color space for better color consistency and perceptual uniformity:

- **L** (Lightness): 0-1 (0 = black, 1 = white)
- **C** (Chroma): 0-0.4 (saturation)
- **H** (Hue): 0-360 (color wheel)

**Benefits:**

- Perceptually uniform
- Better color interpolation
- Consistent appearance across displays

## Best Practices

1. **Composition Over Configuration**
   - Prefer composing base components over creating new ones
   - Use props for customization, not new components

2. **Accessibility First**
   - Always use semantic HTML
   - Test with keyboard navigation
   - Ensure proper ARIA attributes

3. **Performance**
   - Use `React.memo` for expensive components
   - Lazy load heavy components
   - Optimize re-renders with proper key props

4. **Documentation**
   - Add JSDoc comments for complex components
   - Document prop types and usage examples
   - Include accessibility notes

5. **Testing**
   - Write tests for component behavior
   - Test user interactions, not implementation
   - Use React Testing Library

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Testing Library](https://testing-library.com/react)

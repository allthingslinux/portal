# Accessibility Guidelines

This document outlines accessibility requirements, patterns, and best practices for Portal.

## Table of Contents

- [ARIA Patterns](#aria-patterns)
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Testing](#screen-reader-testing)
- [Color Contrast Requirements](#color-contrast-requirements)
- [Best Practices](#best-practices)

## ARIA Patterns

### Semantic HTML

Always prefer semantic HTML elements over generic `div` elements:

**✅ Good:**

```typescript
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Article content</p>
  </article>
</main>

<button onClick={handleClick}>Click me</button>
```

**❌ Bad:**

```typescript
<div onClick={handleClick}>Click me</div>
<div role="button" tabIndex={0}>Click me</div>
```

### ARIA Labels

Use ARIA labels when semantic HTML isn't sufficient:

**Icon-only Buttons:**

```typescript
<Button aria-label="Close dialog">
  <XIcon />
</Button>
```

**Form Fields:**

```typescript
<Input
  type="email"
  aria-label="Email address"
  aria-required="true"
  aria-invalid={hasError}
/>
```

**Landmarks:**

```typescript
<nav aria-label="Breadcrumb">
  <Breadcrumb />
</nav>

<aside aria-label="Sidebar navigation">
  <Sidebar />
</aside>
```

### ARIA Described By

Link descriptions to form fields:

```typescript
<Field>
  <FieldLabel htmlFor="password">Password</FieldLabel>
  <Input
    id="password"
    type="password"
    aria-describedby="password-help password-error"
  />
  <FieldDescription id="password-help">
    Must be at least 8 characters
  </FieldDescription>
  {error && (
    <FieldError id="password-error">
      {error}
    </FieldError>
  )}
</Field>
```

### ARIA Live Regions

Use live regions for dynamic content updates:

```typescript
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// For important updates
<div aria-live="assertive" aria-atomic="true">
  {errorMessage}
</div>
```

### ARIA States

Indicate component states:

```typescript
<Button
  aria-pressed={isActive}
  aria-expanded={isOpen}
  aria-disabled={isDisabled}
>
  Toggle
</Button>

<Dialog open={isOpen}>
  <DialogContent aria-modal="true">
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### ARIA Roles

Use roles when semantic HTML isn't available:

```typescript
// Custom button component
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  aria-pressed={isPressed}
>
  Custom Button
</div>

// Loading state
<div role="status" aria-live="polite">
  Loading...
</div>

// Progress indicator
<div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
  {progress}%
</div>
```

## Keyboard Navigation

### Focus Management

**Visible Focus Indicators:**

All interactive elements must have visible focus indicators:

```typescript
// Components automatically include focus styles
<Button className="focus-visible:ring-2 focus-visible:ring-ring">
  Button
</Button>
```

**Focus Order:**

Ensure logical tab order:

```typescript
<form>
  <Input type="text" autoFocus /> {/* First field */}
  <Input type="email" />          {/* Second field */}
  <Button type="submit">Submit</Button> {/* Submit button */}
</form>
```

**Focus Trapping:**

Trap focus within modals and dialogs:

```typescript
// Dialog component handles focus trapping automatically
<Dialog open={isOpen}>
  <DialogContent>
    {/* Focus is trapped within dialog */}
    <Input autoFocus />
    <Button>Close</Button>
  </DialogContent>
</Dialog>
```

### Keyboard Shortcuts

**Standard Shortcuts:**

- `Tab` - Navigate forward
- `Shift+Tab` - Navigate backward
- `Enter` / `Space` - Activate button/link
- `Escape` - Close modal/dialog
- `Arrow Keys` - Navigate lists/menus

**Custom Shortcuts:**

Document custom keyboard shortcuts:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openCommandMenu();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Keyboard Event Handlers

Handle keyboard events properly:

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClick();
  }
  if (e.key === "Escape") {
    handleClose();
  }
};

<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  Click me
</div>
```

### Skip Links

Provide skip links for main content:

```typescript
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

## Screen Reader Testing

### Testing Tools

**Screen Readers:**

- **NVDA** (Windows, free)
- **JAWS** (Windows, paid)
- **VoiceOver** (macOS/iOS, built-in)
- **TalkBack** (Android, built-in)
- **Orca** (Linux, free)

**Browser Extensions:**

- **axe DevTools** - Automated accessibility testing
- **WAVE** - Web accessibility evaluation
- **Lighthouse** - Accessibility audit

### Testing Checklist

**1. Navigation:**

- [ ] Can navigate entire page using only keyboard
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] Skip links work correctly

**2. Forms:**

- [ ] All form fields have labels
- [ ] Error messages are announced
- [ ] Required fields are indicated
- [ ] Form validation is accessible

**3. Interactive Elements:**

- [ ] Buttons have accessible names
- [ ] Links have descriptive text
- [ ] Icons have text alternatives
- [ ] Custom controls have proper ARIA

**4. Content:**

- [ ] Headings are properly structured (h1 → h2 → h3)
- [ ] Images have alt text
- [ ] Tables have headers
- [ ] Lists are properly marked up

**5. Dynamic Content:**

- [ ] Loading states are announced
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] Content updates are announced

### Testing Workflow

1. **Automated Testing:**

   ```bash
   # Run Lighthouse accessibility audit
   npm run lighthouse -- --only-categories=accessibility
   
   # Run axe DevTools
   # Install browser extension and run audit
   ```

2. **Manual Testing:**
   - Test with keyboard only (no mouse)
   - Test with screen reader
   - Test with browser zoom (200%)
   - Test with high contrast mode

3. **User Testing:**
   - Test with actual screen reader users
   - Gather feedback on navigation
   - Identify pain points

## Color Contrast Requirements

### WCAG Standards

Portal must meet **WCAG 2.1 Level AA** standards:

- **Normal Text:** 4.5:1 contrast ratio
- **Large Text (18pt+ or 14pt+ bold):** 3:1 contrast ratio
- **UI Components:** 3:1 contrast ratio
- **Graphical Objects:** 3:1 contrast ratio

### Checking Contrast

**Tools:**

- **WebAIM Contrast Checker** - <https://webaim.org/resources/contrastchecker/>
- **axe DevTools** - Automated contrast checking
- **Chrome DevTools** - Built-in contrast checker

**Example:**

```typescript
// ✅ Good contrast
<div className="bg-primary text-primary-foreground">
  {/* Primary colors have sufficient contrast */}
</div>

// ❌ Check custom colors
<div className="bg-[#cccccc] text-[#ffffff]">
  {/* Verify contrast ratio */}
</div>
```

### Color Usage

**Don't Rely on Color Alone:**

```typescript
// ❌ Bad - Color only
<span className="text-red-500">Error</span>

// ✅ Good - Color + icon/text
<span className="text-destructive">
  <AlertCircle /> Error: Invalid input
</span>
```

**Provide Multiple Indicators:**

```typescript
// Form field with error
<Input
  aria-invalid="true"
  className="border-destructive"
  aria-describedby="error-message"
/>
<span id="error-message" className="text-destructive">
  <AlertCircle /> This field is required
</span>
```

### Theme Colors

Portal's theme colors are designed to meet contrast requirements:

- **Primary/Foreground:** Meets 4.5:1 ratio
- **Destructive/Foreground:** Meets 4.5:1 ratio
- **Muted/Foreground:** Meets 3:1 ratio
- **Border colors:** Visible in both themes

**Verifying Theme Colors:**

```bash
# Use online contrast checker
# Primary: oklch(0.5999 0.1804 257.5267)
# Primary Foreground: oklch(0.4297 0.0471 193.5404)
# Verify ratio >= 4.5:1
```

## Best Practices

### 1. Semantic HTML First

Always use semantic HTML before adding ARIA:

```typescript
// ✅ Good
<button onClick={handleClick}>Click me</button>

// ❌ Bad
<div role="button" onClick={handleClick}>Click me</div>
```

### 2. Progressive Enhancement

Build accessible base, enhance with JavaScript:

```typescript
// Base HTML is accessible
<form action="/api/submit" method="POST">
  <Input name="email" type="email" required />
  <Button type="submit">Submit</Button>
</form>

// JavaScript enhances with better UX
const handleSubmit = async (e) => {
  e.preventDefault();
  // Enhanced submission
};
```

### 3. Descriptive Labels

Use descriptive labels and text:

```typescript
// ✅ Good
<Button aria-label="Delete user account for john@example.com">
  <TrashIcon />
</Button>

// ❌ Bad
<Button aria-label="Delete">
  <TrashIcon />
</Button>
```

### 4. Error Handling

Provide accessible error messages:

```typescript
<Field>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input
    id="email"
    type="email"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
  />
  {hasError && (
    <FieldError id="email-error" role="alert">
      {errorMessage}
    </FieldError>
  )}
</Field>
```

### 5. Loading States

Announce loading states:

```typescript
{isLoading ? (
  <div role="status" aria-live="polite">
    <Spinner aria-label="Loading data" />
    <span className="sr-only">Loading...</span>
  </div>
) : (
  <DataTable data={data} />
)}
```

### 6. Focus Management

Manage focus appropriately:

```typescript
// Focus first field in modal
<Dialog open={isOpen}>
  <DialogContent>
    <Input autoFocus /> {/* Focus on open */}
  </DialogContent>
</Dialog>

// Return focus on close
const handleClose = () => {
  setIsOpen(false);
  // Focus returns to trigger button automatically
};
```

### 7. Hidden Content

Use proper techniques for hidden content:

```typescript
// Screen reader only
<span className="sr-only">Additional context</span>

// Visually hidden but accessible
<div className="sr-only focus:not-sr-only">
  Skip to content
</div>

// Truly hidden
<div aria-hidden="true">
  Decorative content
</div>
```

## Testing Checklist

Before merging, verify:

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] ARIA labels are present where needed
- [ ] Form fields have associated labels
- [ ] Error messages are accessible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader testing completed
- [ ] Keyboard navigation works throughout
- [ ] Skip links are present and functional
- [ ] Dynamic content updates are announced

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Resources](https://webaim.org/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

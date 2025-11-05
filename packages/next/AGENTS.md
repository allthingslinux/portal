# Next.js Utilities Instructions

This file contains instructions for working with Next.js utilities including server actions and route handlers.

## Guidelines

- Don't use Server Actions for data-fetching, use for mutations only
- Best Practice: Keep actions light, move business logic to ad-hoc services
- Authorization logic must be defined in RLS and DB, not Server Actions or application code (unless using the admin client, use sparinlgy!)
- Do not expose sensitive data
- Log async operations
- Validate body with Zod
- Use 'use server' at the top of the file. No need for 'server only';

## Server Actions Implementation

Always use `enhanceAction` from `@packages/next/src/actions/index.ts`.

Define a schema:

```tsx
import { z } from 'zod';

// Define your schema in its own file
export const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  accountId: z.string().uuid('Invalid account ID'),
});
```

Then we define a service for crossing the network boundary:

```tsx
import { CreateNoteSchema } from '../schemas/notes.schemas.ts';
import * as z from 'zod';

export function createNotesService() {
  return new NotesService();
}

class NotesService {
  createNote(data: z.infer<CreateNoteSchema>) {
    const client = getSupabaseServerClient();
    
    const { data: note, error } = await client
      .from('notes')
      .insert({
        title: data.title,
        content: data.content,
        account_id: data.accountId,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
  }
}
```

Finally, we use Server Actions for exposing POST handlers:

```typescript
'use server';

import { enhanceAction } from '@portal/next/actions';
import { createNotesService } from '../notes.service.ts';

export const createNoteAction = enhanceAction(
  async function (data, user) {
    // data is automatically validated against the schema
    // user is automatically authenticated if auth: true
    
    const service = createNotesService();
    const logger = await getLogger();

    logger.info({
      userId: user.id,
    }, `Creating note...`);
    
    const { data: note, error } = await service.createNote(data);
    
    if (error) {
      logger.error({
        error: error.message
      }, `Error creating note`);

      throw error;
    }

    logger.info({
      noteId: note.id
    }, `Note successfully created`);
    
    return {
      success: true,
      note 
    };
  },
  {
    auth: true, // Require authentication (true by default, can omit)
    schema: CreateNoteSchema, // Validate input with Zod
  },
);
```

### Server Action Examples

- Personal settings: `@apps/web/app/home/(user)/settings/_lib/server/server-actions.ts`

### Server Action Options

```typescript
export const myAction = enhanceAction(
  async function (data, user) {
    // data: validated input data
    // user: authenticated user (if auth: true)
    
    return { success: true };
  },
  {
    auth: true, // Require authentication (default: false)
    schema: MySchema, // Zod schema for validation (optional)
    // Additional options available
  },
);
```

## Route Handlers (API Routes)

Use `enhanceRouteHandler` from `@packages/next/src/routes/index.ts`.

### Guidelines

- Use when data must be exposed to externally
- Use for receiving requests from external clients (such as webhooks)
- Can be used for fetching data to client side fetchers (such as React Query) if cannot use client-side Supabase queries

### Usage

```typescript
import { enhanceRouteHandler } from '@portal/next/routes';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define your schema
const CreateItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const POST = enhanceRouteHandler(
  async function ({ body, user, request }) {
    // body is validated against schema
    // user is available if auth: true
    // request is the original NextRequest
    
    const client = getSupabaseServerClient();
    
    const { data, error } = await client
      .from('items')
      .insert({
        name: body.name,
        description: body.description,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  },
  {
    auth: true, // Require authentication
    schema: CreateItemSchema, // Validate request body
  },
);

export const GET = enhanceRouteHandler(
  async function ({ user, request }) {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '10';
    
    const client = getSupabaseServerClient();
    
    const { data, error } = await client
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .limit(parseInt(limit));
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch items' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  },
  {
    auth: true,
    // No schema needed for GET requests
  },
);
```

### Route Handler Options

```typescript
export const POST = enhanceRouteHandler(
  async function ({ body, user, request }) {
    // Handler function
    return NextResponse.json({ success: true });
  },
  {
    auth: true, // Require authentication (default: false)
    schema: MySchema, // Zod schema for body validation (optional)
    // Additional options available
  },
);
```

## Revalidation

- Use `revalidatePath` for revalidating data after a migration.
- Avoid calling `router.refresh()` or `router.push()` following a Server Action. Use `revalidatePath` and `redirect` from the server action instead.

## Error Handling Patterns

### Server Actions with Error Handling

```typescript
export const createNoteAction = enhanceAction(
  async function (data, user) {
    const logger = await getLogger();
    const ctx = { name: 'create-note', userId: user.id };
    
    try {
      logger.info(ctx, 'Creating note');
      
      const client = getSupabaseServerClient();
      
      const { data: note, error } = await client
        .from('notes')
        .insert({
          title: data.title,
          content: data.content,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        logger.error({ ...ctx, error }, 'Failed to create note');
        throw error;
      }
      
      logger.info({ ...ctx, noteId: note.id }, 'Note created successfully');
      
      return { success: true, note };
    } catch (error) {
      if (!isRedirectError(error)) {
        logger.error({ ...ctx, error }, 'Create note action failed');
        throw error;
      }
    }
  },
  {
    auth: true,
    schema: CreateNoteSchema,
  },
);
```


### Server Action Redirects - Client Handling

When server actions call `redirect()`, it throws a special error that should NOT be treated as a failure:

```typescript
import { isRedirectError } from 'next/dist/client/components/redirect-error';

async function handleSubmit(formData: FormData) {
  try {
    await myServerAction(formData);
  } catch (error) {
    // Don't treat redirects as errors
    if (!isRedirectError(error)) {
      // Handle actual errors
      toast.error('Something went wrong');
    }
  }
}

### Route Handler with Error Handling

```typescript
export const POST = enhanceRouteHandler(
  async function ({ body, user }) {
    const logger = await getLogger();
    const ctx = { name: 'api-create-item', userId: user.id };
    
    try {
      logger.info(ctx, 'Processing API request');
      
      // Process request
      const result = await processRequest(body, user);
      
      logger.info({ ...ctx, result }, 'API request successful');
      
      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      logger.error({ ...ctx, error }, 'API request failed');
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid input data' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  {
    auth: true,
    schema: CreateItemSchema,
  },
);
```

## Client-Side Integration

### Using Server Actions in Components

```tsx
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@portal/ui/sonner';
import { Button } from '@portal/ui/button';

import { createNoteAction } from './actions';
import { CreateNoteSchema } from './schemas';

function CreateNoteForm() {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });
  
  const onSubmit = (data) => {
    startTransition(async () => {
      try {
        const result = await createNoteAction(data);
        
        if (result.success) {
          toast.success('Note created successfully!');
          form.reset();
        }
      } catch (error) {
        toast.error('Failed to create note');
        console.error('Create note error:', error);
      }
    });
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Note'}
      </Button>
    </form>
  );
}
```

NB: When using `redirect`, we must handle it using `isRedirectError` otherwise we display an error after the server action succeeds

### Using Route Handlers with Fetch

```typescript
'use client';

async function createItem(data: CreateItemInput) {
  const response = await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create item');
  }
  
  return response.json();
}

// Usage in component
const handleCreateItem = async (data) => {
  try {
    const result = await createItem(data);
    toast.success('Item created successfully!');
    return result;
  } catch (error) {
    toast.error('Failed to create item');
    throw error;
  }
};
```

### Authorization Checks

```typescript
export const deleteAccountAction = enhanceAction(
  async function (data, user) {
    const client = getSupabaseServerClient();
    
    // Verify user owns the account
    const { data: account, error } = await client
      .from('accounts')
      .select('id, primary_owner_user_id')
      .eq('id', data.accountId)
      .single();
    
    if (error || !account) {
      throw new Error('Account not found');
    }
    
    if (account.primary_owner_user_id !== user.id) {
      throw new Error('Only account owners can delete accounts');
    }
    
    // Additional checks
    const hasActiveSubscription = await client
      .rpc('has_active_subscription', { account_id: data.accountId });
    
    if (hasActiveSubscription) {
      throw new Error('Cannot delete account with active subscription');
    }
    
    // Proceed with deletion
    await deleteAccount(data.accountId);
    
    return { success: true };
  },
  {
    auth: true,
    schema: DeleteAccountSchema,
  },
);
```
import { NextResponse } from 'next/server';

// This would typically come from a database
const changelogEntries = [
  {
    id: '1',
    version: 'v1.2.0',
    date: '2023-07-15',
    category: 'Portal',
    changes: [
      { type: 'feature', description: 'Added new Network Diagnostics tool' },
      {
        type: 'improvement',
        description: 'Enhanced performance of the Linux Development Environment'
      },
      {
        type: 'bugfix',
        description:
          'Fixed issue with user profile updates not saving correctly'
      }
    ]
  },
  {
    id: '2',
    version: 'v1.1.5',
    date: '2023-06-30',
    category: 'Wiki',
    changes: [
      {
        type: 'security',
        description:
          'Implemented additional security measures for the Wiki editing system'
      },
      {
        type: 'improvement',
        description: 'Updated Wiki search functionality for better results'
      },
      {
        type: 'bugfix',
        description: 'Resolved issues with Wiki page history tracking'
      }
    ]
  },
  {
    id: '3',
    version: 'v1.1.0',
    date: '2023-06-15',
    category: 'Tux',
    changes: [
      {
        type: 'feature',
        description: 'Introduced new Tux customization options'
      },
      {
        type: 'improvement',
        description: 'Optimized Tux animation performance'
      },
      { type: 'deprecation', description: 'Deprecated old Tux theming system' }
    ]
  },
  {
    id: '4',
    version: 'v1.0.5',
    date: '2023-05-30',
    category: 'Portal',
    changes: [
      { type: 'bugfix', description: 'Fixed critical bug in the XMPP server' },
      {
        type: 'improvement',
        description: 'Optimized database queries for faster page loads'
      },
      {
        type: 'feature',
        description: 'Added dark mode support across all pages'
      }
    ]
  }
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filterCategory = url.searchParams.get('filterCategory');
  const filterType = url.searchParams.get('filterType');

  let filteredEntries = changelogEntries;

  if (filterCategory && filterCategory !== 'All') {
    filteredEntries = filteredEntries.filter(
      (entry) => entry.category === filterCategory
    );
  }

  if (filterType && filterType !== 'all') {
    filteredEntries = filteredEntries.filter((entry) =>
      entry.changes.some((change) => change.type === filterType)
    );
  }

  return NextResponse.json(filteredEntries);
}

export async function POST(request: Request) {
  const newEntry = await request.json();

  const id = (changelogEntries.length + 1).toString();
  const entryWithId = { id, ...newEntry };

  changelogEntries.unshift(entryWithId);

  return NextResponse.json(entryWithId, { status: 201 });
}

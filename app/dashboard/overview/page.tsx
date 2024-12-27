// import OverViewPage from './_components/overview';

export const metadata = {
  title: 'Dashboard : Overview'
};

// export default function page() {
//   return <OverViewPage />;
// }

import { Users, BookOpen, GitCommit, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/stats-card';
import { BlogPostCarousel } from '@/components/blog-post-carousel';
import { WikiChanges } from '@/components/wiki-changes';
import type { WikiChange } from '@/components/wiki-changes';

const blogPosts = [
  {
    title: 'The Future of Linux Desktop',
    excerpt:
      'Exploring upcoming changes in the Linux desktop environment and what they mean for users.',
    author: { name: 'Alice Johnson' },
    date: '1d ago',
    link: '#'
  },
  {
    title: 'Mastering the Command Line',
    excerpt:
      'Essential tips and tricks to become a command line ninja in Linux.',
    author: { name: 'Bob Smith' },
    date: '3d ago',
    link: '#'
  },
  {
    title: 'Open Source Alternatives',
    excerpt:
      'Discover powerful open-source tools that can replace proprietary software.',
    author: { name: 'Charlie Brown' },
    date: '1w ago',
    link: '#'
  }
];

const wikiChanges: WikiChange[] = [
  {
    type: 'edit',
    title: 'Getting Started with Linux',
    user: 'JohnDoe',
    timestamp: '5m ago'
  },
  {
    type: 'new',
    title: 'Understanding Systemd',
    user: 'JaneSmith',
    timestamp: '1h ago'
  },
  {
    type: 'category',
    title: 'Networking',
    user: 'AdminUser',
    timestamp: '3h ago'
  },
  {
    type: 'edit',
    title: 'Package Management',
    user: 'LinuxPro',
    timestamp: '5h ago'
  },
  {
    type: 'new',
    title: 'Bash Scripting Guide',
    user: 'ScriptMaster',
    timestamp: '1d ago'
  }
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening in the All Things Linux community
          </p>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 px-4 py-2 text-white">
          <p className="text-xs font-medium">Member since</p>
          <p className="text-lg font-bold">January 2024</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Discord Members"
          value="9,001"
          icon={Users}
          trend={{ value: '+12% from last week', isPositive: true }}
        />
        <StatsCard
          title="Wiki Commits"
          value="123"
          icon={BookOpen}
          trend={{ value: '+8 new this week', isPositive: true }}
        />
        <StatsCard
          title="Git Commits"
          value="420"
          icon={GitCommit}
          description="Last updated 2 hours ago"
        />
        <StatsCard
          title="Donations"
          value="$1,337"
          icon={DollarSign}
          description="This month"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BlogPostCarousel posts={blogPosts} />
        <WikiChanges changes={wikiChanges} />
      </div>
    </div>
  );
}

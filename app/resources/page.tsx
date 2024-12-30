import {
  Book,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Newspaper,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const resources = [
  {
    title: 'Linux Documentation',
    description: 'Official documentation and user guides',
    icon: Book,
    items: [
      {
        title: 'Getting Started Guide',
        description: "Complete beginner's guide to Linux",
        link: '#',
        badge: 'Recommended'
      },
      {
        title: 'Command Line Basics',
        description: 'Essential terminal commands and usage',
        link: '#'
      },
      {
        title: 'System Administration',
        description: 'Managing users, services, and system resources',
        link: '#',
        badge: 'Advanced'
      }
    ]
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides and courses',
    icon: Video,
    items: [
      {
        title: 'Linux Fundamentals',
        description: 'Video series covering Linux basics',
        link: '#',
        badge: 'Beginner'
      },
      {
        title: 'Shell Scripting',
        description: 'Learn to automate tasks with bash',
        link: '#'
      },
      {
        title: 'Server Setup',
        description: 'Configure and secure your Linux server',
        link: '#',
        badge: 'Popular'
      }
    ]
  },
  {
    title: 'Community Wiki',
    description: 'User-contributed guides and tutorials',
    icon: BookOpen,
    items: [
      {
        title: 'Troubleshooting Guide',
        description: 'Common issues and solutions',
        link: '#',
        badge: 'Updated'
      },
      {
        title: 'Software Recommendations',
        description: 'Community-tested applications',
        link: '#'
      },
      {
        title: 'Tips & Tricks',
        description: 'Useful Linux tips from the community',
        link: '#'
      }
    ]
  },
  {
    title: 'Learning Paths',
    description: 'Structured learning resources',
    icon: GraduationCap,
    items: [
      {
        title: 'Linux Essentials',
        description: 'Core concepts and skills',
        link: '#',
        badge: 'Beginner'
      },
      {
        title: 'DevOps Path',
        description: 'Linux in modern DevOps',
        link: '#',
        badge: 'Advanced'
      },
      {
        title: 'Security Focus',
        description: 'Linux security and hardening',
        link: '#'
      }
    ]
  },
  {
    title: 'Technical Articles',
    description: 'In-depth technical content',
    icon: FileText,
    items: [
      {
        title: 'Performance Tuning',
        description: 'Optimize your Linux system',
        link: '#'
      },
      {
        title: 'Container Guide',
        description: 'Working with Docker and containers',
        link: '#',
        badge: 'Popular'
      },
      {
        title: 'Network Configuration',
        description: 'Advanced networking topics',
        link: '#'
      }
    ]
  },
  {
    title: 'Latest Updates',
    description: 'Recent articles and news',
    icon: Newspaper,
    items: [
      {
        title: 'Kernel Updates',
        description: 'Latest Linux kernel changes',
        link: '#',
        badge: 'New'
      },
      {
        title: 'Security Advisories',
        description: 'Recent security updates',
        link: '#',
        badge: 'Important'
      },
      {
        title: 'Community News',
        description: 'Updates from the Linux community',
        link: '#'
      }
    ]
  }
];

export default function ResourcesPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive collection of Linux learning materials and
            documentation
          </p>
        </div>
      </div>

      <Alert variant="default" className="border-none bg-muted">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Contribution</AlertTitle>
        <AlertDescription>
          Want to contribute to our resources? Join our community and help
          improve our documentation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((section) => (
          <Card
            key={section.title}
            className="flex flex-col border-muted bg-card"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                {section.items.map((item, index) => (
                  <div key={index} className="group flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-medium leading-none">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      className="h-8 justify-start px-2 text-primary hover:text-primary"
                      asChild
                    >
                      <a href={item.link} className="flex items-center gap-1">
                        <span className="text-xs">Read more</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

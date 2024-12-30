import {
  Terminal,
  Code2,
  Network,
  AlertCircle,
  Check,
  FileText,
  PenToolIcon as ToolIcon,
  Archive,
  ChevronRight
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const tools = [
  {
    title: 'Linux Development Environment',
    description:
      'Pre-configured development environment with popular Linux tools',
    icon: Terminal,
    status: 'active',
    features: ['gcc/g++', 'Python', 'Node.js', 'Rust', 'Go']
  },
  {
    title: 'Code Playground',
    description: 'Online IDE for testing and sharing Linux-related code',
    icon: Code2,
    status: 'active',
    features: [
      'Multiple languages',
      'Real-time collaboration',
      'Share snippets',
      'Integrated terminal'
    ]
  },
  {
    title: 'Pastebin Service',
    description:
      'Quickly share code snippets and text with syntax highlighting',
    icon: FileText,
    status: 'active',
    features: [
      'Syntax highlighting',
      'Custom URLs',
      'Expiration options',
      'Private pastes'
    ]
  },
  {
    title: 'Network Diagnostics',
    description:
      'Tools for diagnosing network issues and monitoring connections',
    icon: Network,
    status: 'active',
    features: ['Ping test', 'DNS lookup', 'Port scanner', 'Network monitor']
  },
  {
    title: 'Toolbox',
    description:
      'A collection of text manipulation tools, encoders, decoders, and more',
    icon: ToolIcon,
    status: 'active',
    features: [
      'Text encoders/decoders',
      'Data generators',
      'Format parsers',
      'Language translators'
    ]
  },
  {
    title: 'ISO Archive',
    description:
      'Comprehensive archive of rare and old Linux distribution ISOs',
    icon: Archive,
    status: 'coming-soon',
    features: [
      'Extensive collection',
      'Searchable database',
      'Version history',
      'Direct downloads'
    ]
  }
];

export default function ToolsPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
          <p className="text-sm text-muted-foreground">
            Access our collection of Linux tools and utilities
          </p>
        </div>
      </div>

      <Alert variant="default" className="border-none bg-muted">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Beta Program</AlertTitle>
        <AlertDescription>
          Some tools are in beta. Join our Discord to become a beta tester and
          get early access.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.title} className="flex flex-col border-muted bg-card">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="rounded-lg bg-primary/10 p-2">
                <tool.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {tool.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-2">
                {tool.features.map((feature) => (
                  <div
                    key={feature}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    <Check className="h-3 w-3 text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant={tool.status === 'coming-soon' ? 'outline' : 'default'}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={tool.status === 'coming-soon'}
              >
                {tool.status === 'coming-soon' ? (
                  <span>Coming Soon</span>
                ) : (
                  <>
                    Launch
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

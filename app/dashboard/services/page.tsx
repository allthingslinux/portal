import {
  Mail,
  BookOpen,
  Terminal,
  Server,
  Shield,
  AlertCircle
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
import { TooltipProvider } from '@/components/ui/tooltip';
import { ServiceStatusBadge } from '@/components/service-status-badge';
import { ServiceUsageChart } from '@/components/service-usage-chart';

export default function ServicesPage() {
  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage your All Things Linux services and accounts
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Scheduled Maintenance</AlertTitle>
          <AlertDescription>
            Email services will undergo maintenance on Jan 28, 2024 from 2-4am
            UTC.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <CardTitle>Email</CardTitle>
                </div>
                <ServiceStatusBadge
                  status="operational"
                  lastChecked="2 minutes ago"
                />
              </div>
              <CardDescription>your.name@atl.tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ServiceUsageChart used={2.5} total={10} unit="GB" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Inbox Size</p>
                  <p className="font-medium">2.5 GB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Aliases</p>
                  <p className="font-medium">3/5 Used</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Manage Email
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-4 w-4" />
                  <CardTitle>Shell Access</CardTitle>
                </div>
                <ServiceStatusBadge
                  status="operational"
                  lastChecked="5 minutes ago"
                />
              </div>
              <CardDescription>username.atl.dev</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ServiceUsageChart used={15} total={50} unit="GB" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">CPU Usage</p>
                  <p className="font-medium">25%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Memory</p>
                  <p className="font-medium">1.2/2 GB</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Access Console
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <CardTitle>Wiki Access</CardTitle>
                </div>
                <ServiceStatusBadge
                  status="operational"
                  lastChecked="1 minute ago"
                />
              </div>
              <CardDescription>Contributor Account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Words</p>
                  <p className="font-medium">15,230</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Articles Created</p>
                  <p className="font-medium">7</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Edits</p>
                  <p className="font-medium">53</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Views</p>
                  <p className="font-medium">1,205</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Dashboard
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <CardTitle>Web Hosting</CardTitle>
                </div>
                <ServiceStatusBadge status="maintenance" />
              </div>
              <CardDescription>Host your projects with us</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                <li>Custom domain support</li>
                <li>Automatic SSL certificates</li>
                <li>1GB storage included</li>
                <li>CI/CD integration</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Request Access</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <CardTitle>VPN Service</CardTitle>
                </div>
                <ServiceStatusBadge status="offline" />
              </div>
              <CardDescription>Secure internet access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                <li>No logs policy</li>
                <li>Multiple locations</li>
                <li>OpenVPN support</li>
                <li>Unlimited bandwidth</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Beta Program</CardTitle>
              <CardDescription>
                Get early access to new services and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our beta program is currently invite-only. Join our Discord
                server to learn more about upcoming opportunities to participate
                in beta testing.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Join Discord
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

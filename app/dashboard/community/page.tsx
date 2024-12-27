import {
  MessageSquare,
  Users,
  Share2,
  ExternalLink,
  Calendar,
  Gamepad2,
  Cpu,
  Sword,
  Bird,
  SignalIcon,
  ImageIcon,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const communityStats = {
  totalMembers: 5234,
  activeNow: 423,
  messagesLastWeek: 15678,
  newMembersLastWeek: 132
};

const socialLinks = [
  {
    platform: 'Bluesky',
    url: 'https://bsky.app/profile/allthingslinux.bsky.social',
    icon: Bird
  },
  {
    platform: 'Signal',
    url: '#',
    icon: SignalIcon
  },
  {
    platform: 'Pinterest',
    url: 'https://www.pinterest.com/allthingslinux/',
    icon: ImageIcon
  },
  {
    platform: 'Tumblr',
    url: 'https://allthingslinux.tumblr.com/',
    icon: Pencil
  }
];

export default function CommunityPage() {
  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-start gap-4">
              <Users className="mt-1 h-5 w-5" />
              <div>
                <h2 className="font-semibold">Community Highlight</h2>
                <p className="text-sm text-muted-foreground">
                  Join our weekly community call every Thursday at 18:00 UTC to
                  discuss the latest in Linux!
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Members
                  </span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {communityStats.totalMembers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all platforms
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Active Now
                  </span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {communityStats.activeNow}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Members online
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Messages
                  </span>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {communityStats.messagesLastWeek}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sent last week
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    New Members
                  </span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {communityStats.newMembersLastWeek}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined last week
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="rounded-lg border bg-card">
            <div className="flex flex-col border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 flex items-center gap-2 sm:mb-0">
                <Share2 className="h-4 w-4" />
                <h3 className="font-medium">Social Media</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <Button
                    key={link.platform}
                    variant="outline"
                    size="sm"
                    className="h-8 flex-grow sm:flex-grow-0"
                    asChild
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <link.icon className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only">
                        {link.platform}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <CardTitle>IRC Account</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Operational
                  </Badge>
                </div>
                <CardDescription>
                  Connect via Internet Relay Chat
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Your Nickname
                    </div>
                    <div className="font-medium">linuxfan123</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Server</div>
                    <div className="font-medium">irc.atl.tools</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Change Nickname
                  </Button>
                  <Button className="flex-1">
                    Web IRC Client
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <CardTitle>XMPP Account</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Operational
                  </Badge>
                </div>
                <CardDescription>
                  Extensible Messaging and Presence Protocol
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Your JID
                    </div>
                    <div className="font-medium">user@xmpp.atl.tools</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Server</div>
                    <div className="font-medium">xmpp.atl.tools</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Manage Account
                  </Button>
                  <Button className="flex-1">
                    Web XMPP Client
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="mb-6 text-lg font-semibold">Upcoming Events</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5" />
                      <CardTitle className="text-2xl font-semibold">
                        SuperTuxKart Saturday
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    Join us for a fun-filled racing tournament!
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Saturday, July 15, 2023</span>
                  </div>
                  <p className="min-h-[2.5rem] text-sm">
                    Compete with fellow Linux enthusiasts in SuperTuxKart.
                    Prizes for top racers!
                  </p>
                  <div className="flex-1" />
                  <Button className="mt-auto w-full">Register Now</Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      <CardTitle className="text-2xl font-semibold">
                        Raspberry Pi Giveaway
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription>Win a Raspberry Pi Model 5</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ends on July 31, 2023</span>
                  </div>
                  <p className="min-h-[2.5rem] text-sm">
                    Enter our giveaway for a chance to win a Raspberry Pi 5,
                    perfect for your next project!
                  </p>
                  <div className="flex-1" />
                  <Button className="mt-auto w-full">Enter Giveaway</Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sword className="h-5 w-5" />
                      <CardTitle className="text-2xl font-semibold">
                        Minecraft Hunger Games
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    Survival of the fittest in our Linux-themed Minecraft server
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Sunday, August 6, 2023</span>
                  </div>
                  <p className="min-h-[2.5rem] text-sm">
                    Battle it out in our custom Minecraft Hunger Games map!
                  </p>
                  <div className="flex-1" />
                  <Button className="mt-auto w-full">Join Server</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

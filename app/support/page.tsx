import {
  Mail,
  FileQuestion,
  Users,
  Lightbulb,
  ExternalLink,
  MessageCircle,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const supportOptions = [
  {
    title: 'Discord Community',
    description:
      'Join our Discord server for community support and discussions',
    icon: MessageCircle,
    action: 'Join Server',
    availability: 'Active 24/7'
  },
  {
    title: 'Email Support',
    description: "Send us an email and we'll get back to you within 24 hours",
    icon: Mail,
    action: 'Send Email',
    availability: 'Response within 24 hours'
  },
  {
    title: 'Support Ticket',
    description: 'Create a ticket for more complex issues or feature requests',
    icon: Ticket,
    action: 'Create Ticket',
    availability: 'Monitored during business hours'
  },
  {
    title: 'Knowledge Base',
    description:
      'Find answers to common questions in our extensive documentation',
    icon: FileQuestion,
    action: 'Browse Articles',
    availability: 'Self-service'
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users and share knowledge',
    icon: Users,
    action: 'Join Discussion',
    availability: '24/7 peer support'
  },
  {
    title: 'Feature Requests',
    description: 'Suggest new features or improvements',
    icon: Lightbulb,
    action: 'Submit Idea',
    availability: 'We review weekly'
  }
];

const faqItems = [
  {
    question: 'How do I reset my password?',
    answer:
      "To reset your password, go to the login page and click on the 'Forgot Password' link. Follow the instructions sent to your email to create a new password."
  },
  {
    question: 'Can I use the platform on mobile devices?',
    answer:
      'Yes, our platform is fully responsive and can be accessed on smartphones and tablets through your web browser. We also have mobile apps available for iOS and Android.'
  },
  {
    question: 'How often is the content updated?',
    answer:
      'We update our content regularly. Major updates are typically released on a monthly basis, while minor updates and bug fixes are pushed more frequently.'
  },
  {
    question: 'Is there a limit to how many projects I can create?',
    answer:
      'The number of projects you can create depends on your subscription plan. Free users can create up to 3 projects, while paid plans offer unlimited projects.'
  },
  {
    question: 'How can I cancel my subscription?',
    answer:
      "To cancel your subscription, go to your Account Settings and select the 'Subscription' tab. Click on 'Cancel Subscription' and follow the prompts. Your access will continue until the end of your current billing period."
  }
];

export default function SupportPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Support</h2>
        <p className="text-muted-foreground">
          Get help and support for your All Things Linux experience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {supportOptions.map((option) => (
          <Card key={option.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <option.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{option.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{option.description}</CardDescription>
              <p className="mt-2 text-sm text-muted-foreground">
                {option.availability}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                {option.action}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All FAQs</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Can't find what you're looking for?
        </h3>
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              Send us a message and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';

interface FeedItemProps {
  title: string;
  excerpt: string;
  author?: {
    name: string;
    avatar?: string;
  };
  date: string;
  type: 'wiki' | 'blog' | 'announcement';
  link: string;
}

export function FeedItem({
  title,
  excerpt,
  author,
  date,
  type,
  link
}: FeedItemProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-grow">
        <div className="flex items-center justify-between">
          {author ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          )}
          <span className="flex items-center text-xs text-muted-foreground">
            <CalendarDays className="mr-1 h-3 w-3" />
            {date}
          </span>
        </div>
        <CardTitle className="mt-2 line-clamp-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="h-auto w-full justify-start p-0">
          Read more
        </Button>
      </CardFooter>
    </Card>
  );
}

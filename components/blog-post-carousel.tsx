'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPost {
  title: string;
  excerpt: string;
  author?: {
    name: string;
    avatar?: string;
  };
  date: string;
  link: string;
}

interface BlogPostCarouselProps {
  posts: BlogPost[];
}

export function BlogPostCarousel({ posts }: BlogPostCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + posts.length) % posts.length
    );
  };

  return (
    <div className="relative">
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Latest Blog Posts</CardTitle>
          <div className="flex space-x-2">
            <Button size="icon" variant="outline" onClick={prevSlide}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={nextSlide}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-[200px]">
            {posts.map((post, index) => (
              <div
                key={index}
                className={`absolute left-0 top-0 h-full w-full transition-opacity duration-300 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <h3 className="mb-2 text-lg font-semibold">{post.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {post.author ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={post.author.avatar}
                            alt={post.author.name}
                          />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {post.author.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-medium">Anonymous</span>
                    )}
                  </div>
                  <span className="flex items-center text-xs text-muted-foreground">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    {post.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost" className="w-full justify-start p-0">
            <a href={posts[currentIndex].link}>Read full post</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

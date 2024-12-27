"use client";

import { AlertCircle, ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from 'react'

const changelogEntries = [
  {
    version: "v1.2.0",
    date: "2023-07-15",
    category: "Portal",
    changes: [
      { type: "feature", description: "Added new Network Diagnostics tool" },
      { type: "improvement", description: "Enhanced performance of the Linux Development Environment" },
      { type: "bugfix", description: "Fixed issue with user profile updates not saving correctly" },
    ]
  },
  {
    version: "v1.1.5",
    date: "2023-06-30",
    category: "Wiki",
    changes: [
      { type: "security", description: "Implemented additional security measures for the Wiki editing system" },
      { type: "improvement", description: "Updated Wiki search functionality for better results" },
      { type: "bugfix", description: "Resolved issues with Wiki page history tracking" },
    ]
  },
  {
    version: "v1.1.0",
    date: "2023-06-15",
    category: "Tux",
    changes: [
      { type: "feature", description: "Introduced new Tux customization options" },
      { type: "improvement", description: "Optimized Tux animation performance" },
      { type: "deprecation", description: "Deprecated old Tux theming system" },
    ]
  },
  {
    version: "v1.0.5",
    date: "2023-05-30",
    category: "Portal",
    changes: [
      { type: "bugfix", description: "Fixed critical bug in the XMPP server" },
      { type: "improvement", description: "Optimized database queries for faster page loads" },
      { type: "feature", description: "Added dark mode support across all pages" },
    ]
  },
]

const getChangeTypeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />
    case 'improvement':
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    case 'bugfix':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'security':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

const getChangeTypeBadge = (type: string) => {
  switch (type) {
    case 'feature':
      return <Badge variant="default">New Feature</Badge>
    case 'improvement':
      return <Badge variant="secondary">Improvement</Badge>
    case 'bugfix':
      return <Badge variant="destructive">Bug Fix</Badge>
    case 'security':
      return <Badge variant="outline">Security Update</Badge>
    case 'deprecation':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Deprecation</Badge>
    default:
      return <Badge variant="outline">Other</Badge>
  }
}

const getFilterTitle = (category: string, type: string) => {
  const categoryText = category === "All" ? "All" : category
  const typeText = type === "all" ? "All Changes" : 
                  type === "feature" ? "New Features" :
                  type === "improvement" ? "Improvements" :
                  type === "bugfix" ? "Bug Fixes" : "Changes"
  
  return `${categoryText} — ${typeText}`
}

export default function ChangelogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedType, setSelectedType] = useState("all")

  const filteredEntries = changelogEntries.filter(entry => 
    (selectedCategory === "All" || entry.category === selectedCategory) &&
    (selectedType === "all" || entry.changes.some(change => change.type === selectedType))
  )

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Changelog</h1>
          <p className="text-sm text-muted-foreground">
            Keep track of updates and improvements to our platform
          </p>
        </div>
      </div>

      <Alert variant="default" className="bg-muted border-none">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Stay Updated</AlertTitle>
        <AlertDescription>
          Join our mailing list to receive notifications about new releases and important changes.
        </AlertDescription>
      </Alert>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Portal">Portal</TabsTrigger>
          <TabsTrigger value="Wiki">Wiki</TabsTrigger>
          <TabsTrigger value="Tux">Tux</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All Changes</TabsTrigger>
          <TabsTrigger value="feature">New Features</TabsTrigger>
          <TabsTrigger value="improvement">Improvements</TabsTrigger>
          <TabsTrigger value="bugfix">Bug Fixes</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border bg-muted/50 px-6 py-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {getFilterTitle(selectedCategory, selectedType)}
        </h2>
      </div>

      <div className="space-y-8">
        {filteredEntries.map((entry) => (
          <Card key={`${entry.category}-${entry.version}`} className="bg-card border-muted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle><code>{entry.version}</code></CardTitle>
                  <CardDescription><time>{entry.date}</time></CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {entry.changes.filter(change => selectedType === 'all' || change.type === selectedType).map((change, index) => (
                  <li key={index} className="flex items-start gap-4">
                    {getChangeTypeIcon(change.type)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getChangeTypeBadge(change.type)}
                      </div>
                      <p className="text-sm">{change.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  )
}


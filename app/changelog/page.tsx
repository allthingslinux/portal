'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface Change {
  type: string
  description: string
}

interface ChangelogEntry {
  id: string
  version: string
  date: string
  category: string
  changes: Change[]
}

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
  const categoryText = category === "All" ? "All Components" : category
  const typeText = type === "all" ? "All Changes" : 
                  type === "feature" ? "New Features" :
                  type === "improvement" ? "Improvements" :
                  type === "bugfix" ? "Bug Fixes" : "Changes"
  
  return `${categoryText} — ${typeText}`
}

const SkeletonChangelogEntry = () => (
  <Card className="bg-card border-muted">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-4">
        {[1, 2, 3].map((_, index) => (
          <li key={index} className="flex items-start gap-4">
            <Skeleton className="h-4 w-4 mt-1" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
)

export default function ChangelogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedType, setSelectedType] = useState("all")
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChangelog = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/changelog?filterCategory=${selectedCategory}&filterType=${selectedType}`)
        if (!response.ok) {
          throw new Error('Failed to fetch changelog data')
        }
        const data = await response.json()
        setChangelogEntries(data)
      } catch (err) {
        setError('An error occurred while fetching the changelog. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChangelog()
  }, [selectedCategory, selectedType])

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

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((_, index) => (
            <SkeletonChangelogEntry key={index} />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-8">
          {changelogEntries.map((entry) => (
            <Card key={entry.id} className="bg-card border-muted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>{entry.version}</CardTitle>
                    <CardDescription>{entry.date}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {entry.changes.map((change, index) => (
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
      )}

      {!isLoading && !error && changelogEntries.length === 0 && (
        <div className="text-center">
          <p>No changelog entries found for the selected filters.</p>
        </div>
      )}

      {!isLoading && !error && changelogEntries.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  )
}


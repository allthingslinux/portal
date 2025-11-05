'use client';

import { useState } from 'react';

import {
  EditIcon,
  FileTextIcon,
  MessageCircleIcon,
  SendIcon,
  StarIcon,
} from 'lucide-react';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Label } from '@portal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Switch } from '@portal/ui/switch';
import { Textarea } from '@portal/ui/textarea';

import {
  generateImportStatement,
  generatePropsString,
  useStoryControls,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface TextareaStoryControls {
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  resize: 'none' | 'vertical' | 'horizontal' | 'both';
  size: 'sm' | 'md' | 'lg';
  showCharCount: boolean;
  maxLength: number;
}

export default function TextareaStory() {
  const { controls, updateControl } = useStoryControls<TextareaStoryControls>({
    disabled: false,
    readonly: false,
    required: false,
    resize: 'vertical',
    size: 'md',
    showCharCount: false,
    maxLength: 500,
  });

  const [textValue, setTextValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [commentValue, setCommentValue] = useState('');

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        placeholder: 'Type your message here...',
        disabled: controls.disabled,
        readOnly: controls.readonly,
        required: controls.required,
        maxLength: controls.showCharCount ? controls.maxLength : undefined,
        className: `${sizeClasses[controls.size]} ${resizeClasses[controls.resize]}`,
      },
      {
        disabled: false,
        readOnly: false,
        required: false,
      },
    );

    const imports = generateImportStatement(
      ['Textarea'],
      '@portal/ui/textarea',
    );
    const labelImport = `\nimport { Label } from '@portal/ui/label';`;

    return `${imports}${labelImport}\n\nfunction MessageForm() {\n  const [message, setMessage] = useState('');\n\n  return (\n    <div className="space-y-2">\n      <Label htmlFor="message">Message</Label>\n      <Textarea\n        id="message"\n        value={message}\n        onChange={(e) => setMessage(e.target.value)}${propsString}\n      />\n      ${controls.showCharCount ? `<div className="text-xs text-muted-foreground text-right">\n        {message.length} / ${controls.maxLength}\n      </div>` : ''}\n    </div>\n  );\n}`;
  };

  const sizeClasses = {
    sm: 'min-h-[50px] text-sm',
    md: 'min-h-[80px] text-sm',
    lg: 'min-h-[120px] text-base',
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const controlsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Textarea Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Resize</label>
            <Select
              value={controls.resize}
              onValueChange={(value: TextareaStoryControls['resize']) =>
                updateControl('resize', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Size</label>
            <Select
              value={controls.size}
              onValueChange={(value: TextareaStoryControls['size']) =>
                updateControl('size', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Max Length: {controls.maxLength}
          </label>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={controls.maxLength}
            onChange={(e) => updateControl('maxLength', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="disabled"
              checked={controls.disabled}
              onCheckedChange={(checked) => updateControl('disabled', checked)}
            />
            <label htmlFor="disabled" className="text-sm">
              Disabled
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="readonly"
              checked={controls.readonly}
              onCheckedChange={(checked) => updateControl('readonly', checked)}
            />
            <label htmlFor="readonly" className="text-sm">
              Readonly
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={controls.required}
              onCheckedChange={(checked) => updateControl('required', checked)}
            />
            <label htmlFor="required" className="text-sm">
              Required
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showCharCount"
              checked={controls.showCharCount}
              onCheckedChange={(checked) =>
                updateControl('showCharCount', checked)
              }
            />
            <label htmlFor="showCharCount" className="text-sm">
              Character Count
            </label>
          </div>
        </div>

        {controls.showCharCount && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="mb-1 text-sm font-medium">Character Count:</p>
            <p className="font-mono text-sm">
              {textValue.length} / {controls.maxLength}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const previewContent = (
    <Card>
      <CardHeader>
        <CardTitle>Textarea Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-3 block text-base font-semibold">
              Basic Textarea
            </Label>

            <div className="space-y-2">
              <Textarea
                placeholder="Type your message here..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                disabled={controls.disabled}
                readOnly={controls.readonly}
                required={controls.required}
                maxLength={
                  controls.showCharCount ? controls.maxLength : undefined
                }
                className={`${sizeClasses[controls.size]} ${resizeClasses[controls.resize]}`}
              />

              {controls.showCharCount && (
                <div className="text-muted-foreground text-right text-xs">
                  {textValue.length} / {controls.maxLength}
                </div>
              )}

              <div className="text-muted-foreground text-sm">
                <p>
                  <strong>State:</strong>{' '}
                  {controls.disabled
                    ? 'Disabled'
                    : controls.readonly
                      ? 'Readonly'
                      : 'Active'}
                </p>
                <p>
                  <strong>Resize:</strong> {controls.resize}
                </p>
                <p>
                  <strong>Size:</strong> {controls.size}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-3 block text-base font-semibold">
              Quick Actions
            </Label>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTextValue('')}
                disabled={controls.disabled || controls.readonly}
              >
                Clear
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTextValue(
                    'This is a sample text for testing the textarea component. You can edit this text to see how the component behaves with different content lengths and styling options.',
                  )
                }
                disabled={controls.disabled || controls.readonly}
              >
                Fill Sample
              </Button>

              <Button
                size="sm"
                disabled={controls.disabled || !textValue.trim()}
              >
                <SendIcon className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      generatedCode={generateCode()}
      previewTitle="Interactive Textarea"
      previewDescription="Multi-line text input with customizable resize behavior and validation"
      controlsTitle="Configuration"
      controlsDescription="Adjust resize, size, validation, and behavior options"
      examples={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Textareas</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Default Textarea</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Label htmlFor="basic">Message</Label>
                  <Textarea id="basic" placeholder="Write your message..." />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With Character Limit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Label htmlFor="limited">Description (max 200 chars)</Label>
                  <Textarea
                    id="limited"
                    placeholder="Enter description..."
                    maxLength={200}
                  />
                  <div className="text-muted-foreground text-right text-xs">
                    0 / 200
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Form Examples</h3>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Form</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <input
                        type="text"
                        id="name"
                        className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <input
                        type="email"
                        id="email"
                        className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <input
                      type="text"
                      id="subject"
                      className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Subject line"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message *</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Tell us about your inquiry..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <Button className="w-full">
                    <SendIcon className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback Form</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-muted-foreground ml-2 text-sm">
                        5/5 stars
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="feedback">Your Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="What did you think about our service? Your feedback helps us improve..."
                      value={feedbackValue}
                      onChange={(e) => setFeedbackValue(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="suggestions">
                      Suggestions for Improvement
                    </Label>
                    <Textarea
                      id="suggestions"
                      placeholder="Any specific suggestions or features you'd like to see?"
                      className="min-h-[80px] resize-y"
                    />
                  </div>
                  <Button>Submit Feedback</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Different Sizes & States
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Size Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Small (min-h-50px)</Label>
                    <Textarea
                      placeholder="Small textarea..."
                      className="min-h-[50px] text-sm"
                    />
                  </div>
                  <div>
                    <Label>Medium (min-h-80px)</Label>
                    <Textarea
                      placeholder="Medium textarea..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label>Large (min-h-120px)</Label>
                    <Textarea
                      placeholder="Large textarea..."
                      className="min-h-[120px] text-base"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>States & Behaviors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Disabled</Label>
                    <Textarea
                      placeholder="This textarea is disabled"
                      disabled
                      value="Cannot edit this text"
                    />
                  </div>
                  <div>
                    <Label>Readonly</Label>
                    <Textarea
                      readOnly
                      value="This text is readonly and cannot be edited, but can be selected and copied."
                      className="cursor-default"
                    />
                  </div>
                  <div>
                    <Label>No Resize</Label>
                    <Textarea
                      placeholder="This textarea cannot be resized"
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Comments & Discussion
            </h3>
            <Card>
              <CardHeader>
                <CardTitle>
                  <MessageCircleIcon className="mr-2 inline h-5 w-5" />
                  Add Comment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium">
                    U
                  </div>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="What are your thoughts?"
                      value={commentValue}
                      onChange={(e) => setCommentValue(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground text-xs">
                        {commentValue.length > 0 &&
                          `${commentValue.length} characters`}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                        <Button size="sm" disabled={!commentValue.trim()}>
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample existing comments */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                      JD
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">John Doe</div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        Great article! Really helped me understand the concept
                        better.
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        2 hours ago
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                      SM
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Sarah Miller</div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        Thanks for sharing! I have a question about the
                        implementation details...
                      </div>
                      <div className="text-muted-foreground mt-1 text-xs">
                        4 hours ago
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Content Creation</h3>
            <Card>
              <CardHeader>
                <CardTitle>
                  <EditIcon className="mr-2 inline h-5 w-5" />
                  Write Article
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="article-title">Title</Label>
                  <input
                    type="text"
                    id="article-title"
                    className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter article title..."
                  />
                </div>
                <div>
                  <Label htmlFor="article-excerpt">Excerpt</Label>
                  <Textarea
                    id="article-excerpt"
                    placeholder="Write a brief summary of your article..."
                    className="min-h-[60px] resize-y"
                    maxLength={200}
                  />
                  <div className="text-muted-foreground text-right text-xs">
                    Max 200 characters
                  </div>
                </div>
                <div>
                  <Label htmlFor="article-content">Content</Label>
                  <Textarea
                    id="article-content"
                    placeholder="Write your article content here. You can use markdown for formatting..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="secondary">Markdown</Badge>
                    <Badge variant="outline">Auto-save enabled</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileTextIcon className="mr-2 h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button>Publish</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      apiReference={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Textarea Component</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Component</th>
                    <th className="p-2 text-left font-medium">Props</th>
                    <th className="p-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">Textarea</td>
                    <td className="p-2 font-mono">
                      All HTMLTextAreaElement props
                    </td>
                    <td className="p-2">Multi-line text input component</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Common Props</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Prop</th>
                    <th className="p-2 text-left font-medium">Type</th>
                    <th className="p-2 text-left font-medium">Default</th>
                    <th className="p-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">value</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Controlled value</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">onChange</td>
                    <td className="p-2 font-mono">
                      (e: ChangeEvent) ={'>'} void
                    </td>
                    <td className="p-2">-</td>
                    <td className="p-2">Change event handler</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">placeholder</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Placeholder text</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">disabled</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Disable the textarea</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">readOnly</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Make textarea read-only</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">required</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Mark as required field</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">rows</td>
                    <td className="p-2 font-mono">number</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Number of visible rows</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">cols</td>
                    <td className="p-2 font-mono">number</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Number of visible columns</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">maxLength</td>
                    <td className="p-2 font-mono">number</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Maximum character limit</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">minLength</td>
                    <td className="p-2 font-mono">number</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Minimum character requirement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Styling Classes</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Size Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">min-h-[50px] (small)</Badge>
                  <Badge variant="secondary">min-h-[80px] (default)</Badge>
                  <Badge variant="secondary">min-h-[120px] (large)</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Resize Options</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">resize-none</Badge>
                  <Badge variant="secondary">resize-y (vertical)</Badge>
                  <Badge variant="secondary">resize-x (horizontal)</Badge>
                  <Badge variant="secondary">resize (both)</Badge>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="overflow-x-auto text-sm">
                  {`// Size variants
<Textarea className="min-h-[50px] text-sm" />    // Small
<Textarea className="min-h-[80px]" />            // Medium  
<Textarea className="min-h-[120px] text-base" /> // Large

// Resize behavior
<Textarea className="resize-none" />    // No resize
<Textarea className="resize-y" />       // Vertical only
<Textarea className="resize-x" />       // Horizontal only
<Textarea className="resize" />         // Both directions

// Font styles
<Textarea className="font-mono" />      // Monospace font
<Textarea className="text-xs" />        // Extra small text
<Textarea className="text-lg" />        // Large text`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      }
      usageGuidelines={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Usage</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              The Textarea component is used for multi-line text input,
              supporting all standard HTML textarea attributes and properties.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { Textarea } from '@portal/ui/textarea';

function CommentForm() {
  const [comment, setComment] = useState('');

  return (
    <div className="space-y-2">
      <Label htmlFor="comment">Comment</Label>
      <Textarea
        id="comment"
        placeholder="Write your comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
      />
    </div>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Form Integration</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

function MessageForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Message</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter your message..."
                className="min-h-[120px] resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Your message will be reviewed before posting.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Send Message</Button>
    </form>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Character Counting</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`function TextareaWithCount() {
  const [text, setText] = useState('');
  const maxLength = 280;

  return (
    <div className="space-y-2">
      <Label>Tweet (max 280 characters)</Label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={maxLength}
        placeholder="What's happening?"
        className="resize-none"
      />
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Share your thoughts with the community
        </span>
        <span className={\`
          \${text.length > maxLength * 0.9 ? 'text-orange-500' : 'text-muted-foreground'}
          \${text.length === maxLength ? 'text-red-500' : ''}
        \`}>
          {text.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Best Practices</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">When to Use Textarea</h4>
                <p>
                  • Multi-line text input (comments, messages, descriptions)
                </p>
                <p>• Content that may exceed a single line</p>
                <p>• Free-form text where formatting isn't required</p>
                <p>• When users need to see their full input at once</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Sizing Guidelines</h4>
                <p>• Start with appropriate min-height for expected content</p>
                <p>• Allow vertical resizing for user preference</p>
                <p>• Consider fixed height for consistent layouts</p>
                <p>• Use resize-none for structured forms</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">User Experience</h4>
                <p>• Provide clear placeholder text with examples</p>
                <p>• Show character limits when they exist</p>
                <p>• Use proper labeling for accessibility</p>
                <p>• Consider auto-save for longer content</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Validation & Feedback</h4>
                <p>• Validate on blur rather than every keystroke</p>
                <p>• Show validation errors below the textarea</p>
                <p>• Use visual indicators for required fields</p>
                <p>• Provide helpful error messages with suggestions</p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

export { TextareaStory };

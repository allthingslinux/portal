'use client';

import {
  AlertCircleIcon,
  CheckCircleIcon,
  DownloadIcon,
  InfoIcon,
  SaveIcon,
  SendIcon,
  TrashIcon,
  UploadIcon,
  UserPlusIcon,
  XCircleIcon,
} from 'lucide-react';

import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Input } from '@portal/ui/input';
import { Label } from '@portal/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Toaster, toast } from '@portal/ui/sonner';
import { Switch } from '@portal/ui/switch';
import { Textarea } from '@portal/ui/textarea';

import {
  generateImportStatement,
  generatePropsString,
  useStoryControls,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface SonnerStoryControls {
  position:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center';
  variant: 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration: number;
  dismissible: boolean;
  richColors: boolean;
  expand: boolean;
  customTitle: string;
  customDescription: string;
}

export default function SonnerStory() {
  const { controls, updateControl } = useStoryControls<SonnerStoryControls>({
    position: 'bottom-right',
    variant: 'default',
    duration: 4000,
    dismissible: true,
    richColors: true,
    expand: false,
    customTitle: 'Custom notification',
    customDescription: 'This is a custom toast notification message.',
  });

  const generateCode = () => {
    const toasterPropsString = generatePropsString(
      {
        position: controls.position,
        richColors: controls.richColors,
        expand: controls.expand,
      },
      {
        position: 'bottom-right',
        richColors: false,
        expand: false,
      },
    );

    const toastOptions = generatePropsString(
      {
        description:
          controls.customDescription !==
          'This is a custom toast notification message.'
            ? `"${controls.customDescription}"`
            : undefined,
        duration: controls.duration !== 4000 ? controls.duration : undefined,
        dismissible: !controls.dismissible ? false : undefined,
      },
      {},
    );

    const imports = generateImportStatement(
      ['toast', 'Toaster'],
      '@portal/ui/sonner',
    );

    const toastCall =
      controls.variant === 'default'
        ? `toast('${controls.customTitle}'${toastOptions ? `, {${toastOptions} }` : ''})`
        : `toast.${controls.variant}('${controls.customTitle}'${toastOptions ? `, {${toastOptions} }` : ''})`;

    return `${imports}\n\n// Add Toaster to your app root\nfunction App() {\n  return (\n    <>\n      {/* Your app content */}\n      <Toaster${toasterPropsString} />\n    </>\n  );\n}\n\n// Use anywhere in your components\nfunction MyComponent() {\n  const showToast = () => {\n    ${toastCall};\n  };\n\n  return <button onClick={showToast}>Show Toast</button>;\n}`;
  };

  const showToast = () => {
    const options = {
      duration: controls.duration,
      dismissible: controls.dismissible,
    };

    switch (controls.variant) {
      case 'success':
        toast.success(controls.customTitle, {
          description: controls.customDescription,
          ...options,
        });
        break;
      case 'error':
        toast.error(controls.customTitle, {
          description: controls.customDescription,
          ...options,
        });
        break;
      case 'warning':
        toast.warning(controls.customTitle, {
          description: controls.customDescription,
          ...options,
        });
        break;
      case 'info':
        toast.info(controls.customTitle, {
          description: controls.customDescription,
          ...options,
        });
        break;
      case 'loading':
        toast.loading(controls.customTitle, {
          description: controls.customDescription,
          ...options,
        });
        break;
      default:
        toast(controls.customTitle, {
          description: controls.customDescription,
          ...options,
        });
    }
  };

  const controlsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Sonner Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Position</label>
            <Select
              value={controls.position}
              onValueChange={(value: SonnerStoryControls['position']) =>
                updateControl('position', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Variant</label>
            <Select
              value={controls.variant}
              onValueChange={(value: SonnerStoryControls['variant']) =>
                updateControl('variant', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="loading">Loading</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Duration (ms): {controls.duration}
          </label>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={controls.duration}
            onChange={(e) => updateControl('duration', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="dismissible"
              checked={controls.dismissible}
              onCheckedChange={(checked) =>
                updateControl('dismissible', checked)
              }
            />
            <label htmlFor="dismissible" className="text-sm">
              Dismissible
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="richColors"
              checked={controls.richColors}
              onCheckedChange={(checked) =>
                updateControl('richColors', checked)
              }
            />
            <label htmlFor="richColors" className="text-sm">
              Rich Colors
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="expand"
              checked={controls.expand}
              onCheckedChange={(checked) => updateControl('expand', checked)}
            />
            <label htmlFor="expand" className="text-sm">
              Expand
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customTitle">Custom Title</Label>

          <Input
            id="customTitle"
            value={controls.customTitle}
            onChange={(e) => updateControl('customTitle', e.target.value)}
            placeholder="Enter toast title..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customDescription">Custom Description</Label>

          <Textarea
            id="customDescription"
            value={controls.customDescription}
            onChange={(e) => updateControl('customDescription', e.target.value)}
            placeholder="Enter toast description..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const previewContent = (
    <Card>
      <CardHeader>
        <CardTitle>Sonner Preview</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-3 block text-base font-semibold">
              Test Toast Notification
            </Label>

            <div className="flex flex-col gap-3">
              <Button onClick={showToast} size="sm">
                Show {controls.variant} Toast
              </Button>

              <div className="text-muted-foreground text-sm">
                <p>
                  <strong>Position:</strong> {controls.position}
                </p>
                <p>
                  <strong>Duration:</strong> {controls.duration}ms
                </p>
                <p>
                  <strong>Dismissible:</strong>{' '}
                  {controls.dismissible ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label className="mb-3 block text-base font-semibold">
              Quick Actions
            </Label>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.success('Success!', {
                    description: 'Operation completed successfully.',
                  })
                }
              >
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Success
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.error('Error!', {
                    description: 'Something went wrong.',
                  })
                }
              >
                <XCircleIcon className="mr-2 h-4 w-4" />
                Error
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.warning('Warning!', {
                    description: 'Please check your input.',
                  })
                }
              >
                <AlertCircleIcon className="mr-2 h-4 w-4" />
                Warning
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.info('Info', {
                    description: 'Here is some information.',
                  })
                }
              >
                <InfoIcon className="mr-2 h-4 w-4" />
                Info
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const id = toast.loading('Loading...', {
                    description: 'Please wait...',
                  });
                  setTimeout(() => {
                    toast.success('Done!', {
                      id,
                      description: 'Loading completed.',
                    });
                  }, 2000);
                }}
              >
                Loading
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.dismiss()}
              >
                Dismiss All
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <ComponentStoryLayout
        preview={previewContent}
        controls={controlsContent}
        generatedCode={generateCode()}
        previewTitle="Interactive Sonner Toasts"
        previewDescription="Toast notifications with various styles and configurations"
        controlsTitle="Configuration"
        controlsDescription="Customize toast appearance and behavior"
        examples={
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Basic Toast Types</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Simple Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast('Simple message')}
                      className="w-full justify-start"
                    >
                      Basic Toast
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast('With description', {
                          description:
                            'Additional details about the notification.',
                        })
                      }
                      className="w-full justify-start"
                    >
                      With Description
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Messages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success('Success message')}
                      className="w-full justify-start"
                    >
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                      Success
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.error('Error message')}
                      className="w-full justify-start"
                    >
                      <XCircleIcon className="mr-2 h-4 w-4" />
                      Error
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Interactive Toasts</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>With Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast('File uploaded', {
                          description:
                            'Your file has been uploaded successfully.',
                          action: {
                            label: 'View',
                            onClick: () => console.log('View clicked'),
                          },
                        })
                      }
                      className="w-full justify-start"
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Upload Complete
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast('Confirm deletion', {
                          description: 'This action cannot be undone.',
                          action: {
                            label: 'Delete',
                            onClick: () =>
                              toast.success('Deleted successfully'),
                          },
                          cancel: {
                            label: 'Cancel',
                            onClick: () => toast.info('Cancelled'),
                          },
                        })
                      }
                      className="w-full justify-start"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete Item
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Promise States</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const promise = new Promise((resolve) =>
                          setTimeout(resolve, 2000),
                        );

                        toast.promise(promise, {
                          loading: 'Saving...',
                          success: 'Saved successfully!',
                          error: 'Failed to save',
                        });
                      }}
                      className="w-full justify-start"
                    >
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Save Data
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const promise = new Promise((_, reject) =>
                          setTimeout(
                            () => reject(new Error('Network error')),
                            2000,
                          ),
                        );

                        toast.promise(promise, {
                          loading: 'Sending...',
                          success: 'Sent successfully!',
                          error: 'Failed to send message',
                        });
                      }}
                      className="w-full justify-start"
                    >
                      <SendIcon className="mr-2 h-4 w-4" />
                      Send Message (Fail)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Real-world Examples
              </h3>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.success('User invited', {
                            description: 'Invitation sent to john@example.com',
                            action: {
                              label: 'Undo',
                              onClick: () => toast.info('Invitation cancelled'),
                            },
                          })
                        }
                        className="justify-start"
                      >
                        <UserPlusIcon className="mr-2 h-4 w-4" />
                        Invite User
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.warning('User role changed', {
                            description: 'John Doe is now an admin',
                            duration: 6000,
                          })
                        }
                        className="justify-start"
                      >
                        Role Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>File Operations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const downloadPromise = new Promise((resolve) =>
                            setTimeout(resolve, 3000),
                          );

                          toast.promise(downloadPromise, {
                            loading: 'Preparing download...',
                            success: 'Download ready',
                            error: 'Download failed',
                          });
                        }}
                        className="justify-start"
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.info('File shared', {
                            description: 'Link copied to clipboard',
                            duration: 3000,
                          })
                        }
                        className="justify-start"
                      >
                        Share File
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.error('Access denied', {
                            description:
                              "You don't have permission to access this file",
                            duration: 5000,
                          })
                        }
                        className="justify-start"
                      >
                        Access Error
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Advanced Usage</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Custom Styling & Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        let count = 0;
                        const id = toast.loading('Processing...', {
                          description: `Step ${count + 1} of 5`,
                        });

                        const interval = setInterval(() => {
                          count++;
                          if (count < 5) {
                            toast.loading('Processing...', {
                              id,
                              description: `Step ${count + 1} of 5`,
                            });
                          } else {
                            clearInterval(interval);
                            toast.success('Process complete!', {
                              id,
                              description: 'All steps completed successfully',
                            });
                          }
                        }, 1000);
                      }}
                      className="justify-start"
                    >
                      Multi-step Process
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast('Custom styled toast', {
                          description: 'With custom className',
                          className: 'border-l-4 border-l-blue-500',
                        })
                      }
                      className="justify-start"
                    >
                      Custom Style
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        }
        apiReference={
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Sonner Components</h3>
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
                      <td className="p-2 font-mono">Toaster</td>
                      <td className="p-2 font-mono">
                        position, theme, richColors, expand
                      </td>
                      <td className="p-2">Toast container component</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast</td>
                      <td className="p-2 font-mono">message, options</td>
                      <td className="p-2">Function to trigger toasts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Toast Functions</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium">Function</th>
                      <th className="p-2 text-left font-medium">Parameters</th>
                      <th className="p-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast()</td>
                      <td className="p-2 font-mono">message, options?</td>
                      <td className="p-2">Basic toast notification</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast.success()</td>
                      <td className="p-2 font-mono">message, options?</td>
                      <td className="p-2">Success toast with green styling</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast.error()</td>
                      <td className="p-2 font-mono">message, options?</td>
                      <td className="p-2">Error toast with red styling</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast.warning()</td>
                      <td className="p-2 font-mono">message, options?</td>
                      <td className="p-2">Warning toast with yellow styling</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast.info()</td>
                      <td className="p-2 font-mono">message, options?</td>
                      <td className="p-2">Info toast with blue styling</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast.loading()</td>
                      <td className="p-2 font-mono">message, options?</td>
                      <td className="p-2">Loading toast with spinner</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast.promise()</td>
                      <td className="p-2 font-mono">promise, messages</td>
                      <td className="p-2">Promise-based toast states</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">toast.dismiss()</td>
                      <td className="p-2 font-mono">id?</td>
                      <td className="p-2">Dismiss toast(s)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Toast Options</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium">Option</th>
                      <th className="p-2 text-left font-medium">Type</th>
                      <th className="p-2 text-left font-medium">Default</th>
                      <th className="p-2 text-left font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">description</td>
                      <td className="p-2 font-mono">string</td>
                      <td className="p-2">-</td>
                      <td className="p-2">Additional description text</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">duration</td>
                      <td className="p-2 font-mono">number</td>
                      <td className="p-2">4000</td>
                      <td className="p-2">Auto dismiss time in milliseconds</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">dismissible</td>
                      <td className="p-2 font-mono">boolean</td>
                      <td className="p-2">true</td>
                      <td className="p-2">Allow manual dismissal</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">action</td>
                      <td className="p-2 font-mono">ActionButton</td>
                      <td className="p-2">-</td>
                      <td className="p-2">Primary action button</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">cancel</td>
                      <td className="p-2 font-mono">ActionButton</td>
                      <td className="p-2">-</td>
                      <td className="p-2">Cancel action button</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">id</td>
                      <td className="p-2 font-mono">string | number</td>
                      <td className="p-2">auto</td>
                      <td className="p-2">Unique identifier for updates</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">className</td>
                      <td className="p-2 font-mono">string</td>
                      <td className="p-2">-</td>
                      <td className="p-2">Additional CSS classes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Toaster Props</h3>
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
                      <td className="p-2 font-mono">position</td>
                      <td className="p-2 font-mono">Position</td>
                      <td className="p-2">'bottom-right'</td>
                      <td className="p-2">Toast container position</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">theme</td>
                      <td className="p-2 font-mono">
                        'light' | 'dark' | 'system'
                      </td>
                      <td className="p-2">'system'</td>
                      <td className="p-2">Theme preference</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">richColors</td>
                      <td className="p-2 font-mono">boolean</td>
                      <td className="p-2">false</td>
                      <td className="p-2">Enable colored backgrounds</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">expand</td>
                      <td className="p-2 font-mono">boolean</td>
                      <td className="p-2">false</td>
                      <td className="p-2">Expand toasts by default</td>
                    </tr>
                    <tr className="border-border/50 border-b">
                      <td className="p-2 font-mono">visibleToasts</td>
                      <td className="p-2 font-mono">number</td>
                      <td className="p-2">3</td>
                      <td className="p-2">Number of visible toasts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
        usageGuidelines={
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Setup & Basic Usage
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Sonner provides a simple and powerful toast notification system.
                Add the Toaster component to your app root and use the toast
                function to trigger notifications.
              </p>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="overflow-x-auto text-sm">
                  {`import { Toaster, toast } from '@portal/ui/sonner';

// Add to your app root (layout.tsx or _app.tsx)
function App() {
  return (
    <>
      {/* Your app content */}
      <Toaster position="bottom-right" />
    </>
  );
}

// Use anywhere in your components
function MyComponent() {
  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Saved successfully!');
    } catch (error) {
      toast.error('Failed to save', {
        description: error.message,
      });
    }
  };

  return <button onClick={handleSave}>Save</button>;
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Promise Integration
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="overflow-x-auto text-sm">
                  {`// Automatic loading/success/error states
const handleAsync = () => {
  const promise = fetch('/api/data').then(res => res.json());
  
  toast.promise(promise, {
    loading: 'Fetching data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data',
  });
};

// With custom promise handling
const handleUpload = async (file: File) => {
  const uploadPromise = uploadFile(file);
  
  toast.promise(uploadPromise, {
    loading: 'Uploading file...',
    success: (data) => \`File uploaded: \${data.filename}\`,
    error: (err) => \`Upload failed: \${err.message}\`,
  });
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Interactive Toasts</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <pre className="overflow-x-auto text-sm">
                  {`// With action buttons
toast('File uploaded', {
  description: 'Your file has been uploaded successfully.',
  action: {
    label: 'View',
    onClick: () => window.open('/files/123'),
  },
});

// With confirmation
toast('Delete item?', {
  description: 'This action cannot be undone.',
  action: {
    label: 'Delete',
    onClick: () => {
      deleteItem();
      toast.success('Item deleted');
    },
  },
  cancel: {
    label: 'Cancel',
    onClick: () => toast.dismiss(),
  },
});

// Updating existing toasts
const loadingId = toast.loading('Processing...');

// Later update the same toast
toast.success('Processing complete!', { id: loadingId });`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Best Practices</h3>
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">When to Use Toasts</h4>
                  <p>• Confirmation of user actions (save, delete, send)</p>
                  <p>
                    • Non-critical errors that don't require immediate attention
                  </p>
                  <p>• Status updates for background processes</p>
                  <p>• Temporary information that expires automatically</p>
                </div>

                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">Toast Content Guidelines</h4>
                  <p>• Keep messages concise and scannable</p>
                  <p>
                    • Use action-oriented language ("Saved", "Sent", "Failed")
                  </p>
                  <p>• Provide context in descriptions when helpful</p>
                  <p>• Include recovery actions for error states</p>
                </div>

                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">UX Considerations</h4>
                  <p>
                    • Don't overwhelm users with too many simultaneous toasts
                  </p>
                  <p>
                    • Use appropriate variants (success, error, warning, info)
                  </p>
                  <p>• Consider toast positioning based on your app layout</p>
                  <p>• Provide dismiss options for persistent toasts</p>
                </div>

                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">Accessibility</h4>
                  <p>• Toasts are announced to screen readers automatically</p>
                  <p>• Use semantic colors and icons for different states</p>
                  <p>• Ensure sufficient contrast for text and backgrounds</p>
                  <p>• Provide keyboard access to action buttons</p>
                </div>
              </div>
            </div>
          </div>
        }
      />
      <Toaster
        position={controls.position}
        richColors={controls.richColors}
        expand={controls.expand}
      />
    </>
  );
}

export { SonnerStory };

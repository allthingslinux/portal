'use client';

import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { FileUploader } from '@portal/ui/file-uploader';
import { Label } from '@portal/ui/label';
import { Separator } from '@portal/ui/separator';
import { toast } from '@portal/ui/sonner';
import { Switch } from '@portal/ui/switch';

import { generatePropsString, useStoryControls } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';
import { SimpleStorySelect } from './story-select';

// Mock Supabase client for the story
const createMockSupabaseClient = () => ({
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File, options: any) => {
        // Simulate upload delay
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 2000),
        );

        // Simulate occasional upload errors
        if (Math.random() < 0.1) {
          return {
            error: {
              message: 'Upload failed: Network error',
            },
          };
        }

        return {
          error: null,
          data: {
            path: `${bucket}/${path}`,
          },
        };
      },
    }),
  },
});

interface FileUploaderControls {
  maxFiles: number;
  maxFileSize: number; // in MB for easier control
  allowedMimeTypes: 'images' | 'documents' | 'all';
  showSuccessToast: boolean;
}

const maxFilesOptions = [
  { value: '1', label: '1 file', description: 'Single file upload' },
  { value: '3', label: '3 files', description: 'Small batch' },
  { value: '5', label: '5 files', description: 'Medium batch' },
  { value: '10', label: '10 files', description: 'Large batch' },
];

const maxFileSizeOptions = [
  { value: '1', label: '1 MB', description: 'Small files' },
  { value: '5', label: '5 MB', description: 'Medium files' },
  { value: '10', label: '10 MB', description: 'Large files' },
  { value: '50', label: '50 MB', description: 'Very large files' },
];

const mimeTypeOptions = [
  { value: 'images', label: 'Images only', description: 'image/* types' },
  {
    value: 'documents',
    label: 'Documents',
    description: 'pdf, doc, txt files',
  },
  { value: 'all', label: 'All types', description: 'No restrictions' },
];

const getMimeTypes = (type: string): string[] => {
  switch (type) {
    case 'images':
      return ['image/*'];
    case 'documents':
      return [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];
    case 'all':
    default:
      return [];
  }
};

export function FileUploaderStory() {
  const { controls, updateControl } = useStoryControls<FileUploaderControls>({
    maxFiles: 3,
    maxFileSize: 5, // MB
    allowedMimeTypes: 'images',
    showSuccessToast: true,
  });

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [mockClient] = useState(() => createMockSupabaseClient());

  const handleUploadSuccess = (files: string[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);

    if (controls.showSuccessToast) {
      toast.success(`Successfully uploaded ${files.length} file(s)!`);
    }
  };

  const generateCode = () => {
    const allowedMimeTypes = getMimeTypes(controls.allowedMimeTypes);
    const maxFileSizeBytes = controls.maxFileSize * 1024 * 1024;

    const propsString = generatePropsString(
      {
        maxFiles: controls.maxFiles,
        bucketName: '"uploads"',
        path: '"user-files"',
        allowedMimeTypes: JSON.stringify(allowedMimeTypes),
        maxFileSize: maxFileSizeBytes,
        client: 'supabaseClient',
        onUploadSuccess: 'handleUploadSuccess',
      },
      {
        maxFiles: 1,
        bucketName: '"uploads"',
        path: undefined,
        allowedMimeTypes: '[]',
        maxFileSize: Number.POSITIVE_INFINITY,
        client: undefined,
        onUploadSuccess: undefined,
      },
    );

    // Format props for better readability
    const formattedProps = propsString
      .trim()
      .split(' ')
      .map((prop) => `  ${prop}`)
      .join('\n');

    return `import { FileUploader } from '@portal/ui/file-uploader';
import { useSupabase } from '@portal/supabase/hooks/use-supabase';

const supabase = useSupabase();

const handleUploadSuccess = (files: string[]) => {
  console.log('Uploaded files:', files);
};

<FileUploader
${formattedProps}
/>`;
  };

  const renderPreview = () => (
    <div className="space-y-4">
      <FileUploader
        maxFiles={controls.maxFiles}
        bucketName="demo-bucket"
        path="user-files"
        allowedMimeTypes={getMimeTypes(controls.allowedMimeTypes)}
        maxFileSize={controls.maxFileSize * 1024 * 1024} // Convert MB to bytes
        client={mockClient as any}
        onUploadSuccess={handleUploadSuccess}
      />

      {uploadedFiles.length > 0 && (
        <div className="bg-muted/20 mt-6 rounded-lg border p-4">
          <h4 className="mb-2 font-semibold">Successfully Uploaded Files:</h4>
          <ul className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <li
                key={index}
                className="text-muted-foreground flex items-center text-sm"
              >
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                {file}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderControls = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="maxFiles">Max Files</Label>
        <SimpleStorySelect
          value={controls.maxFiles.toString()}
          onValueChange={(value) => updateControl('maxFiles', parseInt(value))}
          options={maxFilesOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxFileSize">Max File Size</Label>
        <SimpleStorySelect
          value={controls.maxFileSize.toString()}
          onValueChange={(value) =>
            updateControl('maxFileSize', parseInt(value))
          }
          options={maxFileSizeOptions}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="allowedMimeTypes">Allowed File Types</Label>
        <SimpleStorySelect
          value={controls.allowedMimeTypes}
          onValueChange={(value) =>
            updateControl('allowedMimeTypes', value as any)
          }
          options={mimeTypeOptions}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Label htmlFor="showSuccessToast">Show Success Toast</Label>
        <Switch
          id="showSuccessToast"
          checked={controls.showSuccessToast}
          onCheckedChange={(checked) =>
            updateControl('showSuccessToast', checked)
          }
        />
      </div>
    </>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload</CardTitle>
          <CardDescription>
            Configured for image files only with preview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader
            maxFiles={1}
            bucketName="images"
            allowedMimeTypes={['image/*']}
            maxFileSize={5 * 1024 * 1024} // 5MB
            client={mockClient as any}
            onUploadSuccess={(files) => toast.success('Image uploaded!')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>
            Multiple document types with larger file size limit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader
            maxFiles={5}
            bucketName="documents"
            path="user-docs"
            allowedMimeTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'text/plain',
            ]}
            maxFileSize={10 * 1024 * 1024} // 10MB
            client={mockClient as any}
            onUploadSuccess={(files) =>
              toast.success(`${files.length} documents uploaded!`)
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch Upload</CardTitle>
          <CardDescription>
            Multiple files with no type restrictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader
            maxFiles={10}
            bucketName="general"
            allowedMimeTypes={[]} // No restrictions
            maxFileSize={50 * 1024 * 1024} // 50MB
            client={mockClient as any}
            onUploadSuccess={(files) =>
              toast.success(`Batch upload complete: ${files.length} files`)
            }
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderApiReference = () => (
    <Card>
      <CardHeader>
        <CardTitle>FileUploader Component</CardTitle>
        <CardDescription>
          Complete API reference for FileUploader component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 text-lg font-semibold">FileUploader</h4>
            <p className="text-muted-foreground mb-3 text-sm">
              A drag-and-drop file uploader with preview, progress tracking, and
              Supabase integration.
            </p>
            <div className="overflow-x-auto">
              <table className="border-border w-full border-collapse border">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Prop</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Default</th>
                    <th className="p-3 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">maxFiles</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">1</td>
                    <td className="p-3">Maximum number of files allowed</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">bucketName</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Supabase storage bucket name</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">path</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">undefined</td>
                    <td className="p-3">
                      Optional path prefix for uploaded files
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">allowedMimeTypes</td>
                    <td className="p-3 font-mono text-sm">string[]</td>
                    <td className="p-3 font-mono text-sm">[]</td>
                    <td className="p-3">
                      Array of allowed MIME types (empty = all)
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">maxFileSize</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">Infinity</td>
                    <td className="p-3">Maximum file size in bytes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">client</td>
                    <td className="p-3 font-mono text-sm">SupabaseClient</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Supabase client instance</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">onUploadSuccess</td>
                    <td className="p-3 font-mono text-sm">
                      {'(files: string[]) => void'}
                    </td>
                    <td className="p-3 font-mono text-sm">undefined</td>
                    <td className="p-3">Callback when upload succeeds</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-mono text-sm">cacheControl</td>
                    <td className="p-3 font-mono text-sm">number</td>
                    <td className="p-3 font-mono text-sm">3600</td>
                    <td className="p-3">Cache control in seconds</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-sm">className</td>
                    <td className="p-3 font-mono text-sm">string</td>
                    <td className="p-3 font-mono text-sm">-</td>
                    <td className="p-3">Additional CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsageGuidelines = () => (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>When to Use FileUploader</CardTitle>
          <CardDescription>
            Best practices for file upload interfaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-700">
              ✅ Use FileUploader For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Profile picture and avatar uploads</li>
              <li>• Document attachment uploads</li>
              <li>• Image gallery uploads</li>
              <li>• File import features</li>
              <li>• Media content uploads</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-700">
              ❌ Consider Alternatives For
            </h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Very large files (use chunked upload)</li>
              <li>• Real-time collaborative editing</li>
              <li>• Direct database uploads (use proper storage)</li>
              <li>• Temporary file sharing (use different patterns)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Guidelines</CardTitle>
          <CardDescription>
            How to configure FileUploader effectively
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">File Size Limits</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • <strong>Images:</strong> 1-5MB for web, 10-20MB for high
                quality
              </li>
              <li>
                • <strong>Documents:</strong> 10-50MB depending on content
              </li>
              <li>
                • <strong>Videos:</strong> 100MB+ (consider chunked upload)
              </li>
              <li>
                • <strong>Audio:</strong> 10-50MB for high quality
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">MIME Type Patterns</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>
                • Use wildcards: <code>image/*</code>, <code>video/*</code>
              </li>
              <li>
                • Specific types: <code>application/pdf</code>
              </li>
              <li>
                • Multiple types: <code>['image/jpeg', 'image/png']</code>
              </li>
              <li>• Empty array allows all file types</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Bucket Organization</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Use separate buckets for different content types</li>
              <li>
                • Organize with path prefixes: <code>user-id/category</code>
              </li>
              <li>• Consider public vs private bucket access</li>
              <li>• Set up proper RLS policies for security</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Experience Best Practices</CardTitle>
          <CardDescription>
            Creating intuitive upload experiences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Visual Feedback</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Clear drag-and-drop zones with visual cues</li>
              <li>• Progress indicators during upload</li>
              <li>• Success/error states with appropriate messaging</li>
              <li>• File previews when possible (especially images)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Error Handling</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Clear error messages for size/type violations</li>
              <li>• Retry mechanisms for network failures</li>
              <li>• Partial upload recovery when possible</li>
              <li>• Graceful degradation for unsupported browsers</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Accessibility</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Keyboard navigation support</li>
              <li>• Screen reader compatible labels</li>
              <li>• Focus management during upload process</li>
              <li>• Alternative input methods (click to select)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Considerations</CardTitle>
          <CardDescription>Keeping file uploads secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">File Validation</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Always validate file types on both client and server</li>
              <li>• Check file contents, not just extensions</li>
              <li>• Scan for malware when possible</li>
              <li>• Limit file sizes to prevent DoS attacks</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Storage Security</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Use Row Level Security (RLS) policies</li>
              <li>• Separate public and private content</li>
              <li>• Generate unique file names to prevent conflicts</li>
              <li>• Set up proper bucket permissions</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">User Privacy</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Don't store sensitive files in public buckets</li>
              <li>• Implement file deletion capabilities</li>
              <li>• Consider data retention policies</li>
              <li>• Respect user privacy preferences</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This story uses a mock Supabase client for
          demonstration. In your application, use a real Supabase client with
          proper authentication and storage configuration.
        </p>
      </div>

      <ComponentStoryLayout
        preview={renderPreview()}
        controls={renderControls()}
        generatedCode={generateCode()}
        examples={renderExamples()}
        apiReference={renderApiReference()}
        usageGuidelines={renderUsageGuidelines()}
      />
    </div>
  );
}

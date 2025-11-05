'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import { Checkbox } from '@portal/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@portal/ui/form';
import { Input } from '@portal/ui/input';
import { RadioGroup, RadioGroupItem } from '@portal/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Switch } from '@portal/ui/switch';
import { Textarea } from '@portal/ui/textarea';

import { generateImportStatement } from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

// Form schemas
const basicFormSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  bio: z.string().max(160, 'Bio must not exceed 160 characters.').optional(),
  notifications: z.boolean().default(false),
});

const advancedFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  company: z.string().optional(),
  role: z.enum(['developer', 'designer', 'manager', 'other'], {
    required_error: 'Please select a role.',
  }),
  experience: z.enum(['junior', 'mid', 'senior'], {
    required_error: 'Please select your experience level.',
  }),
  skills: z.array(z.string()).min(1, 'Please select at least one skill.'),
  newsletter: z.boolean().default(false),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions.',
  }),
});

const validationFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/\d/, 'Password must contain at least one number.'),
    confirmPassword: z.string(),
    age: z
      .string()
      .refine((val) => !isNaN(Number(val)), 'Age must be a number.')
      .refine((val) => Number(val) >= 18, 'You must be at least 18 years old.')
      .refine((val) => Number(val) <= 120, 'Please enter a valid age.'),
    website: z
      .string()
      .url('Please enter a valid URL.')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

interface FormStoryControls {
  formType: 'basic' | 'advanced' | 'validation';
  showDescriptions: boolean;
  showValidation: boolean;
  disabled: boolean;
}

export default function FormStory() {
  const [controls, setControls] = useState<FormStoryControls>({
    formType: 'basic',
    showDescriptions: true,
    showValidation: true,
    disabled: false,
  });

  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const generateCode = () => {
    const formComponents = [
      'Form',
      'FormField',
      'FormItem',
      'FormLabel',
      'FormControl',
      'FormMessage',
    ];

    if (controls.showDescriptions) {
      formComponents.push('FormDescription');
    }

    const formImport = generateImportStatement(formComponents, '@portal/ui/form');
    const inputImport = generateImportStatement(['Input'], '@portal/ui/input');
    const buttonImport = generateImportStatement(['Button'], '@portal/ui/button');
    const hookFormImports = `import { useForm } from 'react-hook-form';\nimport { zodResolver } from '@hookform/resolvers/zod';\nimport { z } from 'zod';`;

    let schemaCode = '';
    let formFieldsCode = '';
    let onSubmitCode = '';

    if (controls.formType === 'basic') {
      schemaCode = `const formSchema = z.object({\n  username: z.string().min(2, 'Username must be at least 2 characters.'),\n  email: z.string().email('Please enter a valid email address.'),\n});`;

      formFieldsCode = `        <FormField\n          control={form.control}\n          name="username"\n          render={({ field }) => (\n            <FormItem>\n              <FormLabel>Username</FormLabel>\n              <FormControl>\n                <Input ${controls.disabled ? 'disabled ' : ''}placeholder="Enter username" {...field} />\n              </FormControl>${controls.showDescriptions ? '\n              <FormDescription>\n                Your public display name.\n              </FormDescription>' : ''}${controls.showValidation ? '\n              <FormMessage />' : ''}\n            </FormItem>\n          )}\n        />\n        <FormField\n          control={form.control}\n          name="email"\n          render={({ field }) => (\n            <FormItem>\n              <FormLabel>Email</FormLabel>\n              <FormControl>\n                <Input ${controls.disabled ? 'disabled ' : ''}type="email" placeholder="Enter email" {...field} />\n              </FormControl>${controls.showDescriptions ? "\n              <FormDescription>\n                We'll never share your email.\n              </FormDescription>" : ''}${controls.showValidation ? '\n              <FormMessage />' : ''}\n            </FormItem>\n          )}\n        />`;

      onSubmitCode = `  function onSubmit(values: z.infer<typeof formSchema>) {\n    console.log('Form submitted:', values);\n  }`;
    } else if (controls.formType === 'advanced') {
      schemaCode = `const formSchema = z.object({\n  firstName: z.string().min(1, 'First name is required.'),\n  lastName: z.string().min(1, 'Last name is required.'),\n  email: z.string().email('Please enter a valid email address.'),\n});`;

      formFieldsCode = `        <FormField\n          control={form.control}\n          name="firstName"\n          render={({ field }) => (\n            <FormItem>\n              <FormLabel>First Name</FormLabel>\n              <FormControl>\n                <Input ${controls.disabled ? 'disabled ' : ''}placeholder="John" {...field} />\n              </FormControl>${controls.showValidation ? '\n              <FormMessage />' : ''}\n            </FormItem>\n          )}\n        />\n        <FormField\n          control={form.control}\n          name="lastName"\n          render={({ field }) => (\n            <FormItem>\n              <FormLabel>Last Name</FormLabel>\n              <FormControl>\n                <Input ${controls.disabled ? 'disabled ' : ''}placeholder="Doe" {...field} />\n              </FormControl>${controls.showValidation ? '\n              <FormMessage />' : ''}\n            </FormItem>\n          )}\n        />`;

      onSubmitCode = `  function onSubmit(values: z.infer<typeof formSchema>) {\n    console.log('Advanced form submitted:', values);\n  }`;
    } else {
      schemaCode = `const formSchema = z.object({\n  password: z.string().min(8, 'Password must be at least 8 characters.'),\n  confirmPassword: z.string(),\n}).refine((data) => data.password === data.confirmPassword, {\n  message: 'Passwords do not match.',\n  path: ['confirmPassword'],\n});`;

      formFieldsCode = `        <FormField\n          control={form.control}\n          name="password"\n          render={({ field }) => (\n            <FormItem>\n              <FormLabel>Password</FormLabel>\n              <FormControl>\n                <Input ${controls.disabled ? 'disabled ' : ''}type="password" {...field} />\n              </FormControl>${controls.showValidation ? '\n              <FormMessage />' : ''}\n            </FormItem>\n          )}\n        />\n        <FormField\n          control={form.control}\n          name="confirmPassword"\n          render={({ field }) => (\n            <FormItem>\n              <FormLabel>Confirm Password</FormLabel>\n              <FormControl>\n                <Input ${controls.disabled ? 'disabled ' : ''}type="password" {...field} />\n              </FormControl>${controls.showValidation ? '\n              <FormMessage />' : ''}\n            </FormItem>\n          )}\n        />`;

      onSubmitCode = `  function onSubmit(values: z.infer<typeof formSchema>) {\n    console.log('Validation form submitted:', values);\n  }`;
    }

    const defaultValuesCode =
      controls.formType === 'basic'
        ? `    defaultValues: {\n      username: '',\n      email: '',\n    },`
        : controls.formType === 'advanced'
          ? `    defaultValues: {\n      firstName: '',\n      lastName: '',\n      email: '',\n    },`
          : `    defaultValues: {\n      password: '',\n      confirmPassword: '',\n    },`;

    const fullFormCode = `${hookFormImports}\n${formImport}\n${inputImport}\n${buttonImport}\n\n${schemaCode}\n\nfunction MyForm() {\n  const form = useForm<z.infer<typeof formSchema>>({\n    resolver: zodResolver(formSchema),\n${defaultValuesCode}\n  });\n\n${onSubmitCode}\n\n  return (\n    <Form {...form}>\n      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">\n${formFieldsCode}\n        <Button type="submit"${controls.disabled ? ' disabled' : ''}>Submit</Button>\n      </form>\n    </Form>\n  );\n}`;

    return fullFormCode;
  };

  // Basic form
  const basicForm = useForm<z.infer<typeof basicFormSchema>>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      notifications: false,
    },
  });

  // Advanced form
  const advancedForm = useForm<z.infer<typeof advancedFormSchema>>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      skills: [],
      newsletter: false,
      terms: false,
    },
  });

  // Validation form
  const validationForm = useForm<z.infer<typeof validationFormSchema>>({
    resolver: zodResolver(validationFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      age: '',
      website: '',
    },
  });

  const onSubmit = (values: any) => {
    setSubmissionResult(values);
    setTimeout(() => setSubmissionResult(null), 5000);
  };

  const getCurrentForm = () => {
    switch (controls.formType) {
      case 'basic':
        return basicForm;
      case 'advanced':
        return advancedForm;
      case 'validation':
        return validationForm;
    }
  };

  const getCurrentSchema = () => {
    switch (controls.formType) {
      case 'basic':
        return basicFormSchema;
      case 'advanced':
        return advancedFormSchema;
      case 'validation':
        return validationFormSchema;
    }
  };

  const renderBasicForm = () => (
    <Form {...basicForm}>
      <form onSubmit={basicForm.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={basicForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your username"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showDescriptions && (
                <FormDescription>
                  This is your public display name.
                </FormDescription>
              )}
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={basicForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showDescriptions && (
                <FormDescription>
                  We'll use this to send you important updates.
                </FormDescription>
              )}
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={basicForm.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showDescriptions && (
                <FormDescription>
                  Brief description for your profile. Maximum 160 characters.
                </FormDescription>
              )}
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={basicForm.control}
          name="notifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Notifications</FormLabel>
                {controls.showDescriptions && (
                  <FormDescription>
                    Receive email notifications about updates.
                  </FormDescription>
                )}
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={controls.disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={controls.disabled}>
          Submit
        </Button>
      </form>
    </Form>
  );

  const renderAdvancedForm = () => (
    <Form {...advancedForm}>
      <form
        onSubmit={advancedForm.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={advancedForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    {...field}
                    disabled={controls.disabled}
                  />
                </FormControl>
                {controls.showValidation && <FormMessage />}
              </FormItem>
            )}
          />

          <FormField
            control={advancedForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    {...field}
                    disabled={controls.disabled}
                  />
                </FormControl>
                {controls.showValidation && <FormMessage />}
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={advancedForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={advancedForm.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Corp"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={advancedForm.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={controls.disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={advancedForm.control}
          name="experience"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Experience Level</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                  disabled={controls.disabled}
                >
                  <FormItem className="flex items-center space-y-0 space-x-3">
                    <FormControl>
                      <RadioGroupItem value="junior" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Junior (0-2 years)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-y-0 space-x-3">
                    <FormControl>
                      <RadioGroupItem value="mid" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Mid-level (3-5 years)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-y-0 space-x-3">
                    <FormControl>
                      <RadioGroupItem value="senior" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Senior (5+ years)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={advancedForm.control}
          name="skills"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Skills</FormLabel>
                {controls.showDescriptions && (
                  <FormDescription>
                    Select the skills that apply to you.
                  </FormDescription>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'React',
                  'TypeScript',
                  'Node.js',
                  'Python',
                  'Design',
                  'Testing',
                ].map((item) => (
                  <FormField
                    key={item}
                    control={advancedForm.control}
                    name="skills"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item}
                          className="flex flex-row items-start space-y-0 space-x-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item,
                                      ),
                                    );
                              }}
                              disabled={controls.disabled}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{item}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={advancedForm.control}
          name="newsletter"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Newsletter</FormLabel>
                {controls.showDescriptions && (
                  <FormDescription>
                    Subscribe to our newsletter for updates.
                  </FormDescription>
                )}
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={controls.disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={advancedForm.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={controls.disabled}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Accept terms and conditions</FormLabel>
                {controls.showDescriptions && (
                  <FormDescription>
                    You agree to our terms of service and privacy policy.
                  </FormDescription>
                )}
                {controls.showValidation && <FormMessage />}
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={controls.disabled}>
          Create Account
        </Button>
      </form>
    </Form>
  );

  const renderValidationForm = () => (
    <Form {...validationForm}>
      <form
        onSubmit={validationForm.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={validationForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showDescriptions && (
                <FormDescription>
                  Must be at least 8 characters with uppercase, lowercase, and
                  numbers.
                </FormDescription>
              )}
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={validationForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={validationForm.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showDescriptions && (
                <FormDescription>
                  You must be at least 18 years old to register.
                </FormDescription>
              )}
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          control={validationForm.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://your-website.com"
                  {...field}
                  disabled={controls.disabled}
                />
              </FormControl>
              {controls.showDescriptions && (
                <FormDescription>
                  Link to your personal or professional website.
                </FormDescription>
              )}
              {controls.showValidation && <FormMessage />}
            </FormItem>
          )}
        />

        <Button type="submit" disabled={controls.disabled}>
          Validate & Submit
        </Button>
      </form>
    </Form>
  );

  const controlsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Form Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Form Type</label>
          <Select
            value={controls.formType}
            onValueChange={(value: FormStoryControls['formType']) =>
              setControls((prev) => ({ ...prev, formType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic Form</SelectItem>
              <SelectItem value="advanced">Advanced Form</SelectItem>
              <SelectItem value="validation">Validation Form</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="showDescriptions"
              checked={controls.showDescriptions}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, showDescriptions: checked }))
              }
            />
            <label htmlFor="showDescriptions" className="text-sm">
              Show Descriptions
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showValidation"
              checked={controls.showValidation}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, showValidation: checked }))
              }
            />
            <label htmlFor="showValidation" className="text-sm">
              Show Validation
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="disabled"
              checked={controls.disabled}
              onCheckedChange={(checked) =>
                setControls((prev) => ({ ...prev, disabled: checked }))
              }
            />
            <label htmlFor="disabled" className="text-sm">
              Disabled
            </label>
          </div>
        </div>

        {submissionResult && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Form Submitted!</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto text-sm text-green-700">
                {JSON.stringify(submissionResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );

  const previewContent = (
    <Card>
      <CardHeader>
        <CardTitle>
          {controls.formType === 'basic' && 'Basic Form Example'}
          {controls.formType === 'advanced' && 'Advanced Form Example'}
          {controls.formType === 'validation' && 'Validation Form Example'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {controls.formType === 'basic' && renderBasicForm()}
        {controls.formType === 'advanced' && renderAdvancedForm()}
        {controls.formType === 'validation' && renderValidationForm()}
      </CardContent>
    </Card>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Form"
      previewDescription="React Hook Form integration with Zod validation and accessible form components"
      controlsTitle="Configuration"
      controlsDescription="Switch between different form types and toggle features"
      examples={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Simple Contact Form</h3>
            <Card>
              <CardContent className="pt-6">
                <Form {...basicForm}>
                  <form className="space-y-4">
                    <FormField
                      name="name"
                      render={() => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="email"
                      render={() => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="message"
                      render={() => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your message..." />
                          </FormControl>
                          <FormDescription>
                            Tell us how we can help you.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Send Message</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Settings Form</h3>
            <Card>
              <CardContent className="pt-6">
                <Form {...basicForm}>
                  <form className="space-y-6">
                    <FormField
                      name="notifications"
                      render={() => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Email Notifications
                            </FormLabel>
                            <FormDescription>
                              Receive notifications about account activity.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="marketing"
                      render={() => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Marketing Emails
                            </FormLabel>
                            <FormDescription>
                              Receive emails about new products and features.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="theme"
                      render={() => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <Select>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred theme.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Preferences</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      }
      apiReference={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Form Components</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Component</th>
                    <th className="p-2 text-left font-medium">Description</th>
                    <th className="p-2 text-left font-medium">Usage</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">Form</td>
                    <td className="p-2">Form provider component</td>
                    <td className="p-2">Wrap your form with this component</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">FormField</td>
                    <td className="p-2">Controller for form fields</td>
                    <td className="p-2">Use with render prop pattern</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">FormItem</td>
                    <td className="p-2">Container for form field elements</td>
                    <td className="p-2">
                      Wraps label, control, description, message
                    </td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">FormLabel</td>
                    <td className="p-2">Accessible form label</td>
                    <td className="p-2">
                      Automatically associates with form control
                    </td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">FormControl</td>
                    <td className="p-2">Form control wrapper</td>
                    <td className="p-2">
                      Wraps input elements with accessibility attributes
                    </td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">FormDescription</td>
                    <td className="p-2">Help text for form fields</td>
                    <td className="p-2">Provides additional context</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">FormMessage</td>
                    <td className="p-2">Validation error messages</td>
                    <td className="p-2">Automatically displays field errors</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Hooks</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Hook</th>
                    <th className="p-2 text-left font-medium">Purpose</th>
                    <th className="p-2 text-left font-medium">Returns</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">useFormField</td>
                    <td className="p-2">Access field state and IDs</td>
                    <td className="p-2">
                      Field state, error, IDs for accessibility
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Form Field Pattern</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>
        Help text for this field.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>`}
              </pre>
            </div>
          </div>
        </div>
      }
      usageGuidelines={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Basic Setup</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Forms use React Hook Form with Zod validation for type-safe form
              handling.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@portal/ui/form';

const formSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Validation Patterns</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Common Validations</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Required fields</Badge>
                  <Badge variant="secondary">Email validation</Badge>
                  <Badge variant="secondary">Password strength</Badge>
                  <Badge variant="secondary">Conditional validation</Badge>
                  <Badge variant="secondary">Cross-field validation</Badge>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Best Practices</h3>
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Form Structure</h4>
                <p>• Use semantic HTML form elements</p>
                <p>• Group related fields logically</p>
                <p>• Provide clear labels and descriptions</p>
                <p>• Show validation errors inline</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">User Experience</h4>
                <p>• Validate on blur for immediate feedback</p>
                <p>• Show progress for multi-step forms</p>
                <p>• Preserve form data on errors</p>
                <p>• Provide success feedback</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Accessibility</h4>
                <p>• Use proper ARIA attributes</p>
                <p>• Ensure keyboard navigation works</p>
                <p>• Associate labels with controls</p>
                <p>• Announce errors to screen readers</p>
              </div>
            </div>
          </div>
        </div>
      }
      generatedCode={generateCode()}
    />
  );
}

export { FormStory };

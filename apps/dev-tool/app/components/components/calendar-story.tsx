'use client';

import { useState } from 'react';

import { CalendarIcon } from 'lucide-react';

import { Button } from '@portal/ui/button';
import { Calendar } from '@portal/ui/calendar';
import { Card, CardContent } from '@portal/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@portal/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@portal/ui/select';
import { Switch } from '@portal/ui/switch';

import {
  generateImportStatement,
  generatePropsString,
} from '../lib/story-utils';
import { ComponentStoryLayout } from './story-layout';

interface CalendarStoryControls {
  mode: 'single' | 'multiple' | 'range';
  captionLayout: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years';
  showOutsideDays: boolean;
  showWeekNumber: boolean;
  numberOfMonths: number;
  disabled: boolean;
  buttonVariant: 'ghost' | 'outline' | 'secondary';
}

export default function CalendarStory() {
  const [controls, setControls] = useState<CalendarStoryControls>({
    mode: 'single',
    captionLayout: 'label',
    showOutsideDays: true,
    showWeekNumber: false,
    numberOfMonths: 1,
    disabled: false,
    buttonVariant: 'ghost',
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedRange, setSelectedRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  const handleDateChange = (date: any) => {
    if (controls.mode === 'single') {
      setSelectedDate(date);
    } else if (controls.mode === 'multiple') {
      setSelectedDates(date || []);
    } else if (controls.mode === 'range') {
      setSelectedRange(date || {});
    }
  };

  const getSelectedValue = () => {
    switch (controls.mode) {
      case 'single':
        return selectedDate;
      case 'multiple':
        return selectedDates;
      case 'range':
        return selectedRange;
      default:
        return undefined;
    }
  };

  // Controls section
  const controlsContent = (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Mode</label>
        <Select
          value={controls.mode}
          onValueChange={(value: CalendarStoryControls['mode']) =>
            setControls((prev) => ({ ...prev, mode: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Date</SelectItem>
            <SelectItem value="multiple">Multiple Dates</SelectItem>
            <SelectItem value="range">Date Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Caption Layout</label>
        <Select
          value={controls.captionLayout}
          onValueChange={(value: CalendarStoryControls['captionLayout']) =>
            setControls((prev) => ({ ...prev, captionLayout: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="label">Label</SelectItem>
            <SelectItem value="dropdown">Dropdown</SelectItem>
            <SelectItem value="dropdown-months">Dropdown Months</SelectItem>
            <SelectItem value="dropdown-years">Dropdown Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Button Variant</label>
        <Select
          value={controls.buttonVariant}
          onValueChange={(value: CalendarStoryControls['buttonVariant']) =>
            setControls((prev) => ({ ...prev, buttonVariant: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ghost">Ghost</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Number of Months
        </label>
        <Select
          value={controls.numberOfMonths.toString()}
          onValueChange={(value: string) =>
            setControls((prev) => ({
              ...prev,
              numberOfMonths: parseInt(value),
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Month</SelectItem>
            <SelectItem value="2">2 Months</SelectItem>
            <SelectItem value="3">3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Switch
            id="showOutsideDays"
            checked={controls.showOutsideDays}
            onCheckedChange={(checked) =>
              setControls((prev) => ({ ...prev, showOutsideDays: checked }))
            }
          />
          <label htmlFor="showOutsideDays" className="text-sm">
            Show Outside Days
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="showWeekNumber"
            checked={controls.showWeekNumber}
            onCheckedChange={(checked) =>
              setControls((prev) => ({ ...prev, showWeekNumber: checked }))
            }
          />
          <label htmlFor="showWeekNumber" className="text-sm">
            Show Week Number
          </label>
        </div>

        <div className="flex items-center gap-2">
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
    </div>
  );

  // Preview section
  const previewContent = (
    <div className="flex justify-center p-6">
      <Calendar
        mode={controls.mode}
        selected={getSelectedValue()}
        onSelect={handleDateChange}
        captionLayout={controls.captionLayout}
        showOutsideDays={controls.showOutsideDays}
        showWeekNumber={controls.showWeekNumber}
        numberOfMonths={controls.numberOfMonths}
        disabled={controls.disabled}
        buttonVariant={controls.buttonVariant}
        className="rounded-md border"
      />
    </div>
  );

  // Examples section
  const examplesContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Single Date Selection</h3>
        <Card>
          <CardContent className="flex justify-center pt-6">
            <Calendar
              mode="single"
              selected={new Date()}
              onSelect={() => {}}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Date Range Selection</h3>
        <Card>
          <CardContent className="flex justify-center pt-6">
            <Calendar
              mode="range"
              selected={{
                from: new Date(),
                to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              }}
              onSelect={() => {}}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Multiple Months</h3>
        <Card>
          <CardContent className="flex justify-center pt-6">
            <Calendar
              mode="single"
              selected={new Date()}
              onSelect={() => {}}
              numberOfMonths={2}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Date Picker in Popover</h3>
        <Card>
          <CardContent className="flex justify-center pt-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Pick a date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date()}
                  onSelect={() => {}}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">With Week Numbers</h3>
        <Card>
          <CardContent className="flex justify-center pt-6">
            <Calendar
              mode="single"
              selected={new Date()}
              onSelect={() => {}}
              showWeekNumber
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // API Reference section
  const apiReferenceContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Calendar Props</h3>
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
                <td className="p-2 font-mono">mode</td>
                <td className="p-2 font-mono">
                  'single' | 'multiple' | 'range'
                </td>
                <td className="p-2">'single'</td>
                <td className="p-2">Selection mode</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">selected</td>
                <td className="p-2 font-mono">
                  Date | Date[] | {'{'} from?: Date, to?: Date {'}'}
                </td>
                <td className="p-2">-</td>
                <td className="p-2">Selected date(s)</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">onSelect</td>
                <td className="p-2 font-mono">function</td>
                <td className="p-2">-</td>
                <td className="p-2">Date selection handler</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">captionLayout</td>
                <td className="p-2 font-mono">
                  'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
                </td>
                <td className="p-2">'label'</td>
                <td className="p-2">Month/year caption style</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">numberOfMonths</td>
                <td className="p-2 font-mono">number</td>
                <td className="p-2">1</td>
                <td className="p-2">Number of months to display</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">showOutsideDays</td>
                <td className="p-2 font-mono">boolean</td>
                <td className="p-2">true</td>
                <td className="p-2">Show days outside current month</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">showWeekNumber</td>
                <td className="p-2 font-mono">boolean</td>
                <td className="p-2">false</td>
                <td className="p-2">Show week numbers</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">disabled</td>
                <td className="p-2 font-mono">boolean | Matcher</td>
                <td className="p-2">false</td>
                <td className="p-2">Disable dates</td>
              </tr>
              <tr className="border-border/50 border-b">
                <td className="p-2 font-mono">buttonVariant</td>
                <td className="p-2 font-mono">
                  'ghost' | 'outline' | 'secondary'
                </td>
                <td className="p-2">'ghost'</td>
                <td className="p-2">Date button appearance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Usage Examples</h3>
        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-base font-medium">Basic Single Date</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                <code>{`import { Calendar } from '@portal/ui/calendar';

function DatePicker() {
  const [date, setDate] = useState<Date>();

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
}`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-base font-medium">Date Range Selection</h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                <code>{`import { Calendar } from '@portal/ui/calendar';

function DateRangePicker() {
  const [range, setRange] = useState<{from?: Date, to?: Date}>({});

  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      numberOfMonths={2}
      className="rounded-md border"
    />
  );
}`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-base font-medium">
              Multiple Date Selection
            </h4>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                <code>{`import { Calendar } from '@portal/ui/calendar';

function MultiDatePicker() {
  const [dates, setDates] = useState<Date[]>([]);

  return (
    <Calendar
      mode="multiple"
      selected={dates}
      onSelect={setDates}
      className="rounded-md border"
    />
  );
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Usage Guidelines section
  const usageGuidelinesContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">When to Use Calendar</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Use Calendar component when users need to select dates with visual
          context of months and relationships between dates.
        </p>
        <div className="space-y-2 text-sm">
          <p>• Date range selection (bookings, reports)</p>
          <p>• Event scheduling and planning</p>
          <p>• Birthday or anniversary selection</p>
          <p>• Multiple date selection for recurring events</p>
          <p>• When context of surrounding dates is important</p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Selection Modes</h3>
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Single Mode</h4>
            <p>• Most common use case</p>
            <p>• Good for birthdays, deadlines, appointments</p>
            <p>• Simple one-click selection</p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Range Mode</h4>
            <p>• Perfect for booking systems</p>
            <p>• Hotel reservations, vacation planning</p>
            <p>• Report date ranges</p>
            <p>• Shows continuous selection</p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Multiple Mode</h4>
            <p>• Non-continuous date selection</p>
            <p>• Recurring events or availability</p>
            <p>• Shift scheduling</p>
            <p>• Multiple appointment slots</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Layout Options</h3>
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Caption Layouts</h4>
            <p>• Label: Simple text display (compact)</p>
            <p>• Dropdown: Combined month/year selector</p>
            <p>• Dropdown-months: Month selection dropdown</p>
            <p>• Dropdown-years: Year selection dropdown</p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Multiple Months</h4>
            <p>• Use 2 months for date ranges</p>
            <p>• 3+ months for long-term planning</p>
            <p>• Consider responsive behavior</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Accessibility</h3>
        <div className="space-y-2 text-sm">
          <p>• Full keyboard navigation support</p>
          <p>• Arrow keys to navigate dates</p>
          <p>• Enter/Space to select dates</p>
          <p>• Screen reader announcements</p>
          <p>• Focus management and visible focus indicators</p>
          <p>• Date announcements when navigating</p>
          <p>• Supports RTL languages</p>
        </div>
      </div>
    </div>
  );

  const generateCode = () => {
    const propsString = generatePropsString(
      {
        mode: controls.mode,
        selected:
          controls.mode === 'single'
            ? 'date'
            : controls.mode === 'multiple'
              ? 'dates'
              : 'range',
        onSelect:
          controls.mode === 'single'
            ? 'setDate'
            : controls.mode === 'multiple'
              ? 'setDates'
              : 'setRange',
        captionLayout:
          controls.captionLayout !== 'label'
            ? controls.captionLayout
            : undefined,
        showOutsideDays: !controls.showOutsideDays ? false : undefined,
        showWeekNumber: controls.showWeekNumber ? true : undefined,
        numberOfMonths:
          controls.numberOfMonths > 1 ? controls.numberOfMonths : undefined,
        disabled: controls.disabled ? true : undefined,
        buttonVariant:
          controls.buttonVariant !== 'ghost'
            ? controls.buttonVariant
            : undefined,
        className: 'rounded-md border',
      },
      {
        mode: 'single',
        captionLayout: 'label',
        showOutsideDays: true,
        showWeekNumber: false,
        numberOfMonths: 1,
        disabled: false,
        buttonVariant: 'ghost',
      },
    );

    const importStatement = generateImportStatement(
      ['Calendar'],
      '@portal/ui/calendar',
    );

    let stateDeclaration = '';
    if (controls.mode === 'single') {
      stateDeclaration =
        'const [date, setDate] = useState<Date | undefined>();';
    } else if (controls.mode === 'multiple') {
      stateDeclaration = 'const [dates, setDates] = useState<Date[]>([]);';
    } else {
      stateDeclaration =
        'const [range, setRange] = useState<{from?: Date, to?: Date}>({});';
    }

    const calendarComponent = `<Calendar${propsString} />`;

    return `${importStatement}\n\n${stateDeclaration}\n\n${calendarComponent}`;
  };

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Calendar"
      previewDescription="Date picker with multiple selection modes"
      controlsTitle="Calendar Configuration"
      controlsDescription="Customize calendar appearance and behavior"
      generatedCode={generateCode()}
      examples={examplesContent}
      apiReference={apiReferenceContent}
      usageGuidelines={usageGuidelinesContent}
    />
  );
}

export { CalendarStory };

'use client';

import { useState } from 'react';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@portal/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@portal/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@portal/ui/chart';
import { Label } from '@portal/ui/label';
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

const chartData = [
  { month: 'Jan', desktop: 186, mobile: 80, tablet: 45 },
  { month: 'Feb', desktop: 305, mobile: 200, tablet: 88 },
  { month: 'Mar', desktop: 237, mobile: 120, tablet: 67 },
  { month: 'Apr', desktop: 73, mobile: 190, tablet: 55 },
  { month: 'May', desktop: 209, mobile: 130, tablet: 78 },
  { month: 'Jun', desktop: 214, mobile: 140, tablet: 82 },
  { month: 'Jul', desktop: 178, mobile: 160, tablet: 91 },
  { month: 'Aug', desktop: 189, mobile: 180, tablet: 105 },
  { month: 'Sep', desktop: 239, mobile: 220, tablet: 123 },
  { month: 'Oct', desktop: 278, mobile: 260, tablet: 145 },
  { month: 'Nov', desktop: 349, mobile: 290, tablet: 167 },
  { month: 'Dec', desktop: 418, mobile: 340, tablet: 189 },
];

const pieData = [
  { name: 'Desktop', value: 400, fill: 'var(--color-desktop)' },
  { name: 'Mobile', value: 300, fill: 'var(--color-mobile)' },
  { name: 'Tablet', value: 200, fill: 'var(--color-tablet)' },
];

const radialData = [
  { browser: 'Chrome', users: 275, fill: 'var(--color-chrome)' },
  { browser: 'Firefox', users: 200, fill: 'var(--color-firefox)' },
  { browser: 'Safari', users: 187, fill: 'var(--color-safari)' },
  { browser: 'Edge', users: 173, fill: 'var(--color-edge)' },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
  tablet: {
    label: 'Tablet',
    color: 'hsl(var(--chart-3))',
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))',
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-2))',
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-3))',
  },
  edge: {
    label: 'Edge',
    color: 'hsl(var(--chart-4))',
  },
} as const;

interface ChartStoryControls {
  chartType: 'line' | 'area' | 'bar' | 'pie' | 'radial';
  showTooltip: boolean;
  showLegend: boolean;
  showGrid: boolean;
}

export default function ChartStory() {
  const [controls, setControls] = useState<ChartStoryControls>({
    chartType: 'line',
    showTooltip: true,
    showLegend: true,
    showGrid: true,
  });

  const generateCode = () => {
    const chartComponents = ['ChartContainer'];
    const rechartsComponents = [];

    if (controls.showTooltip) {
      chartComponents.push('ChartTooltip', 'ChartTooltipContent');
    }
    if (controls.showLegend) {
      chartComponents.push('ChartLegend', 'ChartLegendContent');
    }

    let chartComponent = '';
    let dataKey = 'desktop';

    switch (controls.chartType) {
      case 'line':
        rechartsComponents.push('LineChart', 'Line', 'XAxis', 'YAxis');
        if (controls.showGrid) rechartsComponents.push('CartesianGrid');
        chartComponent = `<LineChart data={data}>\n      ${controls.showGrid ? '<CartesianGrid strokeDasharray="3 3" />\n      ' : ''}<XAxis dataKey="month" />\n      <YAxis />\n      ${controls.showTooltip ? '<ChartTooltip content={<ChartTooltipContent />} />\n      ' : ''}${controls.showLegend ? '<ChartLegend content={<ChartLegendContent />} />\n      ' : ''}<Line type="monotone" dataKey="${dataKey}" strokeWidth={2} />\n    </LineChart>`;
        break;
      case 'area':
        rechartsComponents.push('AreaChart', 'Area', 'XAxis', 'YAxis');
        if (controls.showGrid) rechartsComponents.push('CartesianGrid');
        chartComponent = `<AreaChart data={data}>\n      ${controls.showGrid ? '<CartesianGrid strokeDasharray="3 3" />\n      ' : ''}<XAxis dataKey="month" />\n      <YAxis />\n      ${controls.showTooltip ? '<ChartTooltip content={<ChartTooltipContent />} />\n      ' : ''}${controls.showLegend ? '<ChartLegend content={<ChartLegendContent />} />\n      ' : ''}<Area type="monotone" dataKey="${dataKey}" stroke="var(--color-${dataKey})" fill="var(--color-${dataKey})" />\n    </AreaChart>`;
        break;
      case 'bar':
        rechartsComponents.push('BarChart', 'Bar', 'XAxis', 'YAxis');
        if (controls.showGrid) rechartsComponents.push('CartesianGrid');
        chartComponent = `<BarChart data={data}>\n      ${controls.showGrid ? '<CartesianGrid strokeDasharray="3 3" />\n      ' : ''}<XAxis dataKey="month" />\n      <YAxis />\n      ${controls.showTooltip ? '<ChartTooltip content={<ChartTooltipContent />} />\n      ' : ''}${controls.showLegend ? '<ChartLegend content={<ChartLegendContent />} />\n      ' : ''}<Bar dataKey="${dataKey}" fill="var(--color-${dataKey})" />\n    </BarChart>`;
        break;
      case 'pie':
        rechartsComponents.push('PieChart', 'Pie', 'Cell');
        chartComponent = `<PieChart>\n      ${controls.showTooltip ? '<ChartTooltip content={<ChartTooltipContent />} />\n      ' : ''}${controls.showLegend ? '<ChartLegend content={<ChartLegendContent />} />\n      ' : ''}<Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value">\n        {data.map((entry, index) => (\n          <Cell key={\`cell-\${index}\`} fill={entry.fill} />\n        ))}\n      </Pie>\n    </PieChart>`;
        break;
      case 'radial':
        rechartsComponents.push('RadialBarChart', 'RadialBar');
        chartComponent = `<RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="80%" data={data}>\n      ${controls.showTooltip ? '<ChartTooltip content={<ChartTooltipContent />} />\n      ' : ''}${controls.showLegend ? '<ChartLegend content={<ChartLegendContent />} />\n      ' : ''}<RadialBar dataKey="users" cornerRadius={10} />\n    </RadialBarChart>`;
        break;
    }

    const chartImport = generateImportStatement(
      chartComponents,
      '@portal/ui/chart',
    );
    const rechartsImport = generateImportStatement(
      rechartsComponents,
      'recharts',
    );

    const containerProps = generatePropsString({
      config: 'chartConfig',
      className: 'h-[300px]',
    });

    const configCode = `const chartConfig = {\n  desktop: {\n    label: 'Desktop',\n    color: 'hsl(var(--chart-1))',\n  },\n  mobile: {\n    label: 'Mobile',\n    color: 'hsl(var(--chart-2))',\n  },\n} as const;\n\nconst data = [\n  { month: 'Jan', desktop: 186, mobile: 80 },\n  { month: 'Feb', desktop: 305, mobile: 200 },\n  { month: 'Mar', desktop: 237, mobile: 120 },\n  // ... more data\n];`;

    const fullExample = `${chartImport}\n${rechartsImport}\n\n${configCode}\n\nfunction Chart() {\n  return (\n    <ChartContainer${containerProps}>\n      ${chartComponent}\n    </ChartContainer>\n  );\n}`;

    return fullExample;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (controls.chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {controls.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="month" />
            <YAxis />
            {controls.showTooltip && (
              <ChartTooltip content={<ChartTooltipContent />} />
            )}
            {controls.showLegend && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            <Line type="monotone" dataKey="desktop" strokeWidth={2} />
            <Line type="monotone" dataKey="mobile" strokeWidth={2} />
            <Line type="monotone" dataKey="tablet" strokeWidth={2} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {controls.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="month" />
            <YAxis />
            {controls.showTooltip && (
              <ChartTooltip content={<ChartTooltipContent />} />
            )}
            {controls.showLegend && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            <Area type="monotone" dataKey="desktop" stackId="1" />
            <Area type="monotone" dataKey="mobile" stackId="1" />
            <Area type="monotone" dataKey="tablet" stackId="1" />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {controls.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="month" />
            <YAxis />
            {controls.showTooltip && (
              <ChartTooltip content={<ChartTooltipContent />} />
            )}
            {controls.showLegend && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            <Bar dataKey="desktop" />
            <Bar dataKey="mobile" />
            <Bar dataKey="tablet" />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart width={400} height={400}>
            {controls.showTooltip && (
              <ChartTooltip content={<ChartTooltipContent />} />
            )}
            {controls.showLegend && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'radial':
        return (
          <RadialBarChart
            width={400}
            height={400}
            cx="50%"
            cy="50%"
            innerRadius="10%"
            outerRadius="80%"
            data={radialData}
          >
            {controls.showTooltip && (
              <ChartTooltip content={<ChartTooltipContent />} />
            )}
            {controls.showLegend && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            <RadialBar dataKey="users" cornerRadius={10} />
          </RadialBarChart>
        );

      default:
        return null;
    }
  };

  const controlsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Chart Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Chart Type</label>
            <Select
              value={controls.chartType}
              onValueChange={(value: ChartStoryControls['chartType']) =>
                setControls((prev) => ({ ...prev, chartType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="radial">Radial Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="showTooltip">Show Tooltip</Label>
            <Switch
              id="showTooltip"
              checked={controls.showTooltip}
              onCheckedChange={(checked) =>
                setControls((prev) => ({
                  ...prev,
                  showTooltip: checked,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showLegend">Show Legend</Label>
            <Switch
              id="showLegend"
              checked={controls.showLegend}
              onCheckedChange={(checked) =>
                setControls((prev) => ({
                  ...prev,
                  showLegend: checked,
                }))
              }
            />
          </div>

          {(controls.chartType === 'line' ||
            controls.chartType === 'area' ||
            controls.chartType === 'bar') && (
            <div className="flex items-center justify-between">
              <Label htmlFor="showGrid">Show Grid</Label>
              <Switch
                id="showGrid"
                checked={controls.showGrid}
                onCheckedChange={(checked) =>
                  setControls((prev) => ({
                    ...prev,
                    showGrid: checked,
                  }))
                }
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const previewContent = (
    <Card>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig}>{renderChart()}</ChartContainer>
      </CardContent>
    </Card>
  );

  return (
    <ComponentStoryLayout
      preview={previewContent}
      controls={controlsContent}
      previewTitle="Interactive Chart"
      previewDescription="Data visualization components built on top of Recharts"
      controlsTitle="Configuration"
      controlsDescription="Adjust chart type, height, and display options"
      generatedCode={generateCode()}
      examples={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Line Chart with Multiple Data Series
            </h3>

            <Card>
              <CardContent className="pt-6">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="desktop" strokeWidth={2} />
                    <Line type="monotone" dataKey="mobile" strokeWidth={2} />
                    <Line type="monotone" dataKey="tablet" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Stacked Area Chart</h3>
            <Card>
              <CardContent className="pt-6">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="desktop" stackId="1" />
                    <Area type="monotone" dataKey="mobile" stackId="1" />
                    <Area type="monotone" dataKey="tablet" stackId="1" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Pie Chart</h3>
              <Card>
                <CardContent className="flex justify-center pt-6">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-[300px]"
                  >
                    <PieChart width={300} height={300}>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Radial Bar Chart</h3>
              <Card>
                <CardContent className="flex justify-center pt-6">
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-[300px]"
                  >
                    <RadialBarChart
                      width={300}
                      height={300}
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="80%"
                      data={radialData}
                    >
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <RadialBar dataKey="users" cornerRadius={10} />
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      }
      apiReference={
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold">ChartContainer</h3>
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
                    <td className="p-2 font-mono">config</td>
                    <td className="p-2 font-mono">ChartConfig</td>
                    <td className="p-2">-</td>
                    <td className="p-2">
                      Chart configuration object defining colors and labels
                    </td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">children</td>
                    <td className="p-2 font-mono">ReactNode</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Recharts chart components to render</td>
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
            <h3 className="mb-4 text-lg font-semibold">ChartTooltipContent</h3>
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
                    <td className="p-2 font-mono">indicator</td>
                    <td className="p-2 font-mono">'line' | 'dot' | 'dashed'</td>
                    <td className="p-2">'dot'</td>
                    <td className="p-2">Visual indicator style</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">hideLabel</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Hide the tooltip label</td>
                  </tr>
                  <tr className="border-border/50 border-b">
                    <td className="p-2 font-mono">hideIndicator</td>
                    <td className="p-2 font-mono">boolean</td>
                    <td className="p-2">false</td>
                    <td className="p-2">Hide the color indicator</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">ChartConfig</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Chart configuration object that defines colors, labels, and icons
              for data series.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
  // ... more data series
} as const;`}
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
              Charts require a configuration object and data to visualize.
              Always wrap chart components with ChartContainer.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@portal/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', desktop: 186 },
  { month: 'Feb', desktop: 305 },
  // ... more data
];

const config = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
};

<ChartContainer config={config}>
  <LineChart data={data}>
    <XAxis dataKey="month" />
    <YAxis />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line type="monotone" dataKey="desktop" />
  </LineChart>
</ChartContainer>`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Chart Types</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">LineChart</Badge>
                <Badge variant="secondary">AreaChart</Badge>
                <Badge variant="secondary">BarChart</Badge>
                <Badge variant="secondary">PieChart</Badge>
                <Badge variant="secondary">RadialBarChart</Badge>
                <Badge variant="secondary">ScatterChart</Badge>
                <Badge variant="secondary">ComposedChart</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                All Recharts chart types are supported. Import the chart
                components from 'recharts' and use them within ChartContainer.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Responsive Design</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Charts automatically adapt to their container size. Use CSS
              classes to control chart dimensions.
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto text-sm">
                {`<ChartContainer config={config} className="h-[400px] w-full">
  <LineChart data={data}>
    {/* Chart components */}
  </LineChart>
</ChartContainer>`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Accessibility</h3>
            <div className="space-y-2 text-sm">
              <p>• Charts include semantic markup for screen readers</p>
              <p>• Tooltip content is announced when focused</p>
              <p>• Color combinations meet WCAG contrast requirements</p>
              <p>
                • Data tables can be provided as fallbacks for complex charts
              </p>
            </div>
          </div>
        </div>
      }
    />
  );
}

export { ChartStory };

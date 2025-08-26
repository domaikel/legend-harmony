import { useState, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type LegendMode = "variable-version" | "variable" | "version";

interface DataPoint {
  variable: string;
  version: string;
  value: number;
  color: string;
}

interface LegendItem {
  id: string;
  label: string;
  colors: string[];
  tooltip: string;
  seriesIds: string[];
}

const sampleData: DataPoint[] = [
  { variable: "EBITDA", version: "Actuals", value: 1200, color: "#3b82f6" },
  { variable: "EBITDA", version: "Forecast", value: 1350, color: "#22c55e" },
  { variable: "Revenue", version: "Actuals", value: 5000, color: "#f97316" },
  { variable: "Revenue", version: "Forecast", value: 5500, color: "#8b5cf6" },
  { variable: "OpEx", version: "Actuals", value: -800, color: "#ef4444" },
  { variable: "OpEx", version: "Forecast", value: -750, color: "#f59e0b" },
];

export const ChartLegendHarmonizer = () => {
  const [legendMode, setLegendMode] = useState<LegendMode>("variable-version");

  const chartData = useMemo(() => {
    const series = sampleData.map((item, index) => ({
      id: `${item.variable}-${item.version}-${index}`,
      name: `${item.variable} • ${item.version}`,
      data: [item.value],
      color: item.color,
      variable: item.variable,
      version: item.version,
    }));

    // Generate legend items based on mode
    const legendItems = (() => {
      switch (legendMode) {
        case "variable":
          const variableGroups = sampleData.reduce((acc, item) => {
            if (!acc[item.variable]) {
              acc[item.variable] = [];
            }
            acc[item.variable].push(item);
            return acc;
          }, {} as Record<string, DataPoint[]>);

          return Object.entries(variableGroups).map(([variable, items]) => ({
            name: variable,
            symbolWidth: 24,
            labelFormatter: function() {
              return `<span style="display: flex; align-items: center; gap: 8px;">
                <span style="display: flex; gap: 2px;">
                  ${items.map(item => `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${item.color}; border: 1px solid hsl(var(--border));"></span>`).join('')}
                </span>
                <span style="color: hsl(var(--foreground)); font-weight: 500;">${variable}</span>
              </span>`;
            },
            useHTML: true,
            events: {
              mouseOver: function() {
                // Show tooltip with versions
                const versions = items.map(item => `${item.version}: ${item.value}`).join('<br>');
                this.chart.tooltip.refresh([{
                  series: { name: variable },
                  point: { name: versions }
                }]);
              }
            }
          }));

        case "version":
          const versionGroups = sampleData.reduce((acc, item) => {
            if (!acc[item.version]) {
              acc[item.version] = [];
            }
            acc[item.version].push(item);
            return acc;
          }, {} as Record<string, DataPoint[]>);

          return Object.entries(versionGroups).map(([version, items]) => ({
            name: version,
            symbolWidth: 24,
            labelFormatter: function() {
              return `<span style="display: flex; align-items: center; gap: 8px;">
                <span style="display: flex; gap: 2px;">
                  ${items.map(item => `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${item.color}; border: 1px solid hsl(var(--border));"></span>`).join('')}
                </span>
                <span style="color: hsl(var(--foreground)); font-weight: 500;">${version}</span>
              </span>`;
            },
            useHTML: true,
            events: {
              mouseOver: function() {
                const variables = items.map(item => `${item.variable}: ${item.value}`).join('<br>');
                this.chart.tooltip.refresh([{
                  series: { name: version },
                  point: { name: variables }
                }]);
              }
            }
          }));

        default: // variable-version
          return series.map(item => ({
            name: item.name,
            symbolWidth: 16,
            labelFormatter: function() {
              return `<span style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${item.color}; border: 1px solid hsl(var(--border));"></span>
                <span style="color: hsl(var(--foreground)); font-weight: 500;">${item.name}</span>
              </span>`;
            },
            useHTML: true
          }));
      }
    })();

    return {
      chart: {
        type: "column",
        backgroundColor: "hsl(var(--chart-background))",
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        style: {
          fontFamily: "inherit",
        },
      },
      title: {
        text: "Chart Legend Harmonizer",
        style: {
          color: "hsl(var(--foreground))",
          fontSize: "18px",
          fontWeight: "600",
        },
      },
      xAxis: {
        categories: ["Q4 2024"],
        labels: {
          style: {
            color: "hsl(var(--muted-foreground))",
          },
        },
        lineColor: "hsl(var(--border))",
        tickColor: "hsl(var(--border))",
      },
      yAxis: {
        title: {
          text: "Value (in millions)",
          style: {
            color: "hsl(var(--muted-foreground))",
          },
        },
        labels: {
          style: {
            color: "hsl(var(--muted-foreground))",
          },
        },
        gridLineColor: "hsl(var(--chart-grid))",
      },
      legend: {
        enabled: true,
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: -20,
        y: 50,
        floating: true,
        backgroundColor: 'hsl(var(--background))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        borderRadius: 8,
        shadow: {
          color: 'hsl(var(--shadow))',
          opacity: 0.1,
          width: 3,
          offsetX: 2,
          offsetY: 2
        },
        itemStyle: {
          color: 'hsl(var(--foreground))',
          fontWeight: '500',
          fontSize: '12px'
        },
        itemHoverStyle: {
          color: 'hsl(var(--primary))'
        },
        symbolHeight: 8,
        symbolWidth: 8,
        symbolRadius: 4,
        itemMarginTop: 4,
        itemMarginBottom: 4,
        padding: 12,
        labelFormatter: function() {
          // This will be overridden by custom legend items
          return this.name;
        }
      },
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true,
            style: {
              color: "hsl(var(--foreground))",
              fontWeight: "500",
            },
          },
        },
      },
      series,
      credits: {
        enabled: false,
      },
    };
  }, [legendMode]);

  const legendItems = useMemo((): LegendItem[] => {
    switch (legendMode) {
      case "variable":
        const variableGroups = sampleData.reduce((acc, item) => {
          if (!acc[item.variable]) {
            acc[item.variable] = [];
          }
          acc[item.variable].push(item);
          return acc;
        }, {} as Record<string, DataPoint[]>);

        return Object.entries(variableGroups).map(([variable, items]) => ({
          id: variable,
          label: variable,
          colors: items.map(item => item.color),
          tooltip: items.map(item => `${item.variable} • ${item.version}`).join(", "),
          seriesIds: items.map((item, index) => `${item.variable}-${item.version}-${sampleData.indexOf(item)}`),
        }));

      case "version":
        const versionGroups = sampleData.reduce((acc, item) => {
          if (!acc[item.version]) {
            acc[item.version] = [];
          }
          acc[item.version].push(item);
          return acc;
        }, {} as Record<string, DataPoint[]>);

        return Object.entries(versionGroups).map(([version, items]) => ({
          id: version,
          label: version,
          colors: items.map(item => item.color),
          tooltip: items.map(item => `${item.variable} • ${item.version}`).join(", "),
          seriesIds: items.map((item, index) => `${item.variable}-${item.version}-${sampleData.indexOf(item)}`),
        }));

      case "variable-version":
      default:
        return sampleData.map((item, index) => ({
          id: `${item.variable}-${item.version}`,
          label: `${item.variable} • ${item.version}`,
          colors: [item.color],
          tooltip: `${item.variable} • ${item.version}`,
          seriesIds: [`${item.variable}-${item.version}-${index}`],
        }));
    }
  }, [legendMode]);

  const ColorSwatch = ({ colors }: { colors: string[] }) => {
    if (colors.length === 1) {
      return (
        <div 
          className="w-3 h-3 rounded-sm border border-border" 
          style={{ backgroundColor: colors[0] }}
        />
      );
    }

    return (
      <div className="flex gap-0.5">
        {colors.map((color, index) => (
          <div
            key={index}
            className="w-2 h-3 border border-border first:rounded-l-sm last:rounded-r-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chart Legend Harmonizer</h1>
          <p className="text-muted-foreground mt-1">
            Eliminate duplicate legend items across Variables and Versions
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={legendMode === "variable-version" ? "default" : "outline"}
            size="sm"
            onClick={() => setLegendMode("variable-version")}
          >
            Variable & Version
          </Button>
          <Button
            variant={legendMode === "variable" ? "default" : "outline"}
            size="sm"
            onClick={() => setLegendMode("variable")}
          >
            Variable
          </Button>
          <Button
            variant={legendMode === "version" ? "default" : "outline"}
            size="sm"
            onClick={() => setLegendMode("version")}
          >
            Version
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartData}
          containerProps={{ style: { height: "500px" } }}
        />
      </Card>

      <Card className="p-4 mt-4">
        <h3 className="font-semibold text-foreground mb-3">Mode Details</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          {legendMode === "variable" && (
            <p>Each variable appears once with all version colors shown as dots. Hover over legend items to see version details.</p>
          )}
          {legendMode === "version" && (
            <p>Each version appears once with all variable colors shown as dots. Hover over legend items to see variable details.</p>
          )}
          {legendMode === "variable-version" && (
            <p>Each Variable-Version combination shows as a separate item with its assigned color dot.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
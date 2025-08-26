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
        enabled: false, // We'll create our own custom legend
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
  }, []);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <HighchartsReact
              highcharts={Highcharts}
              options={chartData}
              containerProps={{ style: { height: "400px" } }}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">
              Legend ({legendMode.replace("-", " & ")})
            </h3>
            <div className="space-y-2">
              <TooltipProvider>
                {legendItems.map((item) => (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-legend-hover cursor-pointer transition-colors">
                        <ColorSwatch colors={item.colors} />
                        <span className="text-sm font-medium text-foreground flex-1">
                          {item.label}
                        </span>
                        {item.colors.length > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.colors.length}
                          </Badge>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" align="center">
                      <div className="text-xs">
                        {item.tooltip}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Mode Details</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              {legendMode === "variable" && (
                <p>Each variable appears once with all version colors shown as composite swatches.</p>
              )}
              {legendMode === "version" && (
                <p>Each version appears once with all variable colors shown as composite swatches.</p>
              )}
              {legendMode === "variable-version" && (
                <p>Each Variable-Version combination shows as a separate item with its assigned color.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
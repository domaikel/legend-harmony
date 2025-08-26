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

// More realistic financial data
const sampleData: DataPoint[] = [
  { variable: "Actuals", version: "Q1 2024", value: 1200, color: "#3b82f6" },
  { variable: "Actuals", version: "Q2 2024", value: 1350, color: "#3b82f6" },
  { variable: "Actuals", version: "Q3 2024", value: 1180, color: "#3b82f6" },
  { variable: "Actuals", version: "Q4 2024", value: 1420, color: "#3b82f6" },
  { variable: "Plan 2024", version: "Q1 2024", value: 1100, color: "#8b5cf6" },
  { variable: "Plan 2024", version: "Q2 2024", value: 1250, color: "#8b5cf6" },
  { variable: "Plan 2024", version: "Q3 2024", value: 1300, color: "#8b5cf6" },
  { variable: "Plan 2024", version: "Q4 2024", value: 1400, color: "#8b5cf6" },
];

export const ChartLegendHarmonizer = () => {
  const [selectedMode, setSelectedMode] = useState<LegendMode>("variable");

  const createChartOptions = (mode: LegendMode, data: DataPoint[]) => {
    const series = data.map((item, index) => ({
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
        height: 300,
        spacing: [20, 20, 20, 20],
        style: {
          fontFamily: "inherit",
        },
      },
      title: {
        text: "Deduplicate legend items - TEST 2",
        style: {
          color: "hsl(var(--foreground))",
          fontSize: "14px",
          fontWeight: "500",
        },
        align: "left",
        margin: 25,
      },
      xAxis: {
        categories: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
        labels: {
          style: {
            color: "hsl(var(--muted-foreground))",
            fontSize: "11px",
          },
        },
        lineColor: "hsl(var(--border))",
        tickColor: "hsl(var(--border))",
        gridLineWidth: 0,
      },
      yAxis: {
        title: {
          text: null,
        },
        labels: {
          style: {
            color: "hsl(var(--muted-foreground))",
            fontSize: "11px",
          },
        },
        gridLineColor: "hsl(var(--chart-grid))",
        gridLineWidth: 1,
        min: 0,
        max: 1600,
      },
      legend: {
        enabled: true,
        align: "center",
        verticalAlign: "bottom",
        itemStyle: {
          color: "hsl(var(--foreground))",
          fontSize: "12px",
          fontWeight: "400",
        },
        symbolHeight: 8,
        symbolWidth: 8,
        symbolRadius: 4,
        itemMarginBottom: 5,
      },
      plotOptions: {
        column: {
          groupPadding: 0.1,
          pointPadding: 0.05,
          borderWidth: 0,
          dataLabels: {
            enabled: false,
          },
        },
      },
      series,
      credits: {
        enabled: false,
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        borderColor: "hsl(var(--border))",
        style: {
          color: "hsl(var(--popover-foreground))",
          fontSize: "12px",
        },
      },
    };
  };

  const legendItems = useMemo((): LegendItem[] => {
    switch (selectedMode) {
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
          colors: [items[0].color], // Single color per variable
          tooltip: `Add variable icon - ${variable}`,
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
          tooltip: `Add version icon - ${version}`,
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
  }, [selectedMode]);

  const ColorSwatch = ({ colors }: { colors: string[] }) => {
    if (colors.length === 1) {
      return (
        <div 
          className="w-2 h-2 rounded-full border border-border/50" 
          style={{ backgroundColor: colors[0] }}
        />
      );
    }

    return (
      <div className="flex gap-0.5">
        {colors.map((color, index) => (
          <div
            key={index}
            className="w-1.5 h-2 border border-border/50 first:rounded-l-sm last:rounded-r-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  };

  const AnnotationBox = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-yellow-100 border border-yellow-300 rounded px-2 py-1 text-xs font-medium text-yellow-800 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Chart Legend Harmonizer</h1>
          <p className="text-muted-foreground">
            Eliminate duplicate legend items across Variables and Versions
          </p>
          
          <div className="flex justify-center gap-2">
            <Button
              variant={selectedMode === "variable" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMode("variable")}
            >
              Variable
            </Button>
            <Button
              variant={selectedMode === "version" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMode("version")}
            >
              Version
            </Button>
            <Button
              variant={selectedMode === "variable-version" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMode("variable-version")}
            >
              Variable & Version
            </Button>
          </div>
        </div>

        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Variable Mode */}
          <div className="relative">
            <AnnotationBox className="absolute top-4 left-4 z-10">
              Legend content: Variable
            </AnnotationBox>
            <Card className="p-4 bg-white">
              <HighchartsReact
                highcharts={Highcharts}
                options={createChartOptions("variable", sampleData)}
              />
            </Card>
            {selectedMode === "variable" && (
              <div className="absolute top-1/2 right-4 z-10">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                  Add variable icon
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </div>
            )}
          </div>

          {/* Version Mode */}
          <div className="relative">
            <AnnotationBox className="absolute top-4 left-4 z-10">
              Legend content: Version
            </AnnotationBox>
            <Card className="p-4 bg-white">
              <HighchartsReact
                highcharts={Highcharts}
                options={createChartOptions("version", sampleData)}
              />
            </Card>
            {selectedMode === "version" && (
              <div className="absolute top-1/2 right-4 z-10">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                  Add version icon
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Variable & Version Mode - Full Width */}
        <div className="relative">
          <AnnotationBox className="absolute top-4 left-4 z-10">
            Legend content: Variable & Version
          </AnnotationBox>
          <Card className="p-4 bg-white">
            <HighchartsReact
              highcharts={Highcharts}
              options={createChartOptions("variable-version", sampleData)}
              containerProps={{ style: { height: "350px" } }}
            />
          </Card>
          {selectedMode === "variable-version" && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
              <AnnotationBox>
                Status quo
              </AnnotationBox>
            </div>
          )}
        </div>

        {/* Legend Details */}
        <Card className="p-6 bg-white">
          <h3 className="font-semibold text-foreground mb-4">
            Current Legend Mode: {selectedMode.replace("-", " & ").toUpperCase()}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TooltipProvider>
              {legendItems.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-legend-hover cursor-pointer transition-colors">
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
                  <TooltipContent>
                    <div className="text-xs">{item.tooltip}</div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </Card>
      </div>
    </div>
  );
};
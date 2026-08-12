import { useMemo } from "react";
import { DataTable } from "./runs-table/data-table";
import type { inferOutput } from "@trpc/tanstack-react-query";
import type { trpc } from "@/utils/trpc";

type Run = inferOutput<typeof trpc.runs.list>["runs"][number];

interface RunsTableContainerProps {
  runs: Run[];
  orgSlug: string;
  organizationId: string;
  projectName: string;
  onColorChange: (runId: string, color: string) => void;
  onSelectionChange: (runId: string, isSelected: boolean) => void;
  selectedRunsWithColors: Record<string, { run: Run; color: string }>;
  runColors: Record<string, string>;
  defaultRowSelection: Record<number, boolean>;
  runCount: number;
  isLoading: boolean;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

/**
 * Container component for the runs data table
 * Provides column configuration and memoizes the table to prevent unnecessary re-renders
 */
export function RunsTableContainer({
  runs,
  orgSlug,
  organizationId,
  projectName,
  onColorChange,
  onSelectionChange,
  selectedRunsWithColors,
  runColors,
  defaultRowSelection,
  runCount,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: RunsTableContainerProps) {
  // Calculate current row selection based on actual selectedRunsWithColors
  // This ensures the table checkboxes stay in sync with the actual selected runs
  const currentRowSelection = useMemo(() => {
    const selection: Record<number, boolean> = {};

    // Map through the runs array to find indices of selected runs
    runs.forEach((run, index) => {
      if (selectedRunsWithColors[run.id]) {
        selection[index] = true;
      } else {
        selection[index] = false;
      }
    });

    return selection;
  }, [runs, selectedRunsWithColors]);

  // Memoize the DataTable component to prevent unnecessary re-renders
  const memoizedDataTable = useMemo(
    () => (
      <DataTable
        runs={runs ?? []}
        orgSlug={orgSlug}
        organizationId={organizationId}
        projectName={projectName}
        onColorChange={onColorChange}
        onSelectionChange={onSelectionChange}
        selectedRunsWithColors={selectedRunsWithColors}
        runColors={runColors}
        defaultRowSelection={currentRowSelection}
        runCount={runCount}
        isLoading={isLoading}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    ),
    [
      orgSlug,
      organizationId,
      projectName,
      onColorChange,
      onSelectionChange,
      selectedRunsWithColors,
      runColors,
      runs,
      currentRowSelection,
      runCount,
      isLoading,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    ],
  );

  return memoizedDataTable;
}

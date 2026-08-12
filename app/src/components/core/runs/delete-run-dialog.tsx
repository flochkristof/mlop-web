import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { queryClient, trpc } from "@/utils/trpc";

interface DeleteRunDialogProps {
  organizationId: string;
  projectName: string;
  runId: string;
  runName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the run has been deleted, e.g. to drop it from the selection */
  onDeleted?: (runId: string) => void;
}

export function DeleteRunDialog({
  organizationId,
  projectName,
  runId,
  runName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteRunDialogProps) {
  const { mutate: deleteRun, isPending } = useMutation(
    trpc.runs.delete.mutationOptions({
      onSuccess: () => {
        toast.success(`Run ${runName} deleted`);
        onOpenChange(false);
        onDeleted?.(runId);
        // Refreshes the run list, the run count and the sidebar
        queryClient.invalidateQueries({ queryKey: [["runs"]] });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete run");
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Run</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-medium">{runName}</span>?
            All of its metrics, logs, media and files will be permanently
            removed. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteRun({ organizationId, projectName, runId })}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

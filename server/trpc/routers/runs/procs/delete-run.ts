import { OrganizationRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedOrgProcedure } from "../../../../lib/trpc";
import { sqidDecode } from "../../../../lib/sqid";
import { deleteRunFiles } from "../../../../lib/s3";

// Clickhouse tables holding per run data, all keyed by (tenantId, projectName, runId)
const RUN_DATA_TABLES = [
  "mlop_metrics",
  "mlop_data",
  "mlop_logs",
  "mlop_files",
];

export const deleteRunProcedure = protectedOrgProcedure
  .input(z.object({ runId: z.string(), projectName: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { runId: encodedRunId, projectName, organizationId } = input;

    const runId = sqidDecode(encodedRunId);

    if (runId === undefined) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid run id",
      });
    }

    const run = await ctx.prisma.runs.findFirst({
      where: {
        id: runId,
        organizationId,
        project: {
          name: projectName,
        },
      },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!run) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Run not found",
      });
    }

    // Admins and owners can delete any run, members only their own
    const isOrgAdmin =
      ctx.member.role === OrganizationRole.OWNER ||
      ctx.member.role === OrganizationRole.ADMIN;

    if (!isOrgAdmin && run.createdById !== ctx.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to delete this run",
      });
    }

    // Drop the logged data before the run row itself, so a failure here leaves
    // the run visible instead of leaving data behind with nothing pointing at it
    for (const table of RUN_DATA_TABLES) {
      await ctx.clickhouse.command(
        `ALTER TABLE ${table} DELETE
         WHERE tenantId = {tenantId: String}
         AND projectName = {projectName: String}
         AND runId = {runId: UInt64}`,
        {
          tenantId: organizationId,
          projectName,
          runId,
        }
      );
    }

    await deleteRunFiles(organizationId, projectName, runId);

    // Logs, graph nodes/edges, triggers and notifications cascade with the run
    await ctx.prisma.runs.delete({
      where: {
        id: runId,
      },
    });

    return { success: true };
  });

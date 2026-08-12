import { router } from "../../../lib/trpc";

import { getRunProcedure } from "./procs/get-run";
import { listRunsProcedure } from "./procs/list-runs";
import { latestRunsProcedure } from "./procs/latest-runs";
import { dataRouter } from "./routers/data/router";
import { triggerRouter } from "./routers/trigger/router";
import { countRunsProcedure } from "./procs/runs-count";
import { deleteRunProcedure } from "./procs/delete-run";

export const runsRouter = router({
  // Procedures
  list: listRunsProcedure,
  get: getRunProcedure,
  latest: latestRunsProcedure,
  count: countRunsProcedure,
  delete: deleteRunProcedure,
  // Routers
  data: dataRouter,
  trigger: triggerRouter,
});

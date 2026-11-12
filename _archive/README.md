# Archived project artifacts

This directory contains files that were intentionally moved out of the active app tree rather than deleted.

## Archive list

- `admin.md` -> `_archive/admin.md`  
  Reason: stale admin/implementation notes that are not part of the runtime app and were duplicating product documentation.

- `FRONTEND.md` -> `_archive/FRONTEND.md`  
  Reason: old frontend architecture write-up with legacy PlotFinder references; kept only for historical review and not used in current app logic.

- `status.md` -> `_archive/status.md`  
  Reason: historical project status summary with legacy branding and outdated backend notes; no longer part of active build or maintenance flow.

## Retention policy

- Never delete archived files.
- Keep original git history via `git mv`.
- Update imports or usage references for any moved runtime file before continuing.
- Only add new items here when they are clearly obsolete or no longer used by the live app.

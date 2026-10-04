# Project decisions

- Export RoutineX backups as on-demand JSON of app-owned browser storage keys only, because tasks, profiles, and related settings currently persist on this device and auth sessions must never be exported.
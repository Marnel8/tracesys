# Audit Hooks Documentation

This directory contains React Query hooks for managing audit trail functionality in the TraceSys application.

## Overview

The audit hooks provide a comprehensive set of React Query hooks for:
- Fetching and filtering audit logs
- Managing audit statistics
- Exporting audit data
- Real-time updates
- Pagination and search functionality

## Files

- `useAudit.ts` - Main hooks implementation
- `index.ts` - Export file
- `README.md` - This documentation

## Hooks Available

### Core Data Hooks

#### `useAuditLogs(filters)`
Fetches audit logs with optional filtering and pagination.

```typescript
const { data, isLoading, error } = useAuditLogs({
  search: "user login",
  category: "security",
  severity: "high",
  page: 1,
  limit: 10
});
```

#### `useAuditLog(id)`
Fetches a single audit log by ID.

```typescript
const { data: auditLog, isLoading } = useAuditLog("audit-log-id");
```

#### `useAuditStats()`
Fetches audit statistics and analytics.

```typescript
const { data: stats, isLoading } = useAuditStats();
```

### Filter and Reference Data Hooks

#### `useAuditFilters()`
Provides filter options for categories, severities, statuses, and users.

```typescript
const { categories, severities, statuses, users } = useAuditFilters();
```

#### `useAuditCategories()`
Fetches available audit categories.

```typescript
const { data: categories } = useAuditCategories();
```

#### `useAuditSeverities()`
Fetches available severity levels.

```typescript
const { data: severities } = useAuditSeverities();
```

#### `useAuditStatuses()`
Fetches available status types.

```typescript
const { data: statuses } = useAuditStatuses();
```

#### `useAuditUsers()`
Fetches users for filtering.

```typescript
const { data: users } = useAuditUsers();
```

### Mutation Hooks

#### `useCreateAuditLog()`
Creates a new audit log entry.

```typescript
const createAuditLog = useCreateAuditLog();

const handleCreate = () => {
  createAuditLog.mutate({
    action: "User Login",
    resource: "Authentication",
    details: "User logged in successfully",
    ipAddress: "192.168.1.1",
    userAgent: "Chrome 120.0.0.0",
    severity: "low",
    category: "security",
    status: "success"
  });
};
```

#### `useExportAuditLogs()`
Exports audit logs to CSV format.

```typescript
const exportAuditLogs = useExportAuditLogs();

const handleExport = () => {
  exportAuditLogs.mutate({
    category: "security",
    startDate: "2024-01-01",
    endDate: "2024-01-31"
  });
};
```

#### `useDeleteOldAuditLogs()`
Deletes audit logs older than specified days.

```typescript
const deleteOldAuditLogs = useDeleteOldAuditLogs();

const handleCleanup = () => {
  deleteOldAuditLogs.mutate(90); // Delete logs older than 90 days
};
```

### Utility Hooks

#### `useAuditDashboard()`
Combines stats and recent logs for dashboard display.

```typescript
const { stats, recentLogs, isLoading, error } = useAuditDashboard();
```

#### `useAuditSearch(searchTerm, debounceMs)`
Provides debounced search functionality.

```typescript
const [searchTerm, setSearchTerm] = useState("");
const { data: searchResults } = useAuditSearch(searchTerm, 300);
```

#### `useAuditPagination(filters)`
Handles pagination logic and state.

```typescript
const {
  data,
  currentPage,
  pageSize,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
  hasNextPage,
  hasPrevPage
} = useAuditPagination(filters);
```

#### `useAuditRealtime(filters)`
Enables real-time updates for audit logs.

```typescript
const { isEnabled, enableRealtime, disableRealtime } = useAuditRealtime(filters);
```

## Types

### AuditLog
```typescript
interface AuditLog {
  id: string;
  userId?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: "low" | "medium" | "high";
  category: "security" | "academic" | "submission" | "attendance" | "user_management" | "system";
  status: "success" | "failed" | "warning";
  country?: string;
  region?: string;
  city?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}
```

### AuditFilters
```typescript
interface AuditFilters {
  search?: string;
  category?: "all" | "security" | "academic" | "submission" | "attendance" | "user_management" | "system";
  severity?: "all" | "low" | "medium" | "high";
  status?: "all" | "success" | "failed" | "warning";
  userId?: "all" | string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

### AuditStats
```typescript
interface AuditStats {
  totalActivities: number;
  securityEvents: number;
  failedActions: number;
  activeUsers: number;
  activitiesByCategory: Record<string, number>;
  activitiesBySeverity: Record<string, number>;
  activitiesByStatus: Record<string, number>;
  recentActivities: AuditLog[];
}
```

## Usage Examples

### Basic Audit Log List
```typescript
import { useAuditLogs } from "@/hooks/audit";

function AuditLogList() {
  const { data, isLoading, error } = useAuditLogs({
    page: 1,
    limit: 20,
    category: "security"
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.auditLogs.map(log => (
        <div key={log.id}>
          <h3>{log.action}</h3>
          <p>{log.details}</p>
          <span>{log.createdAt}</span>
        </div>
      ))}
    </div>
  );
}
```

### Filtered Search
```typescript
import { useAuditLogs, useAuditFilters } from "@/hooks/audit";

function AuditSearch() {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    severity: "all"
  });

  const { data } = useAuditLogs(filters);
  const { categories, severities } = useAuditFilters();

  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        placeholder="Search audit logs..."
      />
      
      <select
        value={filters.category}
        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
      >
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>{cat.label}</option>
        ))}
      </select>

      {/* Render audit logs */}
    </div>
  );
}
```

### Real-time Dashboard
```typescript
import { useAuditDashboard, useAuditRealtime } from "@/hooks/audit";

function AuditDashboard() {
  const { stats, recentLogs, isLoading } = useAuditDashboard();
  const { isEnabled, enableRealtime, disableRealtime } = useAuditRealtime();

  return (
    <div>
      <button onClick={isEnabled ? disableRealtime : enableRealtime}>
        {isEnabled ? "Disable" : "Enable"} Real-time
      </button>
      
      <div>
        <h2>Total Activities: {stats?.totalActivities}</h2>
        <h2>Security Events: {stats?.securityEvents}</h2>
      </div>

      <div>
        <h3>Recent Activities</h3>
        {recentLogs.map(log => (
          <div key={log.id}>{log.action}</div>
        ))}
      </div>
    </div>
  );
}
```

### Export Functionality
```typescript
import { useExportAuditLogs } from "@/hooks/audit";

function ExportButton() {
  const exportAuditLogs = useExportAuditLogs();

  const handleExport = () => {
    exportAuditLogs.mutate({
      category: "security",
      startDate: "2024-01-01",
      endDate: "2024-01-31"
    });
  };

  return (
    <button 
      onClick={handleExport}
      disabled={exportAuditLogs.isPending}
    >
      {exportAuditLogs.isPending ? "Exporting..." : "Export CSV"}
    </button>
  );
}
```

## Query Keys

The hooks use a structured query key system for efficient caching and invalidation:

```typescript
export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (filters: AuditFilters) => [...auditKeys.lists(), filters] as const,
  details: () => [...auditKeys.all, "detail"] as const,
  detail: (id: string) => [...auditKeys.details(), id] as const,
  stats: () => [...auditKeys.all, "stats"] as const,
  users: () => [...auditKeys.all, "users"] as const,
  categories: () => [...auditKeys.all, "categories"] as const,
  severities: () => [...auditKeys.all, "severities"] as const,
  statuses: () => [...auditKeys.all, "statuses"] as const,
};
```

## Error Handling

All hooks include proper error handling with toast notifications:

```typescript
// Errors are automatically handled with toast notifications
const { data, error } = useAuditLogs(filters);

// For mutations, errors are shown via toast
const createAuditLog = useCreateAuditLog();
// Error toast will be shown automatically on failure
```

## Performance Optimizations

- **Stale Time**: Reference data (categories, severities, etc.) has longer stale times
- **Placeholder Data**: Lists maintain previous data while refetching
- **Debounced Search**: Search input is debounced to prevent excessive API calls
- **Pagination**: Large datasets are paginated to improve performance
- **Real-time**: Optional real-time updates with configurable intervals

## Dependencies

- `@tanstack/react-query` - For data fetching and caching
- `react` - For hooks and state management
- `sonner` - For toast notifications
- `@/lib/api` - For API client

## Best Practices

1. **Use appropriate hooks**: Choose the right hook for your use case
2. **Handle loading states**: Always handle loading and error states
3. **Optimize filters**: Use specific filters to reduce data transfer
4. **Implement pagination**: Use pagination for large datasets
5. **Cache invalidation**: Mutations automatically invalidate related queries
6. **Real-time updates**: Use real-time hooks sparingly to avoid performance issues

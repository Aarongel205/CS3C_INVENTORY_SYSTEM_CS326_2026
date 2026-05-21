# Product Backlog
**Project:** StockWise Inventory Management System
**Assigned:** Sophia

## User Stories

| ID | User Story | Priority | Story Points | Acceptance Criteria |
|----|-----------|----------|--------------|---------------------|
| US-01 | As an admin, I want to add new items to the inventory so that I can track stock levels. | High | 3 | Item form accepts name, category, quantity, price. Item appears in inventory table after saving. |
| US-02 | As an admin, I want to edit existing items so that I can update outdated information. | High | 2 | Edit button pre-fills the form. Changes are saved and reflected immediately. |
| US-03 | As an admin, I want to delete items so that I can remove discontinued products. | High | 2 | Confirmation modal appears before deletion. Item is removed from the table and database. |
| US-04 | As an admin, I want to adjust stock quantities so that I can log restocks and removals. | High | 3 | Stock modal allows add/remove/set. New quantity is saved and status updates automatically. |
| US-05 | As an admin, I want to see low stock alerts on the dashboard so that I can restock before running out. | High | 3 | Items at or below threshold appear in the alert panel. Out-of-stock items are highlighted in red. |
| US-06 | As an admin, I want to filter and sort items by category and status so that I can find items quickly. | Medium | 2 | Dropdowns filter the table in real time. Sort by name, quantity, price, and date works correctly. |
| US-07 | As an admin, I want to search for items by name or SKU so that I can locate a specific product fast. | Medium | 2 | Search bar filters results as I type. Results match name, SKU, category, and supplier fields. |
| US-08 | As an admin, I want to export inventory to CSV so that I can share reports with the team. | Medium | 2 | Export button downloads a CSV with all visible items. File includes all relevant columns. |
| US-09 | As an admin, I want to view an activity log so that I can audit all changes made to the inventory. | Medium | 3 | Log page shows all ADD, UPDATE, DELETE, RESTOCK actions with timestamps. Filter by action type works. |
| US-10 | As an admin, I want to view KPI reports so that I can make data-driven decisions about the inventory. | Low | 3 | Reports page shows total value, cost, margin, availability, and category breakdown. |
| US-11 | As an admin, I want the system to auto-generate SKUs so that I don't have to manually assign them. | Low | 1 | If SKU is left blank, a unique SKU is generated from the item name. |
| US-12 | As an admin, I want the system to work offline so that I can still use it without internet access. | Low | 2 | System falls back to localStorage when Supabase is not configured. Data persists on page reload. |
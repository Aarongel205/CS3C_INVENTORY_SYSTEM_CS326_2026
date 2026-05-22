# Metrics Report
**Project:** StockWise Inventory Management System
**Assigned:** Sophia
**Measurement Date:** May 2026

---

## Measurements Taken

> *(These are sample values — replace with real numbers from your Reports page after adding items)*

| KPI | Measured Value | Target | Status |
|-----|---------------|--------|--------|
| Total Inventory Value | ₱48,250.00 | Track over time | ✅ Baseline set |
| Stock Availability Rate | 87% | ≥ 85% | ✅ Meeting target |
| Out-of-Stock Count | 3 items | ≤ 5 | ✅ Within target |
| Gross Margin | ₱18,400.00 | Positive | ✅ Positive margin |
| Low Stock Alert Rate | 8% | ≤ 10% | ✅ Within target |

---

## Analysis

**Total Inventory Value (₱48,250):** The current stock represents a significant asset. Electronics and Office Supplies categories hold the most value.

**Stock Availability (87%):** Slightly above the 85% target. 3 items are fully out of stock and need to be restocked urgently.

**Gross Margin (₱18,400 / 38%):** A 38% gross margin is healthy for a retail-style inventory. The team should monitor cost prices on restock to maintain this margin.

**Low Stock Alert Rate (8%):** 8% of items are near their restock threshold. Proactive restocking should be triggered this week.

---

## Suggested Improvements

1. **Restock the 3 out-of-stock items** — these represent lost sales opportunity
2. **Review pricing on low-margin items** — items where `sell_price` is close to `cost_price`
3. **Add expiry dates to perishable items** — to prevent expired stock from inflating value metrics
4. **Set low-threshold values** for all items — currently some items have no threshold, so alerts may be missed
5. **Export and review weekly** — download the CSV export every Friday to track trends over time

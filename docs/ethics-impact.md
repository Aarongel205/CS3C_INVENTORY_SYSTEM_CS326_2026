# Ethics Impact Assessment
**Project:** StockWise Inventory Management System
**Assigned:** Neil

---

## Stakeholders

| Stakeholder | Role | Impact |
|-------------|------|--------|
| Admin users | Operate the inventory system daily | Direct — data they enter is stored and acted upon |
| Business owner | Relies on inventory data for decisions | Direct — decisions based on system accuracy |
| Customers | Affected by stock availability | Indirect — out-of-stock items affect customer experience |
| Suppliers | Informed by restock actions | Indirect — restock alerts may trigger supplier orders |
| Development team | Builds and maintains the system | Direct — responsible for security and data integrity |
| Third-party services | Supabase (database), Render (hosting) | Technical — handle data storage and delivery |

---

## Ethical Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| E-01 | Inaccurate stock data leads to poor business decisions | Medium | High | Activity log provides full audit trail; validation prevents bad data entry |
| E-02 | Unauthorized access to inventory data | Low | High | Rate limiting, helmet headers, env-based secrets; future: authentication |
| E-03 | System downtime affects business operations | Medium | Medium | LocalStorage fallback ensures partial functionality offline |
| E-04 | Data retained longer than necessary | Low | Medium | No personal data is stored; only item and stock data |
| E-05 | Bias in KPI reporting misguides decisions | Low | Medium | KPIs are calculated transparently from raw data; no algorithmic manipulation |

---

## Professional Responsibilities
As developers, the team commits to:
- Writing secure, maintainable code
- Documenting all major decisions
- Not storing unnecessary personal data
- Being transparent about system limitations
- Maintaining an audit trail for all data changes

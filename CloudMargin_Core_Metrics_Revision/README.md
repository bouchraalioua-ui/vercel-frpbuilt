# CloudMargin — Final Simplified Finance Lab

A deliberately small, independently developed Next.js finance simulation. All prices, customer counts, margins, costs and investments are hypothetical, **not Vercel internal financials**.

## Three linked questions

1. **FP&A:** How does a 20%, 40% or 60% share of agent-assisted tasks change the revenue/cost outlook compared with a fixed operating plan? Adjust paid customer growth; toggle Free, Pro, Enterprise or All to inspect MRR, ARR, usage revenue, budget variances, contribution and customer metrics.
2. **Product Finance:** How do runtime and attempts per task affect unit economics, contribution margin, and the cost to serve Free, Pro and Enterprise separately?
3. **Investment:** Build or Buy execution efficiency, or defer if optional? Adjust 12–84-month horizon, strategic necessity, four cost/savings assumptions, and optionally measurable incremental contribution and discount rate. Monthly discounted cashflows and payback are displayed.

## Accounting notes

- Pro subscription = Pro accounts × hypothetical $20 monthly fee; Enterprise contract = Enterprise accounts × hypothetical $2,500 monthly value. Free accounts generate no subscription.
- Paid overage revenue is only executions beyond each paid segment's assumed included allowance. Free runs incur cost but no billed overages.
- Delivery cost = runs × (seconds × cost per second + overhead per run) + accounts × other monthly delivery cost.
- Investment cashflows = execution-cost savings + optional incremental monthly contribution − recurring project expense; upfront costs deducted at month 0. Annual discount rate / 12 is applied monthly. No residual/terminal value.
- Investment horizon changes the evaluation window; it does not automatically improve NPV. Optional investments may be deferred on quantified economics; strategically required investments compare Build and Buy without pretending modeled NPV captures all strategic value.
- Churn, detailed plan mechanics, negotiated contract pricing, other Vercel revenue streams, cloud cost allocations, risk and taxes are intentionally excluded.

## Verify

`node model.test.mjs`
`npm install`
`npm run build`

Upload **the contents of this folder** to your existing GitHub repository (preserve `app/`), then Vercel deploys from the existing connected branch. Keep a preview branch before changing the recruiter-facing production site.

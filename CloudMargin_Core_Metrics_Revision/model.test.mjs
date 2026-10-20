import assert from 'node:assert/strict';
import {forecast,investment,BASE,CASES} from './app/finance.js';
const eq=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const rows=forecast();
assert.equal(rows.length,84);
for(const r of rows){
 eq(r.revenue,r.proSubscription+r.enterpriseContract+r.usageRevenue);
 eq(r.deliveryCost,r.executionCost+r.otherDeliveryCost);
 eq(r.runs,r.freeRuns+r.proRuns+r.enterpriseRuns);
 eq(r.customers,r.free+r.pro+r.enterprise);
}
const slow=forecast(BASE,'slower'),fast=forecast(BASE,'faster');
assert.ok(slow[0].runs<rows[0].runs&&fast[0].runs>rows[0].runs);
eq(slow[0].customers,rows[0].customers);
eq(fast[0].customers,rows[0].customers);
for(const horizon of [12,36,48,60,84]){
 const i=investment(rows,{horizon});
 assert.equal(i.build.cashflows.length,horizon);
 assert.equal(i.buy.cashflows.length,horizon);
 eq(i.build.cashflows.at(-1).discountedCumulative,i.build.npv);
 eq(i.buy.cashflows.at(-1).discountedCumulative,i.buy.npv);
}
const req=investment(rows,{required:true});
assert.ok(req.required&&req.decision.label.includes('lower modeled economic cost'));
const positive=investment(rows,{buildUpfront:0,buildMonthly:0,buildSavingPct:100});
assert.ok(positive.build.npv>0&&positive.build.discountedPayback!==null);
const none=forecast({...BASE,free:0,pro:0,enterprise:0});
eq(none[0].revenue,0);eq(none[0].deliveryCost,0);
console.log('PASS: 84 monthly reconciliations, agent scenarios, 5 horizons, NPV cashflow bridge, required capability, payback and zero demand.');

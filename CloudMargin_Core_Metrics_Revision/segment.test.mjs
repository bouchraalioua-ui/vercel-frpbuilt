import assert from 'node:assert/strict';
import {BASE,forecast} from './app/finance.js';
const rows=forecast(BASE,'plan',84);
for(const r of rows){
 const proOver=r.proOverageRuns*BASE.pricePerOverage;
 const entOver=r.enterpriseOverageRuns*BASE.pricePerOverage;
 const segments=[
  {revenue:0,cost:r.freeRuns*r.costPerRun+r.free*BASE.otherCostPerAccount},
  {revenue:r.proSubscription+proOver,cost:r.proRuns*r.costPerRun+r.pro*BASE.otherCostPerAccount},
  {revenue:r.enterpriseContract+entOver,cost:r.enterpriseRuns*r.costPerRun+r.enterprise*BASE.otherCostPerAccount}
 ];
 const sum=(k)=>segments.reduce((v,x)=>v+x[k],0);
 assert.ok(Math.abs(sum('revenue')-r.revenue)<1e-6);
 assert.ok(Math.abs(sum('cost')-r.deliveryCost)<1e-6);
 assert.ok(Math.abs(r.revenue-r.proSubscription-r.enterpriseContract-r.usageRevenue)<1e-6);
}
console.log('PASS: all 84 months segment revenue, overage, cost and contribution reconcile to consolidated forecast.');

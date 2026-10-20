/** CloudMargin: entirely hypothetical, independently developed finance model.
 * No Vercel sales, platform costs, contracts or margins are represented here.
 */
export const BASE = Object.freeze({
  free:350, pro:150, enterprise:8,
  proFee:20, enterpriseFee:2500,
  freeTasks:30, proTasks:900, enterpriseTasks:6000,
  agentShare:.40, attemptsPerTask:2.16,
  seconds:45, costPerSecond:.0005, overheadPerAttempt:.002,
  otherCostPerAccount:8, pricePerOverage:.055,
  proIncluded:30, enterpriseIncluded:1000,
  annualPaidGrowth:.18, annualFreeGrowth:.12
});
export const CASES = Object.freeze({
  slower:{label:'Slower agent uptake',share:.20,meaning:'20% of tasks agent-assisted; customer growth is unchanged.'},
  plan:{label:'Operating plan',share:.40,meaning:'40% of tasks agent-assisted; the initial planning assumption.'},
  faster:{label:'Faster agent uptake',share:.60,meaning:'60% of tasks agent-assisted; subscriptions remain on the same plan.'}
});
export const INVESTMENT_DEFAULTS=Object.freeze({
  horizon:48,annualDiscount:12,required:false,
  buildUpfront:12000,buildSavingPct:45,buildMonthly:850,
  buyUpfront:8500,buySavingPct:35,buyMonthly:700,
  sharedMonthlyBenefit:0
});
export const sum=(rows,key)=>rows.reduce((a,r)=>a+(r[key]||0),0);
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number.isFinite(+v)?+v:min));
/** Compounds gross new accounts each month. Churn and conversion are intentionally excluded
 * to isolate the effect of growth, mix and agent usage for a tractable student example. */
export function forecast(inputs=BASE,caseKey='plan',months=84){
  const p={...BASE,...inputs}; const c=CASES[caseKey]||CASES.plan;
  let free=p.free,pro=p.pro,enterprise=p.enterprise;
  return Array.from({length:months},(_,i)=>{
    const customers=free+pro+enterprise;
    const freeTasks=free*p.freeTasks,proTasks=pro*p.proTasks,enterpriseTasks=enterprise*p.enterpriseTasks;
    const tasks=freeTasks+proTasks+enterpriseTasks;
    const freeRuns=freeTasks*c.share*p.attemptsPerTask;
    const proRuns=proTasks*c.share*p.attemptsPerTask;
    const enterpriseRuns=enterpriseTasks*c.share*p.attemptsPerTask;
    const runs=freeRuns+proRuns+enterpriseRuns;
    const costPerRun=p.seconds*p.costPerSecond+p.overheadPerAttempt;
    const executionCost=runs*costPerRun;
    const otherDeliveryCost=customers*p.otherCostPerAccount;
    const deliveryCost=executionCost+otherDeliveryCost;
    const proSubscription=pro*p.proFee;
    const enterpriseContract=enterprise*p.enterpriseFee;
    const proOverageRuns=Math.max(0,proRuns-pro*p.proIncluded);
    const enterpriseOverageRuns=Math.max(0,enterpriseRuns-enterprise*p.enterpriseIncluded);
    const paidOverageRuns=proOverageRuns+enterpriseOverageRuns;
    const usageRevenue=paidOverageRuns*p.pricePerOverage;
    const revenue=proSubscription+enterpriseContract+usageRevenue;
    const row={month:i+1,free,pro,enterprise,customers,tasks,share:c.share,
      freeRuns,proRuns,enterpriseRuns,runs,costPerRun,executionCost,otherDeliveryCost,deliveryCost,
      proSubscription,enterpriseContract,proOverageRuns,enterpriseOverageRuns,paidOverageRuns,usageRevenue,revenue,contribution:revenue-deliveryCost};
    free*=1+p.annualFreeGrowth/12;
    pro*=1+p.annualPaidGrowth/12;
    enterprise*=1+p.annualPaidGrowth/12;
    return row;
  });
}
/** Incremental NPV vs no change. Every month has its own growing execution-cost base.
 * Optional measurable benefits are cash contribution, NOT gross sales.
 * All cashflows end at the chosen analysis horizon; no residual value is presumed. */
export function investment(rows,inputs={}){
  const p={...INVESTMENT_DEFAULTS,...inputs};
  const months=Math.round(clamp(p.horizon,12,84));
  if(rows.length<months)throw new Error(`Expected ${months} months of workload data; got ${rows.length}`);
  const r=clamp(p.annualDiscount,0,50)/1200;
  function evaluate(name,upfront,savingPct,monthlyCost){
    let cumulative=-upfront,discounted=-upfront,payback=null,discountedPayback=null;
    const cashflows=rows.slice(0,months).map((work,i)=>{
      const savings=work.executionCost*clamp(savingPct,0,100)/100;
      const incrementalContribution=savings+p.sharedMonthlyBenefit-monthlyCost;
      cumulative+=incrementalContribution;
      discounted+=incrementalContribution/Math.pow(1+r,i+1);
      if(payback===null&&cumulative>=-1e-7)payback=i+1;
      if(discountedPayback===null&&discounted>=-1e-7)discountedPayback=i+1;
      return {month:i+1,executionCost:work.executionCost,savings,incrementalContribution,cumulative,discountedCumulative:discounted};
    });
    return {name,upfront,monthlyCost,savingPct,npv:discounted,undiscountedNet:cumulative,payback,discountedPayback,cashflows,
      yearOneNet:sum(cashflows.slice(0,12),'incrementalContribution')-upfront};
  }
  const build=evaluate('Build',p.buildUpfront,p.buildSavingPct,p.buildMonthly);
  const buy=evaluate('Buy',p.buyUpfront,p.buySavingPct,p.buyMonthly);
  const financialLeader=build.npv>=buy.npv?build:buy;
  const bothNegative=build.npv<=0&&buy.npv<=0;
  const decision=p.required
    ? {label:`${financialLeader.name} is the lower modeled economic cost`,detail:'Capability marked strategically required. Defer is not evaluated as an implementation option. Validate delivery risk, timing and strategic fit before choosing.'}
    : bothNegative
      ? {label:'Defer on quantified economics',detail:'Neither option clears zero incremental NPV within this horizon. That is not a verdict on strategic necessity or unmodeled benefits.'}
      : {label:`${financialLeader.name} leads on modeled NPV`,detail:'Subject to strategic requirements, implementation risk and omitted benefits. The horizon is an assumption, not a guarantee.'};
  return {months,build,buy,financialLeader,bothNegative,decision,required:p.required,discountRate:p.annualDiscount};
}

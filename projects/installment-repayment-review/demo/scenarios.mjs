const data = (income, essentials, reserve, payment, arrears, fee, payday, dueDay, newDueDay) => ({
  income, essentials, reserve, payment, arrears, fee, payday, dueDay, newDueDay,
});

export const scenarios = [
  {id:"timing", name:"Timing mismatch", description:"Income arrives after the current due date.", input:data(2600,2150,100,120,120,0,17,10,21), expected:"shift"},
  {id:"split", name:"Temporary shortfall", description:"One catch-up payment would stretch the budget.", input:data(2300,1980,70,140,240,0,5,12,20), expected:"spread-3"},
  {id:"manual", name:"No room for a plan", description:"The regular payment already exceeds the budget.", input:data(2000,1790,110,140,140,0,4,11,20), expected:null},
  {id:"fee", name:"Stretched budget", description:"An up-front fee changes which plans fit.", input:data(2500,2150,100,170,300,15,7,14,22), expected:"spread-6"},
  {id:"exact", name:"Exact budget fit", description:"The peak payment uses the full available amount.", input:data(2000,1650,100,100,300,0,2,10,20), expected:"spread-2"},
  {id:"early", name:"Due day still too early", description:"The requested due date still precedes income.", input:data(2600,2100,100,140,140,0,22,7,18), expected:"spread-2"},
  {id:"cents", name:"Uneven cent amounts", description:"An amount cannot be split evenly to the cent.", input:data(2100,1780,100,115,301.01,0,5,10,20), expected:"spread-3"},
  {id:"negative", name:"Negative household margin", description:"Essentials and reserve exceed stated income.", input:data(1800,1800,100,110,110,0,5,14,20), expected:null},
];

export const featuredScenarios = scenarios.slice(0, 4);

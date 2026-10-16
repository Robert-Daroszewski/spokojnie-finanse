export function niceAxis(minimum,maximum,count=5){
 const padding=Math.max((maximum-minimum)*.08,maximum===minimum?Math.abs(maximum)*.005:0,1e-10),lo=Math.max(0,minimum-padding),hi=maximum+padding,raw=(hi-lo)/(count-1),power=10**Math.floor(Math.log10(raw)),normalized=raw/power,step=([1,2,2.5,5,10].find(n=>n>=normalized)||10)*power;
 const min=Math.max(0,Math.floor(lo/step)*step),max=Math.ceil(hi/step)*step,decimals=Math.min(10,Math.max(0,-Math.floor(Math.log10(step))+(String(step/power).includes('.')?1:0))),ticks=[];
 for(let i=0;i<=Math.round((max-min)/step);i++)ticks.push(Number((min+i*step).toFixed(decimals)));
 return {min,max,step,decimals,ticks};
}
export function chartStatistics(points){const valid=points.filter(p=>p.value!==null&&Number.isFinite(p.value));if(!valid.length)return{min:null,max:null,change:null,gaps:points.length};return{min:Math.min(...valid.map(p=>p.value)),max:Math.max(...valid.map(p=>p.value)),change:valid[0].value?(valid.at(-1).value-valid[0].value)/valid[0].value*100:null,gaps:points.length-valid.length};}

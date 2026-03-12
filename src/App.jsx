import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SB = "https://daxuzttlpnyenveflhmg.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHV6dHRscG55ZW52ZWZsaG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjYzNTcsImV4cCI6MjA4ODgwMjM1N30.V00arqOkmQiNe-IJcxr-PPqeLiCy06_H1YUo1syxMTM";
const hd = { apikey: SK, Authorization: `Bearer ${SK}` };
const q = async (t, s = "") => { try { const r = await fetch(`${SB}/rest/v1/${t}?${s}`, { headers: hd }); if (!r.ok) return []; const d = await r.json(); return Array.isArray(d) ? d : []; } catch { return []; } };

const MO = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const DA = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const DS = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
const now = new Date();
const td = now.toISOString().split("T")[0];
const dow = now.getDay();
const fmt = n => Number(n||0).toLocaleString("ru-RU");
const CI = {"Продукты":"🛒","Сладкое":"🍫","Кафе/рестораны":"☕","Транспорт":"🚕","Дом":"🏠","Злата":"🎓","Здоровье":"💊","Одежда":"👗","Подписки":"📱","Бизнес":"💼","Другое":"📦","продукты":"🛒","сладкое":"🍫","кафе":"☕","транспорт":"🚕","дом":"🏠","здоровье":"💊","одежда":"👗","другое":"📦","красота":"💅","развлечения":"🎭","образование":"📚","Без категории":"📋"};
const CC = ["#d4a853","#5ba8d4","#4a9868","#da8a3a","#d45a5a","#9a6ad4","#5ad4b8","#d4d45a","#8a8070","#d45a9a"];

function Ring({ pct, size=56, stroke=5, color="#d4a853", children }) {
  const r=(size-stroke)/2, ci=2*Math.PI*r, off=ci-(Math.min(pct||0,100)/100)*ci;
  return <div style={{position:"relative",width:size,height:size}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f1d17" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset .8s"}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>
  </div>;
}

const c={gold:"#d4a853",bg:"#0a0a0f",card:"#111110",border:"#1c1a15",text:"#e8e4dc",dim:"#8a8070",faint:"#5a5545",dark:"#1a1810",green:"#4a9868",blue:"#5ba8d4",red:"#d45a5a",orange:"#da8a3a",purple:"#9a6ad4"};

export default function DonnaApp() {
  const [tab, setTab] = useState("home");
  const [D, setD] = useState({expenses:[],expWeek:[],expMonth:[],categories:[],waterToday:null,health:[],healthSched:[],energy:[],zlata:[],zlataTasks:[],ideas:[],quotes:[],menu:[],menuR:[],dates:[],content:[],reflections:[],gratitude:[],shopping:[],sleep:[],projects:[],tasks:[],income:[],events:[]});
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [finView, setFinView] = useState("today");

  const weekStart = new Date(now); weekStart.setDate(now.getDate()-now.getDay()+1);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;

  const load = useCallback(async () => {
    setLoading(true);
    const expenses = await q("expenses",`select=*&date=eq.${td}&order=created_at.desc`);
    const expWeek = await q("expenses",`select=*&date=gte.${weekStartStr}&order=date.asc`);
    const expMonth = await q("expenses",`select=*&date=gte.${monthStart}&order=date.asc`);
    const categories = await q("finance_categories","select=*&order=sort_order.asc");
    // water_log uses glasses/goal, use view
    const waterToday = await q("v_water_today","select=*");
    // health
    const health = await q("health_log",`select=*&date=eq.${td}&order=created_at.desc`);
    const healthSched = await q("health_schedule","select=*&is_active=eq.true&order=time_of_day.asc");
    const energy = await q("energy_log","select=*&order=date.desc&limit=7");
    const zlata = await q("zlata_schedule","select=*&order=time_start.asc");
    const zlataTasks = await q("zlata_tasks",`select=*&date=eq.${td}&order=created_at.desc`);
    const ideas = await q("ideas_bank","select=*&order=created_at.desc&limit=20");
    const quotes = await q("quotes","select=*&limit=10");
    const menu = await q("menu_weekly","select=*&order=day_of_week.asc");
    const menuR = await q("menu_restrictions","select=*");
    const dates = await q("important_dates","select=*&order=date.asc");
    const content = await q("content_calendar","select=*&order=publish_date.asc&limit=20");
    const reflections = await q("reflections","select=*&order=created_at.desc&limit=5");
    const gratitude = await q("gratitude_log","select=*&order=created_at.desc&limit=10");
    const shopping = await q("shopping_list","select=*&order=created_at.desc");
    const sleep = await q("sleep_log","select=*&order=date.desc&limit=7");
    const projects = await q("projects","select=*&order=created_at.desc");
    const tasks = await q("project_tasks","select=*&order=due_date.asc");
    const income = await q("income",`select=*&date=gte.${monthStart}&order=date.desc`);
    const events = await q("daily_events",`select=*&date=eq.${td}&order=time_start.asc`);
    setD({expenses,expWeek,expMonth,categories,waterToday:waterToday[0]||null,health,healthSched,energy,zlata,zlataTasks,ideas,quotes,menu,menuR,dates,content,reflections,gratitude,shopping,sleep,projects,tasks,income,events});
    try { const wr=await fetch("https://api.open-meteo.com/v1/forecast?latitude=36.55&longitude=32.00&current=temperature_2m,weathercode&timezone=Europe/Istanbul"); if(wr.ok) setWeather(await wr.json()); } catch{}
    setLoading(false);
  },[]);

  useEffect(()=>{load();},[load]);

  // Calculations
  const totExp=D.expenses.reduce((s,e)=>s+(Number(e.amount)||0),0);
  const wGlasses=D.waterToday?Number(D.waterToday.glasses)||0:0;
  const wGoal=D.waterToday?Number(D.waterToday.goal)||8:8;
  const wPct=Math.min(100,Math.round((wGlasses/wGoal)*100));
  // health: match schedule medicine with log
  const vitTaken=D.health.filter(h=>h.taken).length;
  const vitTot=D.healthSched.length||D.health.length||0;
  const vPct=vitTot>0?Math.round((vitTaken/vitTot)*100):0;
  const todayE=D.energy.find(e=>e.date===td);
  const eL=todayE?Number(todayE.level):0;
  const ePct=eL*20;
  const eAvg=D.energy.length?(D.energy.reduce((s,e)=>s+(Number(e.level)||0),0)/D.energy.length).toFixed(1):"-";
  const byCat={};D.expenses.forEach(e=>{const k=e.category||"другое";byCat[k]=(byCat[k]||0)+(Number(e.amount)||0);});
  const catSort=Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const byCatMonth={};D.expMonth.forEach(e=>{const k=e.category||"другое";byCatMonth[k]=(byCatMonth[k]||0)+(Number(e.amount)||0);});
  const monthTotal=D.expMonth.reduce((s,e)=>s+(Number(e.amount)||0),0);
  const weekTotal=D.expWeek.reduce((s,e)=>s+(Number(e.amount)||0),0);

  const weekChart=useMemo(()=>{
    const days={};for(let i=0;i<7;i++){const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);days[d.toISOString().split("T")[0]]={day:DS[d.getDay()],amt:0};}
    D.expWeek.forEach(e=>{if(days[e.date])days[e.date].amt+=Number(e.amount)||0;});return Object.values(days);
  },[D.expWeek]);

  const monthChart=useMemo(()=>{
    const days={};D.expMonth.forEach(e=>{days[e.date]=(days[e.date]||0)+(Number(e.amount)||0);});
    return Object.entries(days).map(([d,a])=>({day:d.slice(8),amt:a}));
  },[D.expMonth]);

  const pieData=useMemo(()=>Object.entries(byCatMonth).map(([k,v],i)=>({name:k,value:v,fill:CC[i%CC.length]})),[byCatMonth]);

  const zlataProg=useMemo(()=>{
    const subj={};D.zlata.forEach(z=>{const s=z.subject||z.activity;if(!subj[s])subj[s]=0;subj[s]+=1;});
    return Object.entries(subj).map(([s,h])=>({subject:s,hours:h}));
  },[D.zlata]);

  const todayZlata=D.zlata.filter(z=>z.day_of_week===dow);
  const quote=D.quotes.length?D.quotes[Math.floor(Math.random()*D.quotes.length)]:null;
  const upDates=D.dates.filter(d=>{const dd=new Date(d.date||d.event_date);return(dd-new Date())/864e5>=-1&&(dd-new Date())/864e5<=30;}).slice(0,5);

  const wCode=weather?.current?.weathercode;
  const wTemp=weather?.current?.temperature_2m;
  const wIcon=wCode==null?"":wCode<=1?"☀️":wCode<=3?"⛅":wCode<=48?"🌫":wCode<=67?"🌧":wCode<=77?"❄️":"⛈";

  // Timeline
  const timeline=useMemo(()=>{
    const items=[];
    todayZlata.forEach(z=>items.push({time:z.time_start,title:z.subject||z.activity,type:"zlata",icon:"🎓"}));
    D.healthSched.forEach(h=>{if(h.time_of_day==="утро")items.push({time:"08:00",title:h.medicine,type:"health",icon:"💊"});else if(h.time_of_day==="вечер")items.push({time:"21:00",title:h.medicine,type:"health",icon:"💊"});});
    D.events.forEach(e=>items.push({time:e.time_start||"09:00",title:e.title,type:"event",icon:e.emoji||"📌",done:e.done}));
    const todayMeals=D.menu.filter(m=>m.day_of_week===dow);
    todayMeals.forEach(m=>{const t=m.meal_type==="завтрак"?"08:30":m.meal_type==="обед"?"13:00":m.meal_type==="ужин"?"19:00":"15:00";items.push({time:t,title:`${m.meal_type||"Еда"}: ${m.dish||m.description||""}`,type:"menu",icon:"🍽"});});
    return items.sort((a,b)=>(a.time||"").localeCompare(b.time||""));
  },[todayZlata,D.healthSched,D.events,D.menu]);

  const donnaMsg=useMemo(()=>{
    const p=[];
    if(totExp>0){p.push(`Сегодня ${fmt(totExp)} ₺.`);if(catSort.length)p.push(`${catSort[0][0]}: ${fmt(catSort[0][1])} ₺.`);}else p.push("Расходов нет. Экономишь или забыла? 😏");
    if(wPct<40)p.push("Пей воду! 💧");else if(wPct>=80)p.push("Вода в норме 👍");
    if(vPct<50&&vitTot>0)p.push("Витамины пропускаешь.");
    if(eL>0&&eL<=2)p.push("Энергия низкая — отдохни.");
    return p.join(" ");
  },[totExp,catSort,wPct,vPct,vitTot,eL]);

  const dateStr=`${DA[dow]}, ${now.getDate()} ${MO[now.getMonth()]}`;
  const tabs=[{id:"home",icon:"🏠",l:"Главная"},{id:"finance",icon:"💰",l:"Финансы"},{id:"zlata",icon:"🎓",l:"Злата"},{id:"health",icon:"💊",l:"Здоровье"},{id:"more",icon:"📋",l:"Ещё"}];
  const subs=[{id:"menu",icon:"🍽",l:"Меню"},{id:"ideas",icon:"💡",l:"Идеи"},{id:"content",icon:"📸",l:"Контент"},{id:"dates",icon:"📅",l:"Даты"},{id:"reflect",icon:"🪞",l:"Рефлексия"},{id:"gratitude",icon:"🙏",l:"Благодарность"},{id:"shopping",icon:"🛒",l:"Покупки"},{id:"projects",icon:"📁",l:"Проекты"},{id:"sleep",icon:"😴",l:"Сон"},{id:"dashboard",icon:"📊",l:"Дашборд"}];

  const S={
    app:{minHeight:"100vh",background:c.bg,color:c.text,fontFamily:"'Georgia','Palatino',serif",maxWidth:480,margin:"0 auto"},
    hdr:{padding:"16px 16px 10px",background:"linear-gradient(180deg,#14120e,#0a0a0f)",position:"relative"},
    tBar:{display:"flex",gap:2,padding:"6px 12px",overflowX:"auto",borderBottom:`1px solid ${c.border}`},
    tBtn:a=>({padding:"6px 12px",borderRadius:16,border:"none",cursor:"pointer",fontSize:11,fontFamily:"inherit",background:a?`${c.gold}18`:"transparent",color:a?c.gold:c.faint,fontWeight:a?600:400,whiteSpace:"nowrap"}),
    cnt:{padding:"12px 14px 100px"},
    crd:{background:c.card,borderRadius:14,padding:14,marginBottom:10,border:`1px solid ${c.border}`},
    crdT:{fontSize:12,color:c.dim,marginBottom:6,display:"flex",alignItems:"center",gap:6},
    big:col=>({fontSize:28,fontWeight:700,color:col||c.gold,margin:"2px 0",letterSpacing:-1}),
    sm:{fontSize:10,color:c.faint},
    g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
    g3:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8},
    row:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${c.dark}`},
    bar:{height:5,borderRadius:3,background:c.dark,overflow:"hidden",marginTop:4},
    barF:(p,col)=>({height:"100%",width:`${Math.min(p,100)}%`,background:col||c.gold,borderRadius:3,transition:"width .6s"}),
    badge:col=>({display:"inline-block",padding:"2px 7px",borderRadius:10,fontSize:9,background:`${col}18`,color:col}),
    donna:{background:"linear-gradient(135deg,#151510,#101510)",borderRadius:14,padding:14,marginBottom:10,border:"1px solid #1a2518"},
    nav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#0a0a0fee",borderTop:`1px solid ${c.border}`,display:"flex",justifyContent:"space-around",padding:"6px 0 10px",backdropFilter:"blur(20px)",zIndex:10},
    nBtn:a=>({display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"none",border:"none",cursor:"pointer",color:a?c.gold:c.faint,fontSize:9,fontFamily:"inherit"}),
    subG:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12},
    subBtn:{padding:"12px 6px",borderRadius:12,border:`1px solid ${c.border}`,background:c.card,cursor:"pointer",textAlign:"center",color:c.dim,fontSize:10,fontFamily:"inherit"},
    back:{background:"none",border:"none",color:c.dim,cursor:"pointer",fontSize:11,fontFamily:"inherit",marginBottom:8,padding:0},
    pill:a=>({padding:"5px 12px",borderRadius:14,border:"none",cursor:"pointer",fontSize:11,fontFamily:"inherit",background:a?`${c.gold}20`:"transparent",color:a?c.gold:c.faint}),
  };

  if(loading) return <div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{fontSize:36,marginBottom:10}}>✨</div><div style={{color:c.gold,fontSize:16}}>Donna загружается...</div></div></div>;

  return (
    <div style={S.app}>
      <div style={S.hdr}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24,fontWeight:700,color:c.gold}}>Donna</span>
              {weather&&<span style={{fontSize:13,color:c.dim}}>{wIcon} {Math.round(wTemp)}°</span>}
            </div>
            <div style={{fontSize:11,color:c.dim,marginTop:2}}>{dateStr} • Аланья</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Ring pct={wPct} color={c.blue} size={40} stroke={3.5}><span style={{fontSize:11}}>💧</span></Ring>
            <Ring pct={vPct} color={c.orange} size={40} stroke={3.5}><span style={{fontSize:11}}>💊</span></Ring>
            <Ring pct={ePct} color={ePct>=60?c.green:c.red} size={40} stroke={3.5}><span style={{fontSize:11}}>⚡</span></Ring>
          </div>
        </div>
        <button onClick={load} style={{position:"absolute",top:16,right:14,background:"none",border:`1px solid ${c.border}`,borderRadius:8,color:c.dim,padding:"4px 8px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>↻</button>
      </div>

      <div style={S.tBar}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={S.tBtn(tab===t.id||(t.id==="more"&&subs.some(s=>s.id===tab)))}>{t.icon} {t.l}</button>)}</div>

      <div style={S.cnt}>
        {/* HOME */}
        {tab==="home"&&<>
          {quote&&<div style={{background:"linear-gradient(135deg,#18150e,#11100e)",borderRadius:14,padding:14,marginBottom:10,border:"1px solid #25200f",fontStyle:"italic"}}><div style={{color:"#c8c0b0",fontSize:12,lineHeight:1.5}}>"{quote.text||quote.quote_text||""}"</div><div style={{color:c.gold,fontSize:10,marginTop:5,fontStyle:"normal"}}>— {quote.author||""}</div></div>}

          <div style={S.g3}>
            <div style={{...S.crd,cursor:"pointer"}} onClick={()=>setTab("finance")}><div style={S.crdT}>💰 Сегодня</div><div style={S.big(c.gold)}>{fmt(totExp)}₺</div><div style={S.sm}>Нед: {fmt(weekTotal)}₺</div></div>
            <div style={S.crd}><div style={S.crdT}>⚡ Энергия</div><div style={S.big(c.green)}>{eL||"—"}/5</div><div style={S.sm}>Ср: {eAvg}</div></div>
            <div style={{...S.crd,cursor:"pointer"}} onClick={()=>setTab("health")}><div style={S.crdT}>💧 Вода</div><div style={S.big(c.blue)}>{wGlasses}/{wGoal}</div><div style={S.sm}>{wPct}% стак.</div></div>
          </div>

          {timeline.length>0&&<div style={S.crd}><div style={S.crdT}>📋 Сегодня по часам</div>{timeline.map((t,i)=>{const nowM=now.getHours()*60+now.getMinutes();const tM=parseInt(t.time||"0")*60+parseInt((t.time||"0:0").split(":")[1]||0);return <div key={i} style={{display:"flex",gap:10,padding:"5px 0",borderBottom:`1px solid ${c.dark}`,opacity:tM<nowM?.5:1}}><div style={{fontSize:10,color:c.dim,minWidth:36,fontFamily:"monospace"}}>{t.time}</div><span style={{fontSize:13}}>{t.icon}</span><div style={{fontSize:11,color:t.done?c.faint:"#c8c0b0",textDecoration:t.done?"line-through":"none",flex:1}}>{t.title}</div></div>;})}</div>}

          <div style={{...S.crd,cursor:"pointer"}} onClick={()=>setTab("zlata")}><div style={{...S.crdT,justifyContent:"space-between"}}><span>🎓 Злата</span></div>{todayZlata.length===0?<div style={{color:c.faint,fontSize:11}}>Нет занятий</div>:<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{todayZlata.slice(0,5).map((z,i)=><div key={i} style={{background:c.dark,borderRadius:8,padding:"6px 10px",fontSize:11,color:"#c8c0b0"}}>{z.subject||z.activity} <span style={{color:c.faint}}>{z.time_start}</span></div>)}</div>}</div>

          {upDates.length>0&&<div style={S.crd}><div style={S.crdT}>📅 Ближайшее</div>{upDates.slice(0,3).map((d,i)=>{const dd=new Date(d.date||d.event_date);const diff=Math.ceil((dd-new Date())/864e5);return <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:"#c8c0b0"}}>{d.title||d.name||d.event}</span><span style={S.badge(diff<=3?c.red:c.dim)}>{diff===0?"сегодня":diff===1?"завтра":`${diff}дн`}</span></div>;})}</div>}

          <div style={S.donna}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:16}}>🤖</span><span style={{color:"#7a9868",fontSize:12,fontWeight:600}}>Донна говорит</span></div><div style={{color:"#a0b89a",fontSize:11,lineHeight:1.5}}>{donnaMsg}</div></div>
        </>}

        {/* FINANCE */}
        {tab==="finance"&&<>
          <div style={{display:"flex",gap:4,marginBottom:10}}>{["today","week","month"].map(v=><button key={v} onClick={()=>setFinView(v)} style={S.pill(finView===v)}>{v==="today"?"Сегодня":v==="week"?"Неделя":"Месяц"}</button>)}</div>

          {finView==="today"&&<>
            <div style={S.crd}><div style={S.crdT}>💰 Сегодня</div><div style={S.big(c.gold)}>{fmt(totExp)} ₺</div></div>
            {catSort.length>0&&<div style={S.crd}><div style={S.crdT}>📊 Категории</div>{catSort.map(([k,v],i)=><div key={k}><div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:12,color:"#c8c0b0"}}>{CI[k]||"📋"} {k}</span><span style={{fontSize:12,color:c.gold,fontWeight:600}}>{fmt(v)}₺</span></div><div style={S.bar}><div style={S.barF(totExp?v/totExp*100:0,CC[i%CC.length])}/></div></div>)}</div>}
            <div style={S.crd}><div style={S.crdT}>📝 Записи</div>{D.expenses.length===0?<div style={{color:c.faint,fontSize:11}}>Нет записей</div>:D.expenses.map((e,i)=><div key={e.id||i} style={S.row}><div><div style={{fontSize:12,color:"#c8c0b0"}}>{CI[e.category]||"📋"} {e.description||e.category||"—"}</div><div style={S.sm}>{e.category}•{(e.time||e.created_at||"").slice(0,5)}</div></div><div style={{fontSize:14,color:c.gold,fontWeight:600}}>{fmt(e.amount)}₺</div></div>)}</div>
          </>}

          {finView==="week"&&<div style={S.crd}><div style={S.crdT}>📊 Неделя: {fmt(weekTotal)} ₺</div><div style={{height:140}}><ResponsiveContainer><BarChart data={weekChart}><XAxis dataKey="day" tick={{fill:c.faint,fontSize:10}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip contentStyle={{background:c.card,border:`1px solid ${c.border}`,borderRadius:8,fontSize:11,color:c.text}} formatter={v=>[`${fmt(v)} ₺`]}/><Bar dataKey="amt" fill={c.gold} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>}

          {finView==="month"&&<>
            <div style={S.crd}><div style={S.crdT}>📊 Месяц: {fmt(monthTotal)} ₺</div><div style={{height:140}}><ResponsiveContainer><LineChart data={monthChart}><XAxis dataKey="day" tick={{fill:c.faint,fontSize:9}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip contentStyle={{background:c.card,border:`1px solid ${c.border}`,borderRadius:8,fontSize:11}} formatter={v=>[`${fmt(v)} ₺`]}/><Line type="monotone" dataKey="amt" stroke={c.gold} strokeWidth={2} dot={{fill:c.gold,r:3}}/></LineChart></ResponsiveContainer></div></div>

            {D.categories.filter(ct=>ct.monthly_budget).length>0&&<div style={S.crd}><div style={S.crdT}>💳 Бюджет</div>{D.categories.filter(ct=>ct.monthly_budget).map((ct,i)=>{const spent=byCatMonth[ct.category]||0;const budget=Number(ct.monthly_budget);const pct=budget?Math.round(spent/budget*100):0;return <div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:"#c8c0b0"}}>{ct.icon||"📋"} {ct.category}</span><span style={{color:pct>90?c.red:pct>70?c.orange:c.green}}>{fmt(spent)}/{fmt(budget)}₺</span></div><div style={S.bar}><div style={S.barF(pct,pct>90?c.red:pct>70?c.orange:c.green)}/></div></div>;})}</div>}

            {pieData.length>0&&<div style={S.crd}><div style={S.crdT}>🥧 Структура</div><div style={{height:150}}><ResponsiveContainer><PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2}>{pieData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Pie><Tooltip formatter={v=>[`${fmt(v)} ₺`]}/></PieChart></ResponsiveContainer></div><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>{pieData.map((p,i)=><span key={i} style={{fontSize:9,color:p.fill}}>● {p.name}</span>)}</div></div>}

            <div style={S.crd}><div style={S.crdT}>🟩 Heatmap</div><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{DS.map(d=><div key={d} style={{fontSize:8,color:c.faint,textAlign:"center"}}>{d}</div>)}{(()=>{const cells=[];const fd=new Date(now.getFullYear(),now.getMonth(),1).getDay();const dim=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();const byD={};D.expMonth.forEach(e=>{byD[e.date]=(byD[e.date]||0)+(Number(e.amount)||0);});const mx=Math.max(...Object.values(byD),1);for(let i=0;i<(fd===0?6:fd-1);i++)cells.push(<div key={`e${i}`}/>);for(let d=1;d<=dim;d++){const dk=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const val=byD[dk]||0;const int=val/mx;cells.push(<div key={d} title={`${d}: ${fmt(val)}₺`} style={{width:"100%",aspectRatio:"1",borderRadius:3,background:val===0?c.dark:int>.7?c.gold:int>.4?"#8a7030":"#3a3020"}}/>);}return cells;})()}</div></div>
          </>}
        </>}

        {/* ZLATA */}
        {tab==="zlata"&&<>
          <div style={S.crd}><div style={S.crdT}>🎓 Сегодня ({DA[dow]})</div>{todayZlata.length===0?<div style={{color:c.faint,fontSize:11}}>Нет</div>:todayZlata.map((z,i)=><div key={i} style={S.row}><div><div style={{fontSize:12,color:"#c8c0b0"}}>{z.subject||z.activity}</div><div style={S.sm}>{z.teacher||""}</div></div><div style={{fontSize:11,color:c.dim}}>{z.time_start}—{z.time_end}</div></div>)}</div>
          <div style={S.crd}><div style={S.crdT}>✏️ Задания</div>{D.zlataTasks.length===0?<div style={{color:c.faint,fontSize:11}}>Нет</div>:D.zlataTasks.map((t,i)=><div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${c.dark}`}}><span>{t.done?"✅":"⬜"}</span><div style={{fontSize:12,color:t.done?c.faint:"#c8c0b0",textDecoration:t.done?"line-through":"none"}}>{t.task||t.title}</div></div>)}</div>
          {zlataProg.length>0&&<div style={S.crd}><div style={S.crdT}>📊 Занятий по предметам</div><div style={{height:120}}><ResponsiveContainer><BarChart data={zlataProg} layout="vertical"><XAxis type="number" hide/><YAxis dataKey="subject" type="category" tick={{fill:c.dim,fontSize:10}} width={80} axisLine={false} tickLine={false}/><Bar dataKey="hours" fill={c.green} radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></div>}
          <div style={S.crd}><div style={S.crdT}>📅 Расписание</div>{[1,2,3,4,5,6,0].map(d=>{const dl=D.zlata.filter(z=>z.day_of_week===d);if(!dl.length)return null;return <div key={d} style={{marginBottom:8}}><div style={{fontSize:11,color:d===dow?c.gold:c.dim,fontWeight:600}}>{DA[d]}{d===dow?" ←":""}</div>{dl.map((z,i)=><div key={i} style={{fontSize:11,color:"#c8c0b0",paddingLeft:10}}>{z.time_start} — {z.subject||z.activity}</div>)}</div>;})}</div>
        </>}

        {/* HEALTH */}
        {tab==="health"&&<>
          <div style={S.g3}>
            <div style={S.crd}><div style={S.crdT}>💧</div><Ring pct={wPct} color={c.blue} size={56} stroke={4}><span style={{fontSize:10,color:c.blue,fontWeight:600}}>{wPct}%</span></Ring><div style={{...S.sm,marginTop:3}}>{wGlasses}/{wGoal} стак.</div></div>
            <div style={S.crd}><div style={S.crdT}>💊</div><Ring pct={vPct} color={c.orange} size={56} stroke={4}><span style={{fontSize:10,color:c.orange,fontWeight:600}}>{vitTaken}/{vitTot}</span></Ring><div style={{...S.sm,marginTop:3}}>{vPct}%</div></div>
            <div style={S.crd}><div style={S.crdT}>⚡</div><Ring pct={ePct} color={ePct>=60?c.green:c.red} size={56} stroke={4}><span style={{fontSize:12,color:ePct>=60?c.green:c.red,fontWeight:700}}>{eL||"—"}</span></Ring><div style={{...S.sm,marginTop:3}}>ср:{eAvg}</div></div>
          </div>
          <div style={S.crd}><div style={S.crdT}>💊 Витамины</div>{D.healthSched.length===0&&D.health.length===0?<div style={{color:c.faint,fontSize:11}}>Заполни health_schedule или скажи боту "выпила витамины"</div>:(D.healthSched.length>0?D.healthSched:D.health).map((h,i)=>{const med=h.medicine;const taken=D.health.some(hl=>hl.medicine===med&&hl.taken);return <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${c.dark}`}}><span>{taken?"✅":"⬜"}</span><div style={{flex:1}}><div style={{fontSize:12,color:taken?c.faint:"#c8c0b0",textDecoration:taken?"line-through":"none"}}>{med}</div><div style={S.sm}>{h.dosage||""}{h.time_of_day?` • ${h.time_of_day}`:""}</div></div></div>;})}</div>
          <div style={S.crd}><div style={S.crdT}>⚡ Энергия 7д</div><div style={{display:"flex",alignItems:"flex-end",height:56,gap:3}}>{D.energy.length===0?<div style={{color:c.faint,fontSize:11}}>Нет</div>:D.energy.slice(0,7).reverse().map((e,i)=>{const l=Number(e.level)||0;return <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{fontSize:9,color:l>=4?c.green:l>=3?c.orange:c.red,fontWeight:600}}>{l}</div><div style={{width:"100%",maxWidth:24,height:l*10,background:l>=4?c.green:l>=3?c.orange:c.red,borderRadius:3}}/><div style={{fontSize:7,color:c.faint,marginTop:2}}>{DS[new Date(e.date).getDay()]}</div></div>;})}</div></div>
          <div style={S.crd}><div style={S.crdT}>😴 Сон</div>{D.sleep.length===0?<div style={{color:c.faint,fontSize:11}}>Скажи боту "легла в 23:00, встала в 7:00"</div>:D.sleep.map((s,i)=><div key={i} style={S.row}><div><div style={{fontSize:12,color:"#c8c0b0"}}>{s.date}</div><div style={S.sm}>{s.bedtime}→{s.wakeup}</div></div><div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(n=><div key={n} style={{width:8,height:8,borderRadius:4,background:n<=s.quality?c.blue:c.dark}}/>)}</div></div>)}</div>
        </>}

        {/* MORE */}
        {tab==="more"&&<div style={S.subG}>{subs.map(s=><button key={s.id} onClick={()=>setTab(s.id)} style={S.subBtn}><div style={{fontSize:22,marginBottom:3}}>{s.icon}</div>{s.l}</button>)}</div>}

        {/* SUB PAGES */}
        {tab==="menu"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>🍽 Меню</div>{D.menu.length===0?<div style={{color:c.faint,fontSize:11}}>Пусто</div>:[1,2,3,4,5,6,0].map(d=>{const m=D.menu.filter(x=>x.day_of_week===d);if(!m.length)return null;return <div key={d} style={{marginBottom:8}}><div style={{fontSize:11,color:d===dow?c.gold:c.dim,fontWeight:600}}>{DA[d]}</div>{m.map((x,i)=><div key={i} style={{fontSize:11,color:"#c8c0b0",paddingLeft:10}}>{x.meal_type?`${x.meal_type}: `:""}{x.dish||x.description}</div>)}</div>;})}</div></>}

        {tab==="ideas"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>💡 Идеи ({D.ideas.length})</div>{D.ideas.length===0?<div style={{color:c.faint,fontSize:11}}>Напиши боту "идея: ..."</div>:D.ideas.map((x,i)=><div key={i} style={{padding:"6px 0",borderBottom:`1px solid ${c.dark}`}}><div style={{fontSize:12,color:"#c8c0b0"}}>{x.text||x.idea||x.title}</div><div style={{display:"flex",gap:4,marginTop:3}}>{x.category&&<span style={S.badge(c.gold)}>{x.category}</span>}<span style={S.sm}>{(x.created_at||"").slice(0,10)}</span></div></div>)}</div></>}

        {tab==="content"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>📸 Контент</div>{D.content.length===0?<div style={{color:c.faint,fontSize:11}}>Пусто</div>:D.content.map((p,i)=><div key={i} style={{padding:"6px 0",borderBottom:`1px solid ${c.dark}`}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#c8c0b0"}}>{p.title||p.topic}</span>{p.status&&<span style={S.badge(p.status==="done"?c.green:c.orange)}>{p.status}</span>}</div><div style={S.sm}>{p.publish_date}•{p.platform||"Instagram"}</div></div>)}</div></>}

        {tab==="dates"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>📅 Даты</div>{D.dates.length===0?<div style={{color:c.faint,fontSize:11}}>Нет</div>:D.dates.map((d,i)=>{const dd=new Date(d.date||d.event_date);const diff=Math.ceil((dd-new Date())/864e5);return <div key={i} style={S.row}><div><div style={{fontSize:12,color:"#c8c0b0"}}>{d.title||d.name}{d.emoji?` ${d.emoji}`:""}</div><div style={S.sm}>{dd.getDate()} {MO[dd.getMonth()]} {dd.getFullYear()}</div></div><span style={S.badge(diff>=0&&diff<=7?c.orange:c.dim)}>{diff<0?"прошло":diff===0?"сегодня!":`${diff}дн`}</span></div>;})}</div></>}

        {tab==="reflect"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>🪞 Рефлексии</div>{D.reflections.length===0?<div style={{color:c.faint,fontSize:11}}>Донна спросит в воскресенье</div>:D.reflections.map((r,i)=><div key={i} style={{padding:"8px 0",borderBottom:`1px solid ${c.dark}`}}><div style={{fontSize:10,color:c.gold}}>{(r.created_at||"").slice(0,10)}</div>{r.wins&&<div style={{fontSize:11,color:"#c8c0b0"}}>✅ {r.wins}</div>}{r.challenges&&<div style={{fontSize:11,color:c.orange}}>🔥 {r.challenges}</div>}{r.next_week&&<div style={{fontSize:11,color:c.blue}}>🎯 {r.next_week}</div>}</div>)}</div></>}

        {tab==="gratitude"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>🙏 Благодарность</div>{D.gratitude.length===0?<div style={{color:c.faint,fontSize:11}}>Скажи "благодарна за..."</div>:D.gratitude.map((g,i)=><div key={i} style={{padding:"6px 0",borderBottom:`1px solid ${c.dark}`}}><div style={{fontSize:12,color:"#c8c0b0"}}>🙏 {g.text||g.gratitude||g.entry}</div><div style={S.sm}>{(g.created_at||"").slice(0,10)}</div></div>)}</div></>}

        {tab==="shopping"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>🛒 Покупки</div>{D.shopping.length===0?<div style={{color:c.faint,fontSize:11}}>Скажи боту "купить молоко, хлеб"</div>:D.shopping.map((s,i)=><div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${c.dark}`}}><span>{s.checked?"✅":"⬜"}</span><span style={{fontSize:12,color:s.checked?c.faint:"#c8c0b0",textDecoration:s.checked?"line-through":"none"}}>{s.item}{s.quantity?` (${s.quantity})`:""}</span></div>)}</div></>}

        {tab==="projects"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>📁 Проекты</div>{D.projects.length===0?<div style={{color:c.faint,fontSize:11}}>Нет проектов</div>:D.projects.map((p,i)=>{const pt=D.tasks.filter(t=>t.project_id===p.id);const done=pt.filter(t=>t.done).length;return <div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}><span style={{fontSize:13,color:"#c8c0b0",fontWeight:600}}>{p.emoji||"📁"} {p.name}</span><span style={S.badge(p.status==="active"?c.green:c.dim)}>{p.status}</span></div>{pt.length>0&&<><div style={S.bar}><div style={S.barF(pt.length?done/pt.length*100:0,c.green)}/></div><div style={S.sm}>{done}/{pt.length} задач</div>{pt.slice(0,3).map((t,j)=><div key={j} style={{fontSize:11,color:t.done?c.faint:"#c8c0b0",paddingLeft:10}}>{t.done?"✅":"⬜"} {t.title}</div>)}</>}</div>;})}</div></>}

        {tab==="sleep"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button><div style={S.crd}><div style={S.crdT}>😴 Сон</div>{D.sleep.length===0?<div style={{color:c.faint,fontSize:11}}>Скажи боту "легла в 23:00, встала в 7:00"</div>:D.sleep.map((s,i)=><div key={i} style={S.row}><div><div style={{fontSize:12,color:"#c8c0b0"}}>{s.date}</div><div style={S.sm}>Лёг: {s.bedtime} • Встал: {s.wakeup}</div></div><div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(n=><div key={n} style={{width:8,height:8,borderRadius:4,background:n<=(s.quality||0)?c.blue:c.dark}}/>)}</div></div>)}</div></>}

        {tab==="dashboard"&&<><button onClick={()=>setTab("more")} style={S.back}>← Назад</button>
          <div style={{fontSize:16,color:c.gold,fontWeight:700,marginBottom:10}}>📊 Дашборд</div>
          <div style={S.g2}>
            <div style={S.crd}><div style={S.sm}>Неделя</div><div style={S.big(c.gold)}>{fmt(weekTotal)}₺</div></div>
            <div style={S.crd}><div style={S.sm}>Месяц</div><div style={S.big(c.orange)}>{fmt(monthTotal)}₺</div></div>
            <div style={S.crd}><div style={S.sm}>Вода</div><div style={S.big(c.blue)}>{wGlasses}/{wGoal}</div></div>
            <div style={S.crd}><div style={S.sm}>Энергия</div><div style={S.big(c.green)}>{eAvg}/5</div></div>
          </div>
          {weekChart.length>0&&<div style={S.crd}><div style={S.crdT}>💰 По дням</div><div style={{height:120}}><ResponsiveContainer><BarChart data={weekChart}><XAxis dataKey="day" tick={{fill:c.faint,fontSize:10}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip formatter={v=>[`${fmt(v)}₺`]}/><Bar dataKey="amt" fill={c.gold} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>}
          <div style={S.crd}><div style={S.crdT}>📋 Итого</div><div style={{fontSize:11,color:"#c8c0b0",lineHeight:1.8}}>💰 Неделя: {fmt(weekTotal)} ₺ ({D.expWeek.length} зап.)<br/>💧 Вода: {wGlasses}/{wGoal} стаканов ({wPct}%)<br/>💊 Витамины: {vitTaken}/{vitTot} ({vPct}%)<br/>⚡ Энергия: {eL}/5 (ср. {eAvg})<br/>🎓 Злата: {todayZlata.length} занятий</div></div>
        </>}
      </div>

      <div style={S.nav}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={S.nBtn(tab===t.id||(t.id==="more"&&subs.some(s=>s.id===tab)))}><span style={{fontSize:18}}>{t.icon}</span>{t.l}</button>)}</div>
    </div>
  );
}

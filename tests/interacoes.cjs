const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const events={},pending=[],saved=new Map();
const main={addEventListener:(event,fn)=>events[event]=fn,querySelector:()=>null};
const ctx=vm.createContext({document:{querySelector:()=>main,querySelectorAll:()=>[],getElementById:()=>null},window:{addEventListener(){}},location:{hash:'#menu'},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},confirm:()=>true,setTimeout:(fn,ms)=>{if(ms===450)pending.push(fn)},clearTimeout(){}});
const run=s=>vm.runInContext(s,ctx);
for(const f of ['model.js','app.js'])run(fs.readFileSync(path.join(__dirname,'../docs',f),'utf8'));
const click=dataset=>events.click({target:{closest:()=>({dataset,getAttributeNames:()=>[]})}});
const change=(id,value,checked)=>events.change({target:{id,value,checked}});
function ok(name,condition){assert.ok(condition,name);console.log(name+' | aprovado')}
click({add:'cuscuz'});ok('I01 · Adicionar',run('db.cart.cuscuz===1'));
change('unit','Caruaru · Centro');ok('I02 · Troca confirmada',run('db.unit===1 && !Object.keys(db.cart).length'));
click({add:'cafe'});click({go:'checkout'});ctx.location.hash='#checkout';change('enroll','',true);change('result','recusa');click({pay:''});ok('I03 · Aguardando retorno',run('paying'));pending.shift()();ok('I04 · Recusa visual',main.innerHTML.includes('Pagamento recusado'));
change('result','ok');click({pay:''});click({pay:''});ok('I05 · Duplo clique',pending.length===1);pending.shift()();
ok('I06 · Número do pedido',run('db.orders[0].id===1 && db.points===5'));
for(let n=0;n<4;n++)click({next:'1'});ok('I07 · Limite da fila',run('db.orders[0].stage===3'));
click({revoke:''});ok('I08 · Revogação',run('!db.consent && db.points===0 && db.orders.length===1'));
ctx.location.hash='#checkout';click({add:'cafe'});change('channel','Totem');click({pay:''});pending.shift()();ok('I09 · Retirada no totem',ctx.location.hash==='retirada');
ctx.location.hash='#checkout';change('channel','Web');click({add:'bolo'});click({pay:''});ctx.location.hash='#menu';pending.shift()();ok('I10 · Abandono antes do retorno',run('db.orders.length===2 && db.cart.bolo===1'));

'use strict';
const main=document.querySelector('main'), key='raizes.front.v1';
let db=initial(),category='Todos',channel='Aplicativo',enroll=false,result='ok',error='',timer,paying=false;
try{db=JSON.parse(localStorage.getItem(key))||db}catch{}
enroll=db.consent;
function toast(msg){const live=document.querySelector('#live');live.textContent=msg;clearTimeout(timer);timer=setTimeout(()=>live.textContent='',2800)}
function save(){try{localStorage.setItem(key,JSON.stringify(db))}catch{toast('Armazenamento indisponível. Dados válidos nesta sessão.')}}
function page(){return location.hash.slice(1)||'menu'}
function opts(values,current){return values.map(v=>'<option '+(v===current?'selected':'')+'>'+v+'</option>').join('')}
const stageLabels = ['Anotado', 'Na brasa', 'Prontinho pra retirar', 'Entregue'];
const channels = ['Aplicativo', 'Web', 'Totem', 'Balcão'];
const code = n => 'RN-' + String(n).padStart(3, '0');
const illustrated = (name, className = '') => `<img class="${className}" alt="" src="img/${name}.webp">`;
const personal = () => ['Aplicativo', 'Web'].includes(channel);
function title(heading, subtitle, variant = '') {
 return `<section class="screen ${variant}"><a class="back" href="#menu">Voltar ao cardápio</a>
 <h1>${heading}</h1><p class="intro">${subtitle}</p>`;
}
function selectField(label, id, values, current) {
 return `<label>${label}<select id="${id}">${opts(values, current)}</select></label>`;
}
function cart() {
 const rows = Object.entries(db.cart);
 const count = rows.reduce((total, [, n]) => total + n, 0);
 const items = rows.map(([id, n]) => {
  const p = product(id);
  return `<div class="cartline"><b>${p.name}</b><div class="row"><div class="qty">
  <button data-less="${id}" aria-label="Diminuir ${p.name}">−</button> ${n}
  <button data-add="${id}" aria-label="Aumentar ${p.name}" ${n >= available(db,p) ? 'disabled' : ''}>+</button>
  </div><strong>${money(p.price*n)}</strong></div></div>`;
 }).join('');
 return `<aside id="sacola" class="panel bag"><h2>Sua sacola <span class="count" aria-label="Quantidade de itens">${count}</span></h2>
 <div class="panel-body"><p class="pickup">Retirada em ${units[db.unit]}</p>
 ${items || '<p class="empty">Sua sacola está vazia. Escolha um sabor do cardápio para começar.</p>'}
 <div class="row total"><b>Total</b><b>${money(totals(db,false).subtotal)}</b></div>
 <button class="primary wide" data-go="checkout" ${count ? '' : 'disabled'}>Fechar pedido</button></div></aside>`;
}
function productCard(p) {
 const stock = available(db,p);
 const reason = p.month && new Date().getMonth()+1 !== p.month ? 'Disponível em junho' : 'Esgotado na unidade';
 return `<article class="product">${illustrated(p.id)}<div class="details"><h3>${p.name}</h3><p>${p.desc}</p>
 ${stock ? '' : `<small>${reason}</small>`}<div class="row"><b>${money(p.price)}</b>
 <button class="plus" aria-label="Adicionar ${p.name}" data-add="${p.id}" ${(db.cart[p.id]||0)>=stock?'disabled':''}>+</button></div></div></article>`;
}
function menu() {
 const filters = ['Todos','Da cozinha','Bebidas'].map(c => `<button class="chip" aria-pressed="${category===c}" data-cat="${c}">${c==='Da cozinha'?'Do café da manhã':c}</button>`).join('');
 return `<section class="hero"><div class="eyebrow">Cozinha regional nordestina</div><h1>Raízes do Nordeste</h1><p>Escolha sua unidade e monte seu pedido.</p></section>
 <div class="menu-grid"><section><div class="heading"><h2>Nosso cardápio</h2>
 ${selectField('Canal','channel',channels,channel)}${selectField('Unidade','unit',units,units[db.unit])}</div>
 <div class="filters">${filters}<button class="chip cartjump" data-jump>Ver sacola</button></div>
 <div class="cards">${products.filter(p=>category==='Todos'||category===p.cat).map(productCard).join('')}</div></section>${cart()}</div>`;
}
function checkout() {
 if (!Object.keys(db.cart).length) return title('Sua sacola está vazia','Escolha produtos para revisar seu pedido.')+'</section>';
 const t = totals(db,personal() && enroll);
 const club = `<section class="box club"><h3>Clube Raízes</h3>${illustrated('broto','sprout')}
 <p>A cada R$ 1,00 pago, ganhe 1 ponto. Nos próximos pedidos, o desconto é de 5% a partir de 50 pontos e 10% a partir de 100.</p>
 <label class="check"><input type="checkbox" id="enroll" ${enroll?'checked':''}>Autorizo guardar meus pontos neste navegador e participar neste pedido.</label>
 <p class="balance">Saldo atual: ${db.points} pontos. Você pode revogar o consentimento e apagar o saldo em Pedidos.</p></section>`;
 const lines = Object.entries(db.cart).map(([id,n])=>`<p class="row"><span>${n} × ${product(id).name}</span><b>${money(product(id).price*n)}</b></p>`).join('');
 return title('Vamos conferir seu pedido','Retirada em '+units[db.unit],'checkout')+`
 <div class="checkout-grid"><div class="fields"><div class="box">${selectField('Canal de atendimento','channel',channels,channel)}</div>
 ${personal()?club:'<p class="box">Pedido avulso para retirada no balcão, sem identificação ou adesão ao clube.</p>'}
 <div class="box"><label>Resposta do serviço de pagamento (simulação)<select id="result">
 <option value="ok">Aprovar</option><option value="recusa" ${result==='recusa'?'selected':''}>Recusar</option>
 <option value="falha" ${result==='falha'?'selected':''}>Serviço indisponível</option></select></label></div></div>
 <aside class="panel summary"><h2>Resumo</h2><div class="panel-body">${lines}
 <p class="row discount"><b>Desconto (${t.rate}%)</b><b>${money(t.discount)}</b></p>
 <div class="row total"><b>Total</b><b>${money(t.total)}</b></div>${error?`<p class="notice" role="alert">${error}</p>`:''}
 <button class="primary wide" data-pay>Confirmar pagamento (simulado)</button><p class="footnote">Ambiente de demonstração — nenhuma cobrança real é feita.</p></div></aside></div></section>`;
}
function timeline(o, icons=true) {
 const art = ['anotado','brasa','retirar','entregue'];
 return '<ol class="stages">'+stageLabels.map((s,i)=>`<li class="${i<=o.stage?'done':''}" ${i===o.stage?'aria-current="step"':''}>
 ${icons?illustrated(art[i]):''}<span aria-hidden="true">${i<o.stage||o.stage===3?'✓':''}</span><b>${s}</b></li>`).join('')+'</ol>';
}
function orderMeta(o) {return `${units[o.unit]} · ${o.channel} · ${new Date(o.time).toLocaleString('pt-BR')}`;}
function orderItems(o) {return Object.entries(o.items).map(([id,n])=>`${n} × ${product(id).name}`).join(' · ');}
function ticket(o, ops) {
 const forward = ops && o.stage<3 ? `<button class="primary" data-next="${o.id}">Avançar para ${stageLabels[o.stage+1].toLowerCase()}</button>` : '';
 return `<article class="order ${ops?'kitchen':'customer'}">${ops?illustrated('cozinha','kitchen-art'):''}
 <div class="ticket-body"><div class="stamp stage-${o.stage}">${stageLabels[o.stage]}</div><h3>Pedido ${code(o.id)}</h3>
 <p>${orderMeta(o)}</p><p>${orderItems(o)}</p><strong class="amount">${money(o.total)}</strong>
 ${o.discount?`<small>Desconto de ${money(o.discount)}</small>`:''}${forward}</div>
 ${ops?'':timeline(o)}${!ops && o.stage===2?`<p class="burlap">Apresente ${code(o.id)} no balcão desta unidade.</p>`:''}</article>`;
}
function clubCard() {
 const target = db.points<50 ? 50 : 100;
 const caption=db.points>=100?'Você já tem 10% de desconto.':`Faltam ${target-db.points} pontos para ${target===50?5:10}% de desconto.`;
 return `<section class="club-card">${illustrated('clube','club-art')}<div><h3>Clube Raízes</h3><p><strong>${db.points}</strong> pontos acumulados</p></div>
 <div class="benefit"><b>${caption}</b><progress aria-label="Progresso no Clube Raízes" max="${target}" value="${Math.min(target,db.points)}"></progress>
 <button data-revoke>Revogar consentimento e apagar pontos</button></div>${illustrated('carimbo','club-seal')}</section>`;
}
function orders() {
 return title('Seus pedidos','Acompanhe os pedidos deste navegador e apresente o número na retirada.','orders')+
 (db.consent?clubCard():'')+(db.orders.length?[...db.orders].reverse().map(o=>ticket(o,false)).join(''):'<p class="box">Você ainda não fez um pedido.</p>')+'</section>';
}
let filter='Todas as unidades';
function ops() {
 const rows=db.orders.filter(o=>filter==='Todas as unidades'||units[o.unit]===filter),qty={};
 rows.forEach(o=>Object.entries(o.items).forEach(([id,n])=>qty[id]=(qty[id]||0)+n));
 const best=Object.keys(qty).sort((a,b)=>qty[b]-qty[a])[0];
 const stats=[['panela','Pedidos',rows.length],['moedas','Vendas líquidas',money(rows.reduce((v,o)=>v+o.total,0))],['vendas','Mais vendido',best?product(best).name:'—']];
 return title('Operação da rede','Painel demonstrativo da equipe. Os indicadores refletem os pedidos registrados neste navegador.','operations')+
 selectField('Unidade do painel','filter',['Todas as unidades',...units],filter)+
 `<div class="stats">${stats.map(([art,label,value])=>`<div>${illustrated(art)}<section><b>${label}</b><strong>${value}</strong></section></div>`).join('')}</div>
 <h2>Fila de atendimento</h2>${rows.length?[...rows].reverse().map(o=>ticket(o,true)).join(''):'<p class="box">Nenhum pedido para esta seleção.</p>'}
 ${rows.length===1?'<p class="footnote">Sem outros pedidos na fila agora.</p>':''}</section>`;
}
function receipt() {
 const order=[...db.orders].reverse().find(o=>o.channel==='Totem');
 const start=title('Comprovante de retirada','Anote o número e apresente no balcão.','receipt');
 if (!order) return start+'<p class="box">Nenhum pedido de totem registrado.</p></section>';
 return start+`<article class="slip"><div class="row">${illustrated('recibo-marca','receipt-logo')}<b class="ink-stamp">${stageLabels[order.stage]}</b></div>
 <h2>${code(order.id)}</h2><p>${orderMeta(order)}</p><div class="row receipt-items"><span>${orderItems(order)}</span><b>${money(order.total)}</b></div>
 ${timeline(order,false)}<div class="greeting">${illustrated('caneca')}Bom apetite! A mesa está posta.</div></article>
 <a class="btn" href="#menu">Iniciar novo atendimento</a></section>`;
}
function render() {
 const routes={menu,pedidos:orders,operacao:ops,checkout,retirada:receipt};
 const current=page();
 main.innerHTML=(routes[current]||menu)();
 document.querySelectorAll('nav a').forEach(a=>{
  a.removeAttribute('aria-current');
  if(a.hash==='#'+current)a.setAttribute('aria-current','page');
 });
}
window.addEventListener('hashchange',()=>{error='';render();window.scrollTo(0,0)});
main.addEventListener('change',e=>{
 const el=e.target;
 if(el.id==='unit'){const next=units.indexOf(el.value);if(Object.keys(db.cart).length&&!confirm('Trocar de unidade esvazia sua sacola. Continuar?')){el.value=units[db.unit];return}db.unit=next;db.cart={};save()}
 if(el.id==='channel')channel=el.value;
 if(el.id==='enroll')enroll=el.checked;
 if(el.id==='result')result=el.value;
 if(el.id==='filter')filter=el.value;
 error='';render();document.getElementById(el.id)?.focus()
});
main.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 const d=b.dataset;
 if(d.go){location.hash=d.go;return}
 if('jump'in d){document.querySelector('#sacola').scrollIntoView();return}
 if(d.cat)category=d.cat;
 if(d.add){const p=product(d.add);if((db.cart[p.id]||0)<available(db,p))db.cart[p.id]=(db.cart[p.id]||0)+1;toast(p.name+' na sacola')}
 if(d.less&&--db.cart[d.less]<=0)delete db.cart[d.less];
 if('pay'in d){if(paying)return;const attempt=JSON.stringify([db.unit,db.cart,channel,enroll,result]);paying=true;b.disabled=true;b.textContent='Aguardando serviço de pagamento…';setTimeout(()=>{paying=false;if(page()!=='checkout'||attempt!==JSON.stringify([db.unit,db.cart,channel,enroll,result])){render();return}const r=buy(db,{channel,enroll,result});if(r.error)error=r.error;else{save();result='ok';location.hash=channel==='Totem'?'retirada':'pedidos';toast('Pedido '+code(r.order.id)+' confirmado');return}render()},450);return}
 if(d.next){const o=db.orders.find(o=>o.id===Number(d.next));if(o&&o.stage<3)o.stage++}
 if('revoke'in d){if(!confirm('Apagar os pontos e encerrar a participação no clube?'))return;db.points=0;db.consent=false;enroll=false;toast('Participação encerrada e saldo apagado')}
 save();render();const attr=b.getAttributeNames().find(k=>k.startsWith('data-'));if(attr)main.querySelector('button['+attr+'="'+b.getAttribute(attr)+'"]:not(:disabled)')?.focus({preventScroll:true})
});
window.addEventListener('storage',e=>{if(e.key===key&&e.newValue){try{db=JSON.parse(e.newValue);enroll=db.consent;render()}catch{}}});
render();

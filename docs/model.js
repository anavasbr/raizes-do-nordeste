'use strict';
const units=['Recife · Boa Vista','Caruaru · Centro'];
const products=[
 {id:'cuscuz',name:'Cuscuz na manteiga',desc:'Flocão de milho no vapor e manteiga de garrafa.',cat:'Da cozinha',price:1290,stock:[9,5]},
 {id:'tapioca',name:'Tapioca de coalho',desc:'Goma na chapa com queijo coalho dourado.',cat:'Da cozinha',price:1590,stock:[8,0]},
 {id:'cafe',name:'Café coado',desc:'Café passado na hora, servido na xícara.',cat:'Bebidas',price:590,stock:[18,12]},
 {id:'bolo',name:'Bolo de macaxeira',desc:'Uma fatia de bolo de mandioca com coco.',cat:'Da cozinha',price:890,stock:[6,7]},
 {id:'suco',name:'Suco de cajá',desc:'Cajá batido com água, servido gelado.',cat:'Bebidas',price:990,stock:[8,4]},
 {id:'milho',name:'Bolo de milho junino',desc:'Receita de milho verde da temporada de junho.',cat:'Da cozinha',price:990,stock:[5,3],month:6}
];
const stages=['Recebido','Em preparo','Pronto para retirada','Entregue'];
const initial=()=>({unit:0,cart:{},orders:[],points:0,consent:false});
const money=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const product=id=>products.find(p=>p.id===id);
function available(state,p,month=new Date().getMonth()+1){
 if(p.month && p.month!==month)return 0;
 const sold=state.orders.filter(o=>o.unit===state.unit).reduce((n,o)=>n+(o.items[p.id]||0),0);
 return Math.max(0,p.stock[state.unit]-sold);
}
function totals(state,enrolled){
 const subtotal=Object.entries(state.cart).reduce((sum,[id,n])=>sum+product(id).price*n,0);
 const rate=enrolled&&state.consent?(state.points>=100?10:state.points>=50?5:0):0;
 const discount=Math.round(subtotal*rate/100);
 return {subtotal,rate,discount,total:subtotal-discount};
}
function buy(state,{channel,enroll,result}){
 if(!Object.keys(state.cart).length)return {error:'O pedido está vazio.'};
 if(Object.entries(state.cart).some(([id,n])=>n>available(state,product(id))))return {error:'Estoque insuficiente. Revise as quantidades no cardápio.'};
 if(result!=='ok')return {error:result==='recusa'?'Pagamento recusado. Sua sacola foi preservada.':'Serviço indisponível. Sua sacola foi preservada.'};
 const member=['Aplicativo','Web'].includes(channel)&&enroll;
 const amounts=totals(state,member);
 const order={id:1+state.orders.reduce((v,o)=>Math.max(v,o.id),0),unit:state.unit,items:{...state.cart},channel,...amounts,earned:member?Math.floor(amounts.total/100):0,stage:0,time:Date.now()};
 state.orders.push(order);state.cart={};
 if(member){state.consent=true;state.points+=order.earned}
 return {order};
}

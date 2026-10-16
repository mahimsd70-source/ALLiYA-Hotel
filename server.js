const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const MENU = {
  "1": {name:"Paneer", price:220, emoji:"🍛"},
  "2": {name:"Biryani", price:180, emoji:"🍚"},
  "3": {name:"Dosa", price:120, emoji:"🥞"},
  "4": {name:"Meals", price:150, emoji:"🍱"}
};
let orders = {};

function getProReply(text,userId="test"){
  text=(text||"").toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();
  if(orders[userId]?.step==="qty" && text.match(/\d+/)){
    let qty=parseInt(text.match(/\d+/)[0]);
    if(qty>0 && qty<20){
      let item=orders[userId].item;
      let total=item.price*qty;
      orders[userId]={...orders[userId],qty,total,step:"confirm"};
      return `Order: ${item.name} x ${qty} = Rs${total}\n1 Online ${Math.round(total*0.95)} / 2 COD\nType 1 or 2`;
    }
  }
  if(orders[userId]?.step==="confirm"){
    if(text.includes("1") || text.includes("online") || text.includes("pay")){
      let o=orders[userId]; let amt=Math.round(o.total*0.95);
      orders[userId]={step:"menu"};
      return `Order Confirmed #ALY${Date.now().toString().slice(-6)}\n${o.item.name} x ${o.qty} = Rs${amt} (Online)\n30 mins delivery!`;
    }
    if(text.includes("2") || text.includes("cod") || text.includes("cash")){
      let o=orders[userId];
      orders[userId]={step:"menu"};
      return `Order Confirmed #ALY${Date.now().toString().slice(-6)}\n${o.item.name} x ${o.qty} = Rs${o.total} (COD)\n30 mins delivery!`;
    }
  }
  if(["hi","hello","hey","vanakkam","menu","start",""].includes(text)){
    orders[userId]={step:"menu"};
    return `Vanakkam! Hotel AALIYAA\nMENU:\n1 Paneer Rs220\n2 Biryani Rs180\n3 Dosa Rs120\n4 Meals Rs150\nType 1-4 to order`;
  }
  if(MENU[text] || (text.length===1 && MENU[text])){
    let k=MENU[text]?text:text[0];
    let item=MENU[k];
    orders[userId]={item:item,step:"qty"};
    return `${item.emoji} ${item.name} Rs${item.price}\nHow many plates? Type 2`;
  }
  return `Type hi for Menu da`;
}

app.get('/',(req,res)=>res.send('Bot Live'));
app.get('/test',(req,res)=>res.sendFile(__dirname+'/test.html'));
app.post('/fake-reply',(req,res)=>{
  res.json({reply:getProReply(req.body.text)});
});
app.get('/test*',(req,res)=>res.sendFile(__dirname+'/test.html'));
app.listen(3000,()=>console.log('RUNNING http://localhost:3000/test'));
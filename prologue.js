/* Tzuyu's iPhone — chat-only timeline (fan-made fictional messages). */
const CHAT_KEY = 'tzuyu_phone_chat_only_v1';
const builtinScreen = screen;
const contactNames = {sana:'Sana',jeongyeon:'Jeongyeon',group:'TWICE 🍭',mina:'Mina'};
const contactFaces = {sana:'🐹',jeongyeon:'🐶',group:'🍭',mina:'🐧'};
function cleanPhoneUI(h){
  for(const [from,to] of [
    ['模拟手机 · 仅限虚构剧情',''],['视频取景 · 预设素材','照片'],
    ['· 模拟',''],['· fictional post',''],
    ['虚构邮件演示，无真实通信。',''],
    ['纯剧情氛围，不代表实际天气数据。',''],
    ['模拟来电记录 · 仅剧情使用','最近通话'],
    ['虚构模拟通话（不拨打真实号码）','正在呼叫…'],
    ['原创虚构播放列表；无未授权音乐播放。','我的播放列表']
  ])h=h.replaceAll(from,to);
  return h;
}
screen = function(h,k='view'){S.dataset.phoneView='';builtinScreen(cleanPhoneUI(h),k)};
const escapePhone=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const freshChat=()=>({step:'waiting_jeong',messages:[{thread:'sana',who:'sana',text:'今天的排练辛苦了ㅠㅠ 我先回宿舍洗澡啦',time:'22:14',id:1}],queue:[{thread:'jeongyeon',who:'jeongyeon',text:'你还在练习室吗？灯都快关了。',time:'23:36',due:Date.now()+4200}],seen:{},active:'',sequence:2,choices:{}});
let chatState;try{chatState=JSON.parse(localStorage.getItem(CHAT_KEY))||freshChat()}catch{chatState=freshChat()}
if(!chatState||!Array.isArray(chatState.queue)||!Array.isArray(chatState.messages))chatState=freshChat();
function savePhoneChat(){try{localStorage.setItem(CHAT_KEY,JSON.stringify(chatState))}catch(e){}}
savePhoneChat();
function schedulePhone(t,who,text,time,delay){
  const end=Math.max(Date.now(),...chatState.queue.map(x=>x.due));
  chatState.queue.push({thread:t,who,text,time,due:end+delay});
}
function schedulePhoneBatch(items){items.forEach(a=>schedulePhone(...a));savePhoneChat()}
function queueFinished(){
  const map={sending_sana:'reply_sana',sending_night:'reply_night',sending_morning:'reply_morning',sending_noon:'reply_group',sending_mina:'reply_mina',closing:'reply_evening',sending_evening:'idle'};
  chatState.step=map[chatState.step]||chatState.step;
}
function processPhoneMessages(){
  const now=Date.now();let received=chatState.queue.filter(x=>x.due<=now);
  if(!received.length)return;
  chatState.queue=chatState.queue.filter(x=>x.due>now);
  for(const m of received){
    chatState.messages.push({...m,id:chatState.sequence++});
    if(chatState.step==='waiting_jeong')chatState.step='reply_jeong';
    if(unlocked&&!(S.dataset.phoneView==='chat'&&chatState.active===m.thread))toast(contactNames[m.thread]+'：'+m.text.slice(0,35));
  }
  if(!chatState.queue.length)queueFinished();
  savePhoneChat();
  if(unlocked&&S.dataset.phoneView==='chat')phoneThread(chatState.active,false);
  if(unlocked&&S.dataset.phoneView==='threads')phoneThreads(false);
}
function phoneOptions(t){
  const step=chatState.step;
  if(t==='jeongyeon'&&step==='reply_jeong')return ['还在，马上回去。','再练一会儿ㅎㅎ'];
  if(t==='sana'&&step==='reply_sana')return ['欧尼已经回去了吧？','好，等我一下。'];
  if(t==='sana'&&step==='reply_night')return ['晚安','晚安，欧尼'];
  if(t==='jeongyeon'&&step==='reply_morning')return ['一点多','好像没睡够。'];
  if(t==='group'&&step==='reply_group')return ['不是我拿的ㅋㅋ','欧尼们快来吃早餐'];
  if(t==='mina'&&step==='reply_mina')return ['欧尼在说什么？','我们怎么了吗？'];
  if(t==='sana'&&step==='reply_evening')return ['好呀，等你。','欧尼要请我喝草莓牛奶吗ㅋㅋ'];
  return [];
}
function sendPhoneReply(n){
  const t=chatState.active,opts=phoneOptions(t),step=chatState.step;
  if(!opts[n])return;
  const time={reply_jeong:'23:37',reply_sana:'23:42',reply_night:'01:52',reply_morning:'07:41',reply_group:'07:55',reply_mina:'12:11',reply_evening:'18:33'}[step];
  chatState.messages.push({thread:t,who:'me',text:opts[n],time,id:chatState.sequence++});chatState.choices[step]=n;
  if(step==='reply_jeong'){
    chatState.step='sending_sana';
    schedulePhoneBatch([
      ['jeongyeon','jeongyeon','回去记得把灯关好。','23:37',2300],
      ['sana','sana','果然还在练习室。','23:40',2700],
      ['sana','sana','我刚刚回去找你了ㅋㅋ','23:40',3100],
      ['sana','sana','快回去休息啦。明天还要早起。','23:41',3200]
    ]);
  } else if(step==='reply_sana'){
    chatState.step='sending_night';
    schedulePhoneBatch([
      ['sana','sana','睡了吗','01:47',6500],
      ['sana','sana','刚才练习室','01:47',3100],
      ['sana','sana','…没什么','01:48',4200],
      ['sana','sana','晚安','01:48',3300]
    ]);
  } else if(step==='reply_night'){
    chatState.step='sending_morning';
    schedulePhoneBatch([
      ['jeongyeon','jeongyeon','昨晚几点睡的？','07:40',9500],
      ['group','jihyo','八点下楼，记得吃早饭！','07:52',2500],
      ['group','nayeon','桌上的草莓牛奶是谁的？','07:52',2900],
      ['group','momo','不是我的','07:53',2700],
      ['group','jeongyeon','没人问你ㅋㅋ','07:53',3000],
      ['group','dahyun','ㅋㅋㅋㅋㅋㅋ','07:54',2300]
    ]);
  } else if(step==='reply_morning'){
    chatState.step='sending_noon';
    schedulePhoneBatch([
      ['jeongyeon','jeongyeon','我就知道。先喝杯水。','07:41',2600],
      ['sana','sana','子瑜呀 你今天有带外套吗？','10:23',5300],
      ['sana','sana','昨天那件放你化妆台上了ㅎㅎ','10:24',2800],
      ['group','nayeon','午饭有没有人跟我一起吃？','11:56',3000],
      ['group','momo','我！！','11:56',2600]
    ]);
  } else if(step==='reply_group'){
    chatState.step='sending_mina';
    schedulePhoneBatch([
      ['group','chaeyoung','有人顺路帮我带咖啡吗','11:57',3200],
      ['group','dahyun','点单发群里～','11:57',2800],
      ['mina','mina','子瑜。','12:09',6100],
      ['mina','mina','你和Sana……今天怎么了？','12:10',3300]
    ]);
  } else if(step==='reply_evening'){
    chatState.step='sending_evening';
    schedulePhoneBatch([
      ['sana','sana','ㅋㅋㅋ 那在门口见！','18:34',3200],
      ['group','nayeon','大家快点！要一起去吃饭啦','18:35',4500]
    ]);
  } else if(step==='reply_mina'){
    chatState.step='closing';
    schedulePhoneBatch([
      ['mina','mina','……没什么。','12:11',4200],
      ['group','nayeon','所以最后是谁买咖啡？','12:16',3100],
      ['group','momo','我去！但谁帮我付钱','12:16',2700],
      ['group','jihyo','你们先把下午的练习记住ㅠㅠ','12:17',3300],
      ['sana','sana','今天下班一起走吗？','18:32',6900]
    ]);
  }
  savePhoneChat();phoneThread(t,false);
}
function threadMessages(t){return chatState.messages.filter(m=>m.thread===t)}
function liveThreads(){return ['sana','jeongyeon','group','mina'].filter(t=>threadMessages(t).length)}
function phoneThreads(clear=true){
  if(clear)chatState.active='';
  const threads=liveThreads().sort((a,b)=>threadMessages(b).slice(-1)[0].id-threadMessages(a).slice(-1)[0].id);
  let h=nav('KakaoTalk')+'<h1>聊天</h1><div class="group">';
  for(const t of threads){
    const arr=threadMessages(t),last=arr[arr.length-1],unread=last.id>(chatState.seen[t]||0);
    h+=`<button class="cell" onclick="phoneThread('${t}')"><span class="avatar">${contactFaces[t]}</span><span class="cellmain"><b>${contactNames[t]}</b><div class="preview">${escapePhone(last.text)}</div></span><span class="chatListTime">${escapePhone(last.time)}</span>${unread?'<span class="newdot"></span>':''}</button>`;
  }
  h+='</div>';screen(h);S.dataset.phoneView='threads';savePhoneChat();
}
function phoneThread(t,read=true){
  if(!liveThreads().includes(t))return phoneThreads();
  chatState.active=t;
  const msgs=threadMessages(t),opts=phoneOptions(t);
  chatState.seen[t]=msgs[msgs.length-1].id;
  let h=`<div class="chatTop"><button class="back" onclick="phoneThreads()">‹ 聊天</button><span>${escapePhone(contactNames[t])}</span><button class="back" onclick="home()">完成</button></div><div class="threadBody"><div class="threadAvatar">${contactFaces[t]}</div><div class="threadName">${escapePhone(contactNames[t])}</div>`;
  let previous='';
  const memberNames={jihyo:'Jihyo',nayeon:'Nayeon',momo:'Momo',jeongyeon:'Jeongyeon',dahyun:'Dahyun',chaeyoung:'Chaeyoung'};
  for(const m of msgs){
    if(previous!==m.time){h+=`<div class="chatStamp">${escapePhone(m.time)}</div>`;previous=m.time;}
    if(t==='group'&&m.who!=='me')h+=`<div class="chatSender">${escapePhone(memberNames[m.who]||m.who)}</div>`;
    h+=`<div class="chatMessage ${m.who==='me'?'mine':''}">${escapePhone(m.text)}</div>`;
  }
  const next=chatState.queue.find(x=>x.thread===t),delta=next?.due-Date.now();
  if(delta>0&&delta<2200)h+='<div class="typing"><i></i><i></i><i></i></div>';
  h+=`</div><div class="threadComposer">${opts.length?`<div class="replyChoices">${opts.map((x,i)=>`<button onclick="sendPhoneReply(${i})">${escapePhone(x)}</button>`).join('')}</div>`:''}<div class="fakeInput">＋ <span>信息</span><span>🎙️</span></div></div>`;
  screen(h);S.dataset.phoneView='chat';S.scrollTop=S.scrollHeight;savePhoneChat();
}
messages=function(){processPhoneMessages();phoneThreads()};
chat=function(t){processPhoneMessages();phoneThread(t)};
story=function(){messages()};
home=function(){
  if(!unlocked){if(lockView==='passcode')renderPasscode();else lock();return;}
  processPhoneMessages();
  const normalApps=apps.filter(a=>a[2]!=='story').map(a=>a[2]==='messages'?['💬','KakaoTalk','messages','#f9dc34']:a);
  const d=new Date();
  screen(`<div class="homeTop">${d.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</div><div class="widget" style="min-height:99px;border:0;"><span><b style="font-size:27px">${d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</b><br><span class="small">日历 · 今天</span></span><span class="big">☁️</span></div><div class="apps">${normalApps.map(icon).join('')}</div><div class="dock">${[apps[5],apps[0],apps[1],apps[6]].map(a=>`<button class="app" onclick="openApp('${a[2]}')"><span class="ico" style="background:${a[3]}">${a[0]}</span></button>`).join('')}</div>`,'home');
  S.dataset.phoneView='home';
};
lock=function(){
  unlocked=false;pin='';lockView='lock';
  const d=clock(),last=chatState.messages[chatState.messages.length-1];
  screen(`<div class="lockDate">${d.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</div><div class="lockTime">${d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div><button class="notice" onclick="event.stopPropagation();showPasscode()"><span class="small">💬 KakaoTalk · ${escapePhone(contactNames[last.thread]||'Sana')}</span><div><b>${escapePhone(last.text)}</b></div></button><button class="lockHint" onclick="showPasscode()"><span class="lockChevron">⌃</span>上滑解锁</button>`,'lock');
};
renderPasscode=function(error=''){
  lockView='passcode';
  screen(`<div style="font-size:28px">🔒</div><div class="pinLabel">输入密码</div><div class="pinDots">${[0,1,2,3].map(i=>`<span class="${i<pin.length?'filled':''}"></span>`).join('')}</div><div class="pinError">${error}</div><div class="pinKeys">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(n=>n===''?'<span></span>':`<button class="pinKey ${n==='⌫'?'subtle':''}" onclick="pinPress('${n}')">${n}</button>`).join('')}</div><div class="pinFooter"><button class="back" style="color:#fff" onclick="lock()">取消</button></div>`,'passcode');
};
notes=function(){screen(nav('备忘录')+'<h1>备忘录</h1><div class="group"><button class="cell" onclick="openDailyNote()">📝 <span class="cellmain"><b>明天的安排</b><div class="preview">08:00 排练</div></span></button></div>')};
function openDailyNote(){screen(nav('备忘录','notes()')+'<div class="paper">08:00 排练\n☐ 带水\n☐ 拿外套\n☐ 别忘了耳返</div>')}
calendar=function(){screen(nav('日历')+'<h1>日历</h1><div class="group"><div class="cell">08:00　排练</div><div class="cell">10:20　化妆</div><div class="cell">12:10　预录</div></div>')};
social=function(){screen(nav('Moments')+`<h1>Moments</h1><div class="post"><b>🌷 Tzuyu</b><div class="postimg">🐈🌅</div><p>今天的晚霞很漂亮。</p><button class="blue" onclick="state.likes++;save();social()">♡ 喜欢 ${state.likes||''}</button></div><div class="post"><b>🎨 Chaeyoung</b><div class="postimg">🍭💗</div><p>九个人，九种颜色。</p></div>`)};
settings=function(){screen(nav('设置')+`<h1>设置</h1><div class="group"><div class="cell"><span class="cellmain">Tzuyu's iPhone<div class="preview">软件版本 1.0</div></span></div><button class="cell" onclick="lock()">锁定屏幕</button><button class="cell" onclick="resetAll()">清除聊天记录</button></div>`)};
resetAll=function(){if(confirm('清除本机聊天记录？')){chatState=freshChat();savePhoneChat();lock()}};
setInterval(()=>{
  processPhoneMessages();
  if(unlocked&&S.dataset.phoneView==='chat'){
    const n=chatState.queue.find(x=>x.thread===chatState.active);
    if(n&&n.due-Date.now()<2200&&n.due>Date.now()&&!S.querySelector('.typing'))phoneThread(chatState.active,false);
  }
},500);
lock();
/* Tzuyu's iPhone v0.9 — original, document-grounded prologue */
const PROLOGUE_STORAGE='tzuyu_phone_prologue_v09';
const originalHome=home,originalMessages=messages,originalChat=chat,originalStory=story,originalLock=lock,originalNotes=notes,originalCalendar=calendar,originalReset=resetAll;
const rawScreen=screen;screen=function(html,klass='view'){S.dataset.intro='';rawScreen(html,klass)};
const emptyPrologue=()=>({phase:'start',sceneIndex:0,choice:{},count:0,due:0,reply:null,typingCycle:0,jeongReply:false,groupRead:false,morningNote:false,lastOpen:'',finished:false});
let pro;
try{pro={...emptyPrologue(),...JSON.parse(localStorage.getItem(PROLOGUE_STORAGE)||'{}')}}catch{pro=emptyPrologue()}
function savePro(){localStorage.setItem(PROLOGUE_STORAGE,JSON.stringify(pro))}
function isIntro(){return !pro.finished}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function pNotification(){if(pro.phase==='night'&&pro.count>0)return ['睡了吗','刚才练习室','…没什么','晚安'][Math.min(pro.count-1,3)];if(pro.phase==='morning')return 'Jeongyeon：昨晚几点睡的？';return '今天的排练辛苦了ㅠㅠ 我先回宿舍洗澡啦'}
lock=function(){unlocked=false;pin='';lockView='lock';let d=clock();screen(`<div class="lockDate">${d.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</div><div class="lockTime">${d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div><button class="notice" onclick="event.stopPropagation();showPasscode()"><span class="small">💬 KakaoTalk · ${isIntro()?'Sana':'TWICE 🍭'}</span><div><b>${escapeHtml(isIntro()?pNotification():'有新的虚构故事等待探索 ✨')}</b></div></button><button class="lockHint" onclick="showPasscode()"><span class="lockChevron">⌃</span>上滑解锁<br><span class="fiction" style="color:#fff">平行世界同人 · 非真实聊天资料</span></button>`,'lock')};
home=function(){if(!unlocked){if(lockView==='passcode')renderPasscode();else lock();return}const summary=isIntro()?({start:'练习室之夜 · 已读未回',scene:'练习室之夜 · 有人在门口',night:'01:47 · Sana 的消息',morning:'第二天早晨 · 宿舍',done:'第 0 周已完成'}[pro.phase]||'故事进行中'):`Chapter ${Math.min(state.chapter+1,5)} / 5`;screen(`<div class="homeTop">♡ TZUYU · little secrets</div><button class="widget" onclick="story()" style="border:0;width:100%;text-align:left"><span><b>${isIntro()?'第 0 周 · 练习室之夜':'Our little story'}</b><br><span class="small">${summary} · 点击继续</span></span><span class="big">${isIntro()?'🌙':'🍭'}</span></button><div class="apps">${apps.map(icon).join('')}</div><div class="dock">${[apps[5],apps[0],apps[1],apps[6]].map(a=>`<button class="app" onclick="openApp('${a[2]}')"><span class="ico" style="background:${a[3]}">${a[0]}</span></button>`).join('')}</div>`,'home')};
const nightTexts=['睡了吗','刚才练习室','…没什么','晚安'];
const nightDelay=[2400,3100,4400,2900];
function progressIntro(){if(!isIntro())return;let dirty=false,now=Date.now();if(pro.phase==='night'&&pro.reply===null){let guard=0;while(pro.count<4&&pro.due&&now>=pro.due&&guard++<6){pro.count++;pro.due=pro.count<4?pro.due+nightDelay[pro.count]:0;dirty=true}}
if(pro.phase==='night'&&pro.reply!==null&&pro.typingCycle<2&&pro.due&&now>=pro.due){pro.typingCycle++;pro.due=pro.typingCycle<2?now+2600:0;dirty=true}
if(dirty){savePro();if(unlocked&&pro.lastOpen==='sana'&&S.dataset.intro==='chat')renderSanaIntro(false);else if(unlocked&&S.dataset.intro==='messages')renderMessageList(false)}}
setInterval(progressIntro,400);
function enterIntro(which){pro.lastOpen=which;savePro()}
function timeTag(label){return `<div class="threadTime">${label}</div>`}
function msg(text,mine=false,meta=''){return `<div class="msg ${mine?'out':'in'}">${escapeHtml(text)}</div>${meta?`<div class="msg-meta">${meta}</div>`:''}`}
function renderChatWrap(name,avatarIcon,inner,back='messages()'){screen(`<div class="simChatShell">${nav('KakaoTalk',back)}<div class="threadHead"><div class="avatar">${avatarIcon}</div><b>${name}</b><div class="small">虚构聊天 · 平行世界</div></div>${inner}</div>`);S.dataset.intro='chat';S.scrollTop=S.scrollHeight}
function renderSanaIntro(saveOpen=true){if(saveOpen)enterIntro('sana');let body='';if(pro.phase==='start'||pro.phase==='scene'){
body=timeTag('前一晚 · 22:14')+msg('今天的排练辛苦了ㅠㅠ 我先回宿舍洗澡啦',false)+`<div class="msg-meta">已读 · 你还没有回复</div>`;
body+=`<div class="messageHint">最后一条消息已经是三个小时前的事了。练习室只剩下几盏灯。</div><button class="storyAction" onclick="beginScene()">${pro.phase==='scene'?'返回练习室现场 →':'放下手机，继续排练 →'}</button>`;
}else if(pro.phase==='night'){
body=timeTag('昨晚 · 22:14')+msg('今天的排练辛苦了ㅠㅠ 我先回宿舍洗澡啦')+timeTag('凌晨 · 01:47');
for(let i=0;i<pro.count;i++)body+=msg(nightTexts[i],false);
if(pro.reply!==null){body+=timeTag('01:52')+msg(pro.reply==='gentle'?'晚安，欧尼':'晚安',true,'已读');if(pro.typingCycle<2)body+=`<div class="simMini">Sana 正在输入…</div><div class="typing"><i></i><i></i><i></i></div>`;else body+=`<div class="messageHint">「正在输入」出现了两次，又消失了。她最后没有发来新的消息。</div><button class="storyAction" onclick="nextMorning()">放下手机，迎接明天 →</button>`}
else if(pro.count<4)body+=`<div class="simMini">Sana 正在输入…</div><div class="typing"><i></i><i></i><i></i></div>`;
else body+=`<div class="messageHint">你看着她最后一条“晚安”。现在要回复吗？</div><button class="storyAction" onclick="replySana('short')">晚安</button><button class="storyAction secondary" onclick="replySana('gentle')">晚安，欧尼</button>`;
}else{
body=timeTag('昨晚 · 22:14')+msg('今天的排练辛苦了ㅠㅠ 我先回宿舍洗澡啦')+timeTag('凌晨 · 01:47')+nightTexts.map(v=>msg(v)).join('')+timeTag('01:52')+msg(pro.reply==='gentle'?'晚安，欧尼':'晚安',true,'已读')+`<div class="messageHint">清晨暂时没有新消息。</div>`;
}
renderChatWrap('Sana','🐹',body);}
function replySana(type){if(pro.phase!=='night'||pro.count<4||pro.reply!==null)return;pro.reply=type;pro.typingCycle=0;pro.due=Date.now()+2200;savePro();renderSanaIntro()}
function beginScene(){if(pro.phase==='start'){pro.phase='scene';pro.sceneIndex=0;savePro()}scene()}
const sceneCards=[
 {sub:'第 0 周 · 深夜练习室',title:'最后一排灯还亮着',text:'练习室只剩下一排灯。你坐在镜子前，看着三小时前就已读的聊天框。门外突然传来脚步声。',actions:[['抬头看看是谁','nextScene(1)']]},
 {sub:'深夜 · 练习室门口',title:'“果然在这里。”',text:'Sana 走了进来。她的头发还有一点湿，身上是一件宽大的灰色卫衣。\n\n“怎么不回消息？我以为你出事了。”',actions:[['“没事，我想多练一会儿。”',"pickScene('explain',0,2)"],['“欧尼怎么又回来了？”',"pickScene('explain',1,2)"]]},
 {sub:'深夜 · 镜子前',title:'肩膀靠得很近',text:'她没有追问，只是坐下来陪你。\n\n“你每次心情不好的时候都留在这里。”她看了看镜子里的人，“我有时候也一样。”',actions:[['轻轻叫她一声“Sana”',"pickScene('call',0,3)"],['转头看她一眼',"pickScene('call',1,3)"]]},
 {sub:'深夜 · 出口',title:'“走吧，太晚了。”',text:'Sana 站起来，朝你伸出手。走出练习室时，她的脚步慢了一点，刚好能与你并肩。\n\n“明天八点，别迟到。”',actions:[['牵住她伸过来的手',"pickScene('hand',0,4)"],['起身，走到她身边',"pickScene('hand',1,4)"]]},
 {sub:'凌晨 · 宿舍',title:'手机震动了一下',text:'洗漱完躺下，已经接近凌晨两点。床头的手机亮起了新通知。',actions:[['查看 Sana 的新消息','startNight()']]}
];
function nextScene(n){pro.sceneIndex=n;savePro();scene()}
function pickScene(key,value,next){pro.choice[key]=value;pro.sceneIndex=next;savePro();scene()}
function scene(){if(!unlocked){lock();return}enterIntro('scene');const c=sceneCards[Math.min(pro.sceneIndex,4)];screen(`${nav('第 0 周 · 练习室','home()')}<div class="sceneHero"><small>${c.sub}</small><h2>${c.title}</h2><div class="sceneTag">✦ 互动场景</div></div><div class="storyProgress">${sceneCards.map((_,i)=>`<span class="${i<=pro.sceneIndex?'done':''}"></span>`).join('')}</div><div class="sceneBody">${escapeHtml(c.text)}</div>${c.actions.map(a=>`<button class="storyAction" onclick="${a[1]}">${a[0]}</button>`).join('')}<p class="muted">由文档开头改编；对话选项改变部分细节，不改变人物核心性格。</p>`);S.dataset.intro='scene'}
function startNight(){pro.phase='night';pro.count=0;pro.reply=null;pro.due=Date.now()+nightDelay[0];pro.lastOpen='sana';savePro();renderSanaIntro()}
function nextMorning(){if(pro.reply===null||pro.typingCycle<2)return;pro.phase='morning';pro.lastOpen='';savePro();story()}
function renderJeong(){enterIntro('jeongyeon');let body=timeTag('第二天 · 07:40')+msg('昨晚几点睡的？');
if(pro.jeongReply){body+=msg('一点多',true)+msg('眼睛有点肿。先喝点水，八点还有排练。')+msg('还有，咖啡别忘了拿。');}
else body+=`<button class="storyAction" onclick="replyJeong()">一点多</button><button class="storyAction secondary" onclick="replyJeong()">没睡太久ㅎㅎ</button>`;
renderChatWrap('Jeongyeon','🐶',body)}
function replyJeong(){pro.jeongReply=true;savePro();renderJeong()}
function renderGroup(){enterIntro('group');let body=timeTag('第二天 · 07:52')+`<div class="sender">Jihyo ☀️</div>`+msg('八点准时下楼，记得吃早饭！')+`<div class="sender">Nayeon 🐰</div>`+msg('谁拿走了桌上最后一片面包？')+`<div class="sender">Momo 🍑</div>`+msg('不是我')+`<div class="sender">Jeongyeon 🐶</div>`+msg('还没人点名呢。')+`<div class="sender">Dahyun 🤍</div>`+msg('ㅋㅋㅋㅋㅋㅋ');
if(!pro.groupRead){pro.groupRead=true;savePro()}
body+=`<div class="messageHint">队友们已经开始新一天。故事也会继续发生在各种 App 之间。</div>`;
renderChatWrap('TWICE 🍭','🍭',body)}
function renderMessageList(saveOpen=true){if(saveOpen)enterIntro('messages');const preview=pro.phase==='night'?(pro.count?nightTexts[Math.min(pro.count-1,3)]:'凌晨的消息还没抵达…'):'今天的排练辛苦了ㅠㅠ…';let list=`<button class="cell" onclick="chat('sana')"><span class="avatar">🐹</span><span class="cellmain"><b>Sana</b><div class="preview">${escapeHtml(preview)}</div></span>${pro.phase==='night'&&pro.count>0?'<span class="newdot"></span>':'<span style="color:#aaa">›</span>'}</button>`;
if(pro.phase==='morning'){list+=`<button class="cell" onclick="chat('jeongyeon')"><span class="avatar">🐶</span><span class="cellmain"><b>Jeongyeon</b><div class="preview">昨晚几点睡的？</div></span><span class="newdot"></span></button><button class="cell" onclick="chat('group')"><span class="avatar">🍭</span><span class="cellmain"><b>TWICE</b><div class="preview">八点准时下楼，记得吃早饭！</div></span><span class="newdot"></span></button>`}
screen(nav('KakaoTalk')+`<h1>聊天</h1><div class="group">${list}</div><div class="messageHint">消息不会一次性全部出现。随着手机里的时间线推进，新对话才会解锁。</div><p class="muted">故事为平行世界同人创作，非真实私人通信。</p>`);S.dataset.intro='messages'}
messages=function(){if(isIntro()){progressIntro();renderMessageList()}else originalMessages()};
chat=function(id){if(isIntro()){progressIntro();if(id==='sana')return renderSanaIntro();if(pro.phase==='morning'&&id==='jeongyeon')return renderJeong();if(pro.phase==='morning'&&id==='group')return renderGroup();toast('这段聊天会在后面的故事中解锁');return}originalChat(id)};
function introNotes(){screen(nav('备忘录')+`<h1>备忘录</h1><div class="group"><button class="cell" onclick="introNoteDetail()">📝 <span class="cellmain"><b>明天的排练</b><div class="preview">08:00 · 不要迟到</div></span></button></div><p class="muted">有些话还没有被写进备忘录。</p>`)}
function introNoteDetail(){if(pro.phase==='morning'&&!pro.morningNote){pro.morningNote=true;savePro()}screen(nav('备忘录','notes()')+`<div class="paper">明天 08:00 排练\n\n☐ 记得喝水\n☐ 早点睡（失败了）\n☐ ……</div><button class="storyAction" onclick="story()">返回故事线索 →</button>`)}
notes=function(){if(isIntro())introNotes();else originalNotes()};
calendar=function(){if(isIntro()){screen(nav('日历')+`<h1>日历</h1><div class="paper">08:00 · TWICE 排练\n\n11:00 · 化妆与工作准备\n\n提醒：不要迟到。</div>`);return}originalCalendar()};
function finishIntro(){if(pro.phase!=='morning'||!pro.jeongReply||!pro.groupRead||!pro.morningNote)return;pro.phase='done';pro.finished=true;state.chapter=1;savePro();save();toast('第 1 周已解锁 ✨');story()}
story=function(){if(!isIntro())return originalStory();if(pro.phase==='scene')return scene();if(pro.phase==='start')return screen(nav('第 0 周 · 练习室之夜')+`<div class="sceneHero"><small>PROLOGUE · WEEK ZERO</small><h2>练习室之夜</h2><div class="sceneTag">从原始文档的第一个场景开始</div></div><div class="sceneBody">Sana 发来一条消息，你已经读过，但没有回复。<br>故事藏在聊天和日常动作里。先打开 KakaoTalk 看看。</div><button class="storyAction" onclick="chat('sana')">打开 Sana 的聊天 →</button><p class="muted">新消息会分批送达，有输入中状态与回复选项。</p>`);
if(pro.phase==='night')return renderSanaIntro();if(pro.phase==='morning'){let tasks=[['回复 Jeongyeon',pro.jeongReply,"chat('jeongyeon')"],['查看 TWICE 群聊',pro.groupRead,"chat('group')"],['阅读排练备忘录',pro.morningNote,'introNoteDetail()']];screen(nav('第 0 周 · 清晨')+`<h1>第二天早晨</h1><div class="paper">昨晚的消息没有新的后续。\n\n宿舍的早餐时间开始了，大家都在忙自己的事情。</div><div class="group">${tasks.map(t=>`<button class="cell" onclick="${t[2]}"><span>${t[1]?'✅':'○'}</span><span class="cellmain">${t[0]}</span>›</button>`).join('')}</div><button class="primary bigBtn" ${tasks.every(t=>t[1])?'':'disabled style="opacity:.45"'} onclick="finishIntro()">${tasks.every(t=>t[1])?'进入第 1 周 · 回归期 →':'完成这三个互动后继续'}</button><div class="hint">下一阶段才会出现 Mina 第一个直接说破关系的桥段。其他成员也会有各自的戏份。</div>`);return}}
resetAll=function(){if(confirm('确定清除本浏览器的剧情进度和序章进度？')){pro=emptyPrologue();savePro();state=base();save();lock()}};
lock();

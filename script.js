const API_URL = "https://script.google.com/macros/s/AKfycbzGUXOdIAi_u2TW--bTVF0z6A92pPl-00UzYhiNyHpPbPlnAIdpfSuJGe5hrk8elTOc/exec";

const $ = (id) => document.getElementById(id);
const screens = ["entry","celebration","welcome","countdown","cake","wish","thanks"];
const state = { name:"", relation:"", wish:"", guestId:"" };

function show(id){
  screens.forEach(s => $(s).classList.toggle("active", s===id));
  window.scrollTo({top:0,behavior:"auto"});
}

function personalizedRelation(relation){
  return relation === "Brother" ? "My Brother" :
         relation === "Sister" ? "My Sister" :
         relation === "Cousin" ? "My Cousin" : "My Friend";
}

function saveGuest(stage){
  const payload = {
    guestId: state.guestId,
    stage,
    name: state.name,
    relation: state.relation,
    wish: state.wish
  };
  // text/plain is intentionally used so the request stays simple for the
  // Apps Script web app; no response is needed by the visitor.
  return fetch(API_URL, {
    method:"POST",
    mode:"no-cors",
    headers:{"Content-Type":"text/plain;charset=UTF-8"},
    body:JSON.stringify(payload)
  }).catch(()=>{});
}

async function startMusic(){
  const audio=$("music");
  try{ audio.volume=.72; await audio.play(); }catch(e){}
}

function addBalloons(count){
  const box=$("balloons");
  box.innerHTML="";
  const emojis=["🎈","🎈","🎈","✨"];
  for(let i=0;i<count;i++){
    const b=document.createElement("span");
    b.className="balloon";
    b.textContent=emojis[i%emojis.length];
    b.style.left=(5+Math.random()*90)+"%";
    b.style.animationDelay=(Math.random()*1.5)+"s";
    b.style.fontSize=(26+Math.random()*22)+"px";
    box.appendChild(b);
  }
}

function confetti(){
  const box=$("balloons");
  box.innerHTML="";
  const bits=["🎉","🎈","✨","🥳","🎊"];
  for(let i=0;i<22;i++){
    const b=document.createElement("span");
    b.className="balloon";
    b.textContent=bits[i%bits.length];
    b.style.left=(3+Math.random()*94)+"%";
    b.style.animationDuration=(1.2+Math.random()*1.8)+"s";
    b.style.animationDelay=(Math.random()*.35)+"s";
    box.appendChild(b);
  }
}

function runCountdown(){
  show("countdown");
  let n=30;
  $("countdownNumber").textContent=n;
  $("countdownHint").textContent="Get ready… the magic is about to begin ✨";
  addBalloons(3);

  const timer=setInterval(()=>{
    n--;
    $("countdownNumber").textContent=n;
    if(n<=20 && n>10){
      $("countdownHint").textContent="A little closer… 🎈";
      addBalloons(5);
    }else if(n<=10 && n>3){
      $("countdownHint").textContent="Cake time is almost here! 🎂";
      $("countdownNumber").style.transform="scale(1.12)";
      addBalloons(7);
    }else if(n<=3 && n>0){
      $("countdownHint").textContent="Get ready! ✨";
      $("countdownNumber").style.transform="scale(1.22)";
    }
    if(n===0){
      clearInterval(timer);
      $("countdownNumber").textContent="🎉";
      $("countdownHint").textContent="Happy Birthday, Anurag! 🎂";
      confetti();
      setTimeout(showCake,1500);
    }
  },1000);
}

function showCake(){
  show("cake");
  $("cake").querySelector(".cake-scene").classList.remove("flash");
}

function finish(){
  $("thanksPersonal").textContent =
    `Welcome back anytime, ${state.name}! ${personalizedRelation(state.relation)} ❤️`;
  show("thanks");
}

$("guestForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const name=$("guestName").value.trim();
  const relation=$("relation").value;
  $("formError").textContent="";
  if(!name){$("formError").textContent="Please enter your name ❤️";return}
  if(!relation){$("formError").textContent="Please select your relation 🎀";return}

  state.name=name.slice(0,40);
  state.relation=relation;
  state.guestId = (crypto.randomUUID ? crypto.randomUUID() : Date.now()+"-"+Math.random());
  await startMusic();
  saveGuest("entered");

  $("personalLine").textContent =
    `${state.name}, ${personalizedRelation(state.relation)} has entered the party! 🥳`;

  show("celebration");
  setTimeout(()=>{
    $("welcomeTitle").textContent = `Namaste, ${state.name}!`;
    show("welcome");
    setTimeout(runCountdown,3500);
  },2600);
});

$("toWish").addEventListener("click",()=>show("wish"));
$("skipWish").addEventListener("click",finish);
$("skipWish2").addEventListener("click",finish);
$("sendWish").addEventListener("click",()=>{
  state.wish=$("wishText").value.trim().slice(0,500);
  saveGuest("wish");
  finish();
});

$("guestName").addEventListener("input",()=>{$("formError").textContent=""});
$("relation").addEventListener("change",()=>{$("formError").textContent=""});

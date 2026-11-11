const defaults={altClick:true,hoverAlt:false,modifierKey:"alt",middleClick:false,contextMenu:true,frameStripping:false,modalWidth:88,modalHeight:88};
const ids=Object.keys(defaults),status=document.getElementById("status");
function render(s){for(const id of ids){const el=document.getElementById(id);if(el.type==="checkbox")el.checked=!!s[id];else el.value=s[id]}labels()}
function read(){const value={};for(const id of ids){const el=document.getElementById(id);value[id]=el.type==="checkbox"?el.checked:(el.type==="range"?Number(el.value):el.value)}return value}
function labels(){document.getElementById("widthValue").textContent=document.getElementById("modalWidth").value+"%";document.getElementById("heightValue").textContent=document.getElementById("modalHeight").value+"%"}
let timer;function save(){clearTimeout(timer);timer=setTimeout(async()=>{try{await chrome.storage.sync.set(read());status.textContent="Saved";setTimeout(()=>status.textContent="Settings are saved automatically.",1200)}catch(_){status.textContent="Could not save settings."}},180)}
chrome.storage.sync.get(defaults).then(s=>render({...defaults,...s}));
ids.forEach(id=>document.getElementById(id).addEventListener("input",()=>{labels();save()}));
document.getElementById("reset").addEventListener("click",async()=>{await chrome.storage.sync.set(defaults);render(defaults);status.textContent="Defaults restored."});

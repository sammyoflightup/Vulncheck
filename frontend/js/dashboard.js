// ---------------- Logout ----------------
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// ---------------- Navigation ----------------
const sections = { profile: 'profileSection', history: 'historySection', chat: 'chatSection' };
Object.values(sections).forEach(id => document.getElementById(id).classList.add('hidden'));

document.getElementById('navDashboard').addEventListener('click', () => Object.values(sections).forEach(s => document.getElementById(s).classList.add('hidden')));
document.getElementById('navProfile').addEventListener('click', () => { Object.values(sections).forEach(s=>document.getElementById(s).classList.add('hidden')); document.getElementById('profileSection').classList.remove('hidden'); });
document.getElementById('navHistory').addEventListener('click', () => { Object.values(sections).forEach(s=>document.getElementById(s).classList.add('hidden')); document.getElementById('historySection').classList.remove('hidden'); });
document.getElementById('navChat').addEventListener('click', () => { Object.values(sections).forEach(s=>document.getElementById(s).classList.add('hidden')); document.getElementById('chatSection').classList.remove('hidden'); });

// ---------------- User Info ----------------
const token = localStorage.getItem('token');
if(!token) window.location.href = 'index.html';
document.getElementById('userEmail').innerText = "Email: " + parseJwt(token).email;

function parseJwt(token){
    try { return JSON.parse(atob(token.split('.')[1])); } 
    catch(e){ return {}; }
}

// ---------------- Scan Smart Contract ----------------
const scanBtn = document.getElementById('scanBtn');
const contractCode = document.getElementById('contractCode');
const resultsDiv = document.getElementById('results');
let riskChart;

scanBtn.addEventListener('click', async ()=>{
    const code = contractCode.value.trim();
    if(!code) return alert('Paste smart contract code first');

    const res = await fetch('http://127.0.0.1:5000/scan', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body: JSON.stringify({code})
    });
    const data = await res.json();
    if(!res.ok) return alert(data.message);

    // Results display
    resultsDiv.innerHTML = '';
    data.vulnerabilities.forEach(v => {
        const color = v.severity==='High'?'red':'mediumorchid';
        resultsDiv.innerHTML += `<div class="p-3 border rounded shadow flex justify-between items-center">
            <div>
                <p class="font-bold">${v.type}</p>
                <p>${v.recommendation}</p>
            </div>
            <span class="px-2 py-1 rounded text-white" style="background-color:${color}">${v.severity}</span>
        </div>`;
    });
    if(data.vulnerabilities.length===0) resultsDiv.innerHTML='<p class="text-green-600 font-bold">No vulnerabilities found!</p>';

    // Chart
    const chartData = {
        labels: data.vulnerabilities.map(v=>v.type),
        datasets:[{label:'Severity Score',data:data.vulnerabilities.map(v=>v.severity==='High'?3:v.severity==='Medium'?2:1),backgroundColor:'rgba(255,99,132,0.6)'}]
    };
    if(riskChart) riskChart.destroy();
    const ctx = document.getElementById('riskChart').getContext('2d');
    riskChart = new Chart(ctx,{type:'bar',data:chartData,options:{responsive:true,scales:{y:{beginAtZero:true}}}});

    // History
    const history = JSON.parse(localStorage.getItem('scanHistory')||'[]');
    history.unshift({code,vulnerabilities:data.vulnerabilities,score:data.score,date:new Date().toLocaleString()});
    localStorage.setItem('scanHistory',JSON.stringify(history));
    updateHistory();
});

// ---------------- History Cards ----------------
function updateHistory(){
    const history = JSON.parse(localStorage.getItem('scanHistory')||'[]');
    const historyList = document.getElementById('historyList');
    historyList.innerHTML='';
    history.forEach(h=>{
        let vulns = h.vulnerabilities.map(v=>v.type+' ('+v.severity+')').join(', ')||'None';
        historyList.innerHTML += `
        <div class="border p-3 rounded shadow bg-gray-50">
            <p class="font-bold">Date: ${h.date}</p>
            <p>Score: ${h.score}</p>
            <p>Vulnerabilities: ${vulns}</p>
        </div>`;
    });
}
updateHistory();

// ---------------- Chat AI ----------------
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
document.getElementById('sendChat').addEventListener('click', async ()=>{
    const message = chatInput.value.trim();
    if(!message) return;
    chatBox.innerHTML += `<p class="font-bold">You: ${message}</p>`;
    chatInput.value='';
    const res = await fetch('http://127.0.0.1:5000/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body: JSON.stringify({message})
    });
    const data = await res.json();
    chatBox.innerHTML += `<p class="text-blue-600">${data.reply}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
});

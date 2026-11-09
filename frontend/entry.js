const url=window.saarthiConnection?.url;
if(url&&/^http:\/\/127\.0\.0\.1:\d+\/frontend\/index\.html$/.test(url)){
 const target=new URL('/login',url).href;
 const link=document.getElementById('open');link.href=target;
 const status=document.getElementById('status');
 let checking=false;
 function check(){
  if(checking)return;checking=true;
  const probe=new Image();
  const timer=setTimeout(failed,2500);
  function failed(){clearTimeout(timer);probe.onload=null;probe.onerror=null;checking=false;status.textContent='The backend is not running. Double-click Start Saarthi.cmd in the parent folder. This page will open automatically when it is ready.';}
  probe.onerror=failed;
  probe.onload=()=>{clearTimeout(timer);link.hidden=false;status.textContent='Connected. Opening your workspace…';location.replace(target);};
  probe.src=new URL('/assets/gyani_mark_TRANSPARENT.png?check='+Date.now(),url).href;
 }
 check();setInterval(check,3000);
}

const form=document.getElementById('contact-form');
if(form)form.addEventListener('submit',async event=>{
 event.preventDefault();const button=form.querySelector('button[type=submit]'),status=document.getElementById('contact-result');button.disabled=true;status.textContent='Sending your enquiry…';
 try{const response=await fetch(form.action,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to send. Please try again.');status.textContent=`Enquiry received. Reference: ${result.reference}. Your message is saved to the administration inbox.`;form.querySelectorAll('input,select,textarea').forEach(input=>input.disabled=true);button.textContent='Enquiry received';status.setAttribute('tabindex','-1');status.focus();}
 catch(error){status.textContent=error.message;status.setAttribute('role','alert');button.disabled=false;}
});

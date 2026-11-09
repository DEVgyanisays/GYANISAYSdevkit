export function bindPasswordToggles(form){
 for(const input of form.querySelectorAll('input[type="password"]')){
  const label=input.closest('label');if(!label||label.parentElement.classList.contains('password-control'))continue;
  const wrapper=document.createElement('div');wrapper.className='password-control';label.before(wrapper);wrapper.append(label);
  const button=document.createElement('button');button.type='button';button.className='password-toggle';button.textContent='Show';
  const name=label.textContent.trim();input.id ||= 'password-'+crypto.randomUUID();button.setAttribute('aria-controls',input.id);button.setAttribute('aria-label','Show '+name.toLowerCase());button.setAttribute('aria-pressed','false');
  button.onclick=()=>{const showing=input.type==='password';input.type=showing?'text':'password';button.textContent=showing?'Hide':'Show';button.setAttribute('aria-label',(showing?'Hide ':'Show ')+name.toLowerCase());button.setAttribute('aria-pressed',String(showing));};
  wrapper.append(button);
 }
}

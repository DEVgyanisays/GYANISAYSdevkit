/* Presentation only. Existing state, permissions and action handlers remain in app.js. */
function refreshPresentation(cur) {
 const root = document.getElementById('rig');
 root.dataset.screen = cur;
 const main = root.querySelector('main');
 main.id = 'workspace';
 main.tabIndex = -1;
 const brand = root.querySelector('.rail-head .word');
 brand.innerHTML = '<b>Gyani Says</b><span>The Saarthi System</span>';
 const nav = root.querySelector('.rail nav');
 nav.setAttribute('aria-label', 'All workspaces and screens');
 const names = ['Join Saarthi', 'Learning & certification', 'Coach workspace', 'Administration', 'Aarambh review', 'Client experience', 'Presentation'];
 let group, index = 0;
 [...nav.children].forEach(el => {
  if (el.classList.contains('grp')) {
   group = document.createElement('details');
   group.className = 'workspace-group';
   const summary = document.createElement('summary');
   summary.textContent = names[index++] || 'Teaching & mentoring';
   group.append(summary);
   nav.insertBefore(group, el);
   el.remove();
  } else {
   group.append(el);
   el.title = el.textContent.trim();
   if (el.getAttribute('aria-current') === 'true') group.open = true;
  }
 });
 const toolbar = root.querySelector('.strip');
 const controls = toolbar.querySelector('.right');
 const review = document.createElement('details');
 review.className = 'review-tools';
 review.open = Boolean(S.ui.rigPanel);
 const summary = document.createElement('summary');
 summary.textContent = 'Review tools';
 review.append(summary, controls);
 const legend = root.querySelector('.legend');
 if (legend) controls.append(legend);
 toolbar.append(review);
 const menu = document.createElement('button');
 menu.className = 'btn sm workspace-menu';
 menu.textContent = '☰ Workspaces';
 menu.setAttribute('aria-expanded', 'false');
 menu.setAttribute('aria-controls', 'workspace-navigation');
 root.querySelector('.rail').id = 'workspace-navigation';
 menu.addEventListener('click', () => {
  const open = root.classList.toggle('navigation-open');
  menu.setAttribute('aria-expanded', String(open));
 });
 toolbar.prepend(menu);
 root.querySelector('.rail nav').addEventListener('click', event => {
  if (event.target.closest('.navi')) root.classList.remove('navigation-open');
 });
 const page = root.querySelector('.stage .page');
 if (!page) return;
 // Associate the existing visible form labels without changing input handlers.
 page.querySelectorAll('.field').forEach((field, i) => {
  const label = field.querySelector('label');
  const input = field.querySelector('input,select,textarea');
  if (label && input && !label.htmlFor) {
   if (!input.id) input.id = 'field-' + cur + '-' + i;
   label.htmlFor = input.id;
  }
 });
 if (cur === 'W1' && !S.w1.submitted) {
  page.classList.add('application-page');
  const introduction = page.firstElementChild;
  introduction.classList.add('application-intro');
  const journey = document.createElement('div');
  journey.className = 'application-journey';
  journey.setAttribute('aria-label', 'Your path to becoming a coach');
  journey.innerHTML = '<div><span>01</span><b>Apply</b><small>Tell us about yourself</small></div><div><span>02</span><b>Learn</b><small>Train with your cohort</small></div><div><span>03</span><b>Qualify</b><small>Earn your credential</small></div><div><span>04</span><b>Make a difference</b><small>Guide people in SETU</small></div>';
  introduction.after(journey);
 }
 if (cur === 'C1') {
  page.classList.add('coach-home');
  const heading = page.querySelector('.pagehead');
  if (heading) {
   const links = document.createElement('div');
   links.className = 'workspace-shortcuts';
   [['C4', 'My debriefs', 'debriefs'], ['C3', 'Availability', 'calendar'], ['S2', 'My learning', 'module']].forEach(([screen, label, icon]) => {
    const button = document.createElement('button');
    button.className = 'btn sm';
    button.innerHTML = ic(icon, 'sm') + label + ' <span aria-hidden="true">↗</span>';
    button.addEventListener('click', () => go(screen));
    links.append(button);
   });
   heading.after(links);
  }
 }
}

document.addEventListener('keydown', event => {
 if (event.key === 'Escape') {
  document.getElementById('rig')?.classList.remove('navigation-open');
  document.querySelector('.workspace-menu')?.setAttribute('aria-expanded', 'false');
 }
});

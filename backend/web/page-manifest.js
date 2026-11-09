// Public routes, metadata and sitemap use this one source of truth.
export const publicPages={
 '/about':{title:'Saarthi coaching & training workspace | Gyani Says',heading:'Good guidance starts with you.',description:'Learn about Saarthi by Gyani Says: a workspace for coach applications, training, mentoring and authorised coaching operations.',label:'About Saarthi'},
 '/contact':{title:'Contact the Saarthi team | Gyani Says',heading:'How can we help?',description:'Contact the Gyani Says Saarthi team about applications, account access, training or privacy. Send an enquiry securely to the administration team.',label:'Contact'},
 '/privacy':{title:'Privacy & cookie notice | Saarthi by Gyani Says',heading:'Your information, explained.',description:'Understand how Saarthi handles applications, account data, contact enquiries, essential cookies, optional analytics and local assistant questions.',label:'Privacy'}
};
export const workspacePages={home:'Overview',applications:'Applications',batches:'Batches',people:'People & access',catalog:'Training & configuration',curriculum:'Batch curriculum',trainees:'Trainees',faculty:'Faculty & mentors',coaches:'Coach roster',exams:'Examinations',library:'Learning library',finance:'Finance',capacity:'Capacity',settings:'Policies',debriefs:'Debriefs',clientBatches:'My client batches',requests:'Requests',undertaking:'Data undertaking',code:'Code of Ethics',data:'Database records',activity:'Activity log',status:'Service status',profile:'My profile & credential',training:'My learning',calendar:'Availability',contactInbox:'Contact inbox',knowledge:'Assistant knowledge'};
export const appPaths=['/','/frontend/index.html','/login','/apply',...Object.keys(workspacePages).map(p=>'/workspace/'+p)];
export const redirects={'/index.html':'/','/about.html':'/about','/contact-us':'/contact','/contact.html':'/contact','/privacy-policy':'/privacy','/privacy.html':'/privacy','/login.html':'/login'};


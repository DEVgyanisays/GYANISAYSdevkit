export const policyDefinitions={
 coach_lock_window_hours:{label:'Coach availability lock (hours)',group:'calendar_drops',default:72,min:24,max:168},
 no_show_wait_min:{label:'Wait before recording a no-show (minutes)',group:'calendar_drops',default:15,min:5,max:60},
 supervised_debriefs_required:{label:'Supervised sessions required',group:'training_credential',default:6,min:1,max:50},
 mentor_hours_required:{label:'Mentoring hours required',group:'training_credential',default:3,min:1,max:100}
};
export function policy(db,key){const definition=policyDefinitions[key];if(!definition)throw Error('Unknown policy');return db.prepare('SELECT value_int FROM settings WHERE setting_key=?').get(key)?.value_int??definition.default;}

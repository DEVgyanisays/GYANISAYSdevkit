import React from 'react';
import {createRoot} from 'react-dom/client';
import Application from './Form.jsx';
import Dashboard from './Dashboard.jsx';
import Leads from './Leads.jsx';
import {Header} from './components.jsx';
import './styles.css';
function Privacy(){return <main className="page form-page"><Header/><section className="card"><h1>Registration privacy notice</h1><p>This form records your RSVP, department, preferences, optional care notes and accompanying family details for the Apollo Consultant Forum picnic.</p><p>Imported names and departments are visible in the public name picker. Only authenticated organisers can access submitted family details and medical notes. The kids food manifest excludes names and medical notes.</p><p>A temporary submission identifier is stored in session storage to prevent duplicate requests. Registration records are stored in the event database. No event notification email is sent automatically.</p><p>Only provide family details with permission. Optional care fields can be left blank. Contact the organiser who shared your form link for corrections or removal. The organiser is responsible for retention and backups.</p><a href="/application/">← Back to application</a></section></main>;}
const path=window.location.pathname;
createRoot(document.getElementById('root')).render(path.startsWith('/admin/event')?<Dashboard/>:path.startsWith('/admin/prospects')?<Leads/>:path.includes('privacy')?<Privacy/>:<Application/>);

import { defineConfig } from 'vite';
export default defineConfig({base:'/event-assets/',server:{port:5173,proxy:{'/application/api':'http://127.0.0.1:3080','/admin/event/api':'http://127.0.0.1:3080'}},build:{outDir:'dist',emptyOutDir:true}});

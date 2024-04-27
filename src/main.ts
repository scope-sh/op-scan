import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';

import Op from '@/pages/Op.vue';

import App from './App.vue';

const routerHistory = createWebHistory();
const router = createRouter({
  history: routerHistory,
  routes: [{ path: '/op/:hash', name: 'op', component: Op }],
});

const app = createApp(App);

app.use(router);

app.mount('#app');

export { routerHistory, router };

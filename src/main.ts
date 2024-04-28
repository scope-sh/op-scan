import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';

import Home from '@/pages/Home.vue';
import Op from '@/pages/Op.vue';

import App from './App.vue';

const routerHistory = createWebHistory();
const router = createRouter({
  history: routerHistory,
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/op/:hash', name: 'op', component: Op },
  ],
});

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);

app.mount('#app');

export { routerHistory, router };

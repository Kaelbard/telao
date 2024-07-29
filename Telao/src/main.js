// Imports ========================================================================
import { createApp } from 'vue'
import App from './App.vue'
import { carregarScriptsHead } from '../public/util.js'
import { storeRodape } from './store';


// CreateApp ========================================================================
const app = createApp(App);
app.use(storeRodape);
app.mount('#app');

// Métodos ========================================================================
carregarScriptsHead();
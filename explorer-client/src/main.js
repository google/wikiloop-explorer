// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueGoogleCharts from 'vue-google-charts'
import VueAnalytics from 'vue-analytics'
import router from './router'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(VueGoogleCharts)
Vue.use(VueAnalytics, {
  id: 'UA-122681777-4',
  router
})

new Vue({
  el: '#app',
  router,
  render: h => h(App),
})

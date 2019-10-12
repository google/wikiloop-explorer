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

/**
 * @fileoverview Routes
 */
import Vue from 'vue'
import Router from 'vue-router'
import WelcomePage from '@/components/WelcomePage'
import DatasetView from '@/components/DatasetView'
import ToolsList from '@/components/ToolsList'
import Stats from '@/components/Stats'
import Leaderboard from '@/components/Leaderboard'
import AdvancedSearch from '@/components/AdvancedSearch'
import CatFactsAdvancedSearch from '@/components/CatFactsAdvancedSearch'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: WelcomePage
    },
    {
      path: '/dataset/:dsname',
      name: 'DatasetView',
      component: DatasetView,
      props: true
    },
    {
      path: '/tools',
      name: 'ToolsList',
      component: ToolsList
    },
    {
      path: '/stats/:dsname/:epoch',
      name: 'Stats',
      component: Stats,
      props: true
    },
    {
      path: '/leaderboard/:dsname/:epoch',
      name: 'Leaderboard',
      component: Leaderboard,
      props: true
    },
    {
      path: '/advancedsearch',
      name: 'AdvancedSearch',
      component: AdvancedSearch,
      props: route => ({
        dsname: route.query.dsname,
        epoch: route.query.epoch
      })
    },
    {
      path: '/catfactadvancedsearch',
      name: 'CatFactsAdvancedSearch',
      component: CatFactsAdvancedSearch,
      props: route => ({
        dsname: route.query.dsname,
        epoch: route.query.epoch
      })
    },    
  ]
})


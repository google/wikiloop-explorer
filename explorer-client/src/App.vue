<!--
  Copyright 2019 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<template>
  <div id="app">
    <b-container>
      <!--<img alt="Wikiloop logo" src="./assets/wikiloop.png" width='40%' height='40%'>-->
      <b-navbar toggleable="md" type="dark" variant="dark">
        <b-navbar-brand :to="{name: 'Home'}">Home</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav align="left">
            <b-nav-item-dropdown text="Datasets">
              <b-dropdown-item
                v-for="dataset in datasetList"
                v-bind:key="dataset"
                :to="{name: 'DatasetView', params: {dsname: dataset}}"
              >{{getDisplayName(dataset)}}</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item :to="{name: 'ToolsList'}">Tools</b-nav-item>
            <b-nav-item href="https://github.com/google/wikiloop-explorer/issues">Issues</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
      <router-view :key="$route.fullPath"></router-view>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";
import { getNameForDisplay } from "./utils/utils";

const backend_url =
  "https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com";
export default {
  name: "app",
  data() {
    return {
      datasetList: []
    };
  },
  mounted: function() {
    this.loadDatasetList();
  },
  methods: {
    loadDatasetList: function() {
      axios.get(backend_url + "/dslist").then(response => {
        this.datasetList = response.data;
      });
    },
    getDisplayName: function(dsname) {
      return getNameForDisplay(dsname);
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

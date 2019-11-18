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
<b-container>
  <b-row align-v="center">
    <b-col>
      <h1 class="font-weight-bold my-4 text-left">Wikiloop Pagerank</h1>
    </b-col>
  </b-row>
  <b-row class="text-left" align-v="center">
    <b-col>
      <p class="head-description">
        Wikiloop Pagerank provides pagerank scores of pages only computed through Wikipedia Links. It is computed through a directed graph built on Wikipedia pages and their outgoing links. Currently only En Wikipedia is considered.
      </p>
      <p class="head-description">
        Enter a Wikipedia link that start with "http://" to get it's score.
      </p>      
    </b-col>
  </b-row>
  <b-row>
    <b-col lg="8" offset-lg="2" md="10" offset-md="1">
    <b-input-group>
      <b-form-input v-model="inputLink" placeholder="http://" @keyup.enter="onSearch()"></b-form-input>
      <b-input-group-append>
        <b-button variant="primary" :disabled="!inputLink" @click="onSearch()">Get Score!</b-button>
      </b-input-group-append>
    </b-input-group>
    </b-col>
  </b-row>

  <b-row style="margin-top: 2rem">
    <b-col lg="8" offset-lg="2" md="10" offset-md="1">
    <b-spinner label="Loading..." v-if="searching" variant="info"></b-spinner>
    <div v-if="searched && result.length == 0" class="error-message">Sorry, link not found.</div>
    <b-table
      v-if="searched && result.length != 0"
      responsive
      striped
      bordered
      hover
      id="revision-table"
      head-variant="light"
      :items="result"
      :fields="resultFields"      
    >
      <template v-slot:cell(url)="data">
        <span v-html="getALink(data.value)"></span>
      </template>
    </b-table>
    </b-col>
  </b-row>
  <b-row style="margin-top: 5rem; margin-bottom: 2rem" v-if="searched && result.length != 0">
    <b-col class="text-left" lg="8" offset-lg="2" md="10" offset-md="1">
    <div class="head-description">FYI, top ten pages are:</div>
    <b-table
      responsive
      striped
      bordered
      hover
      id="revision-table"
      head-variant="light"
      :items="topTen"
      :fields="resultFields"      
    >
      <template v-slot:cell(url)="data">
        <span v-html="getALink(data.value)"></span>
      </template>
    </b-table>  
    </b-col>  
  </b-row>
</b-container>
</template>

<script>
import axios from "axios";
const backendurl =
  "https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com";

export default {
  name: 'PagerankDetail',
  data() {
    return {
      inputLink: "",
      searching: false,
      searched: false,  
      result: [],  
      resultFields: [
          { key: "url", label: "Link URL"},
          { key: "value", label: "Pagerank Score"}
      ],
      topTen: [
        {url: "http://en.wikipedia.org/wiki/International_Standard_Book_Number", value: 0.0030070156615007253},
        {url: "http://en.wikipedia.org/wiki/Digital_object_identifier", value: 0.0011467643169166934},
        {url: "http://en.wikipedia.org/wiki/Help:Maintenance_template_removal", value: 0.0010179748068567137},
        {url: "http://en.wikipedia.org/wiki/Geographic_coordinate_system", value: 0.0009128363269857219},
        {url: "http://en.wikipedia.org/wiki/Wikipedia:Verifiability", value:0.00090232002625045},
        {url: "http://en.wikipedia.org/wiki/Wikipedia:Citation_needed", value:0.0007397634551143886},
        {url: "http://en.wikipedia.org/wiki/United_States", value: 0.0006761432046190098},
        {url: "http://en.wikipedia.org/wiki/Wayback_Machine", value: 0.0006212103487215024},
        {url: "http://en.wikipedia.org/wiki/File:Question_book-new.svg", value:0.0005859038354802887},
        {url: "http://en.wikipedia.org/wiki/Help:Authority_control", value: 0.0005439768055265026},
      ]

    }
  },
  methods: {
    onSearch: async function() {
      let dt = {
        url: this.inputLink
      };
      this.searched = false;
      this.searching = true;
      let res;
      try{
        res = await axios.post(backendurl + "/pagerank/getScore", dt);
      }catch(err) {
        this.result = [];
        this.searched = true;
        this.searching = false;
      }
      this.result = res.data;
      this.searching = false;
      this.searched = true;
    },
    getALink: function(arg) {
      return `<a href="${arg}" target="_blank"> ${arg} </a>`;      
    }    
  }
}
</script>
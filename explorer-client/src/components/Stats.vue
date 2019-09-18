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
      <b-col><p class="font-weight-bold my-4 text-left" style="font-size: 1.8rem;">Statistics</p></b-col>
    </b-row>  
    <b-row>
      <b-col md="6">
        <h3 class="text-left">{{datasetDsplayName}}</h3>
      </b-col>
      <b-col md="6">
        <h3 class="text-right">Epoch: {{epoch}}</h3>
      </b-col>
    </b-row>
    <h3 v-if="!statsGot" style="margin-top:2em">Stats not available.</h3>
    <b-card v-if="statsGot" title="Changes made by editors" >
    <b-row>      
      <b-col md="6">
        <GChart
          type="PieChart"
          :data="publishedData"
          :options="chartOptionsPublished"
        />
      </b-col>
      <b-col md="6">
        <GChart
          type="PieChart"
          :data="withheldData"
          :options="chartOptionsWithheld"
        />
      </b-col>
    </b-row>
    </b-card>
  </b-container>
</template>

<script>
/* eslint-disable no-console */
  import axios from 'axios';
  const backendurl = 'https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com';
  const titleSize = 20;
  
  export default {
    name: 'StatsGraph',
    props: ['dsname', 'epoch'],
    data() {
      return {
        allData: {},
        statsGot: false,
        leaderboardData: [],
        chartOptionsPublished: {
          title: 'Pubished entities',
          titleTextStyle: {
            fontSize: titleSize,
            bold: true
          },
          height: 400,
          legend: {
            position: 'bottom',
            alignment: 'start'
          },
          pieHole: 0.4,
        },
        chartOptionsWithheld: {
          title: 'Withheld entities',
          titleTextStyle: {
            fontSize: titleSize,
            bold: true
          },
          height: 400,
          legend: {
            position: 'bottom',
            alignment: 'start'
          },
          pieHole: 0.4,
        },
        chartOptionsLeaderboard: {
          showRowNumber: true, 
          width: '100%', 
          height: '100%'
        } 
      }
    },
    mounted: function() {
      this.initiateData();
    },
    computed: {
      datasetDsplayName: function() {
        switch(this.dsname) {
          case 'missingdateofdeath':
            return 'Missing Date of Death'
          case 'missingdateofbirth':
            return 'Missing Date of Birth'
          default:
            return 'No matching dataset'
        }       
      },
      publishedData: function() {
        let res = [];
        if (this.statsGot){
          res.push(['status', 'count']);
          res.push(['updated', this.allData['publishedUpdated']]);
          res.push(['not-updated', this.allData['publishedNotUpdated']]);
        }
        return res;
      },
      withheldData: function() {
        let res = [];
        if (this.statsGot){
          res.push(['status', 'count']);
          res.push(['updated', this.allData['withheldUpdated']]);
          res.push(['not-updated', this.allData['withheldNotUpdated']]);
        }
        return res;
      },      
    },
    methods: {
      initiateData: async function(){
        // axios call to backend to get data
        try{
        var res = await axios.get(backendurl + '/dsstats/' + this.dsname,{
                    params: {epoch: this.epoch}
                });
        }catch(error) {
          console.error('Failed to get stats data!')
          this.statsGot = false;
        }
        if (res) {
          this.allData = res.data[0];
          this.statsGot = true;
        }
      }
    }
  }
</script>
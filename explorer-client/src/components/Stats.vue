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
    <b-spinner label="Loading..." v-if="loading" variant="info" v-bind:style="{marginTop: '2em'}"></b-spinner>
    <div v-if="!loading">
    <h3 v-if="!dataReceived" style="margin-top:2em">Stats not available.</h3>
    <b-card v-if="decisionDistributionReceived" title="Decisions Made">
      <b-row align-v="center">
      <b-col md="6">
        <span>Edits Distribution</span>
        <doughnut-chart :chartdata="decisionDistribution" :options="defaultChartOptions"/>
      </b-col>
      <b-col md="6">
        <b-table bordered striped :items="decisionsDistributionInTable"></b-table>
      </b-col>
      </b-row>
    </b-card>    
    <b-card v-if="editsByDayReceived" title="Edits by Time">
      <line-chart v-if="editsByDayReceived" :chartdata="editsByDay" :options="defaultChartOptions"/>
    </b-card>
    <b-card v-if="editComparisonReceived" title="Edits comparison">
    <b-row>      
      <b-col md="6">
        <span>Published entities</span>
        <doughnut-chart v-if="editComparisonReceived" :chartdata="publishedData" :options="defaultChartOptions"/>
      </b-col>
      <b-col md="6">
        <span>Withheld entities</span>
        <doughnut-chart v-if="editComparisonReceived" :chartdata="withheldData" :options="defaultChartOptions"/>
      </b-col>
    </b-row>
    </b-card>   
    </div> 
  </b-container>
</template>

<script>
/* eslint-disable no-console */
  import axios from 'axios';
  import LineChart from './LineChart.vue';
  import DoughnutChart from './DoughnutChart.vue';
  import { getNameForDisplay } from "../utils/utils";
  const backendurl = 'https://explorer-backend-dot-dataz-wikiloop-dev.appspot.com';
  const titleSize = 20;
  const colors = ['#41B883', '#E46651', '#00D8FF', '#DD1B16'];
  
  export default {
    name: 'StatsGraph',
    props: ['dsname', 'epoch'],
    components: {"line-chart": LineChart, "doughnut-chart": DoughnutChart},  
    data() {
      return {
        loading: true,
        dataReceived: false,
        editComparisonReceived: false,
        editsByDayReceived: false,
        decisionDistributionReceived: false,
        logCalculated: false,
        leaderboardData: [],
        editComparisonData: {},
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
        },
        editsByDay: null,
        decisionDistribution: null,
        decisionsDistributionInTable: null,
        defaultChartOptions: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    },
    mounted: function() {
      this.initiateData();
    },
    computed: {
      datasetDsplayName: function() {
        return getNameForDisplay(this.dsname);     
      },
      publishedData: function() {
        if (this.editComparisonReceived){
          return {
            labels: ['updated', 'not-updated'],
            datasets: [{
              backgroundColor: colors.slice(0, 2),
              data: [this.editComparisonData.publishedUpdated, this.editComparisonData.publishedNotUpdated]
            }]
          };
        }
      },
      withheldData: function() {
        if (this.editComparisonReceived){
          return {
            labels: ['updated', 'not-updated'],
            datasets: [{
              backgroundColor: colors.slice(0, 2),
              data: [this.editComparisonData.withheldUpdated, this.editComparisonData.withheldNotUpdated]
            }]
          };      
        }  
      }
    },
    methods: {
      initiateData: async function(){
        // axios call to backend to get data
        try{
        let comparisonDataCall = axios.get(backendurl + '/gamelogs/editsComparison/' + this.dsname,{
                    params: {epoch: this.epoch}
                });
        let accumulateEditsCall = axios.get(backendurl + '/gamelogs/accumulateedits/' + this.dsname + '/' + this.epoch);
        let decisionsCall = axios.get(backendurl + '/gamelogs/decisions/' + this.dsname + '/' + this.epoch);
        var [comparisonData, accumulateEdits, decisions] = await Promise.all([comparisonDataCall, accumulateEditsCall, decisionsCall]);
        }catch(error) {
          console.error(error + '\nFailed to get stats data!')
          this.dataReceived = false;
          this.loading = false;
        }
        this.loading = false;
        if (comparisonData) {
          this.editComparisonData = comparisonData.data[0];
          if (this.editComparisonData) {
            this.editComparisonReceived = true;
          }
          this.dataReceived = true;
        }
        if (accumulateEdits) {
          this.editsByDay = {
            labels: accumulateEdits.data.map(r => {
              let d = new Date(r.date);
              return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            }),
            datasets: [
              {
                label: 'Edits by Day',
                data: accumulateEdits.data.map(r => {return r.accumulate_edits;}),
                backgroundColor: '#41B883'
              }
            ]
          };
          this.editsByDayReceived = true;
          this.dataReceived = true;
        }
        if (decisions) {
          this.decisionDistribution = {
            labels: decisions.data.map(r => {
              return r.decision;
            }),
            datasets: [
              {
                data: decisions.data.map(r => {return r.num;}),
                backgroundColor: colors.slice(0, decisions.data.length)
              }
            ]
          };
          console.log(decisions.data);
          this.decisionsDistributionInTable = [];
          decisions.data.forEach(r => {
            this.decisionsDistributionInTable.push({decision: r.decision.toUpperCase(), count: r.num});
          });
          let sum = decisions.data.reduce((acc, cur) => {return acc + cur.num}, 0);
          this.decisionsDistributionInTable.push({decision: 'TOTAL', count: sum})
          this.decisionDistributionReceived = true;
          this.dataReceived = true;
        }        
      }
    }
  }
</script>
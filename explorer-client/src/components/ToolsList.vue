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
<b-row class="mt-4">
  <b-col sm="6">
  <b-card
    no-body
    border-variant="primary"
    style="max-width: 20rem;" 
  >
    <b-card-body>
      <b-card-title>Wikiloop Game</b-card-title>
      <b-card-text>
        Wikiloop Game is build on <a href="https://tools.wmflabs.org/wikidata-game/distributed/" target='_blank'>Wikidata Distributed Game Platform</a>, which is built by Magnus Manske.<br>
        Click the links below to the games we've developed.
      </b-card-text>
    </b-card-body>
    <b-list-group flush>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=53" target='_blank'>Missing Date of Death</a></b-list-group-item>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=50" target='_blank'>Missing Date of Birth</a></b-list-group-item>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=54" target='_blank'>Missing Place of Birth</a></b-list-group-item>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=46" target='_blank'>Date of Birth Conflicts</a></b-list-group-item>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=56" target='_blank'>Category Facts</a></b-list-group-item>
    </b-list-group>
  </b-card>
  </b-col>
  <b-col sm="6">
  <b-card
    no-body
    border-variant="primary"
    style="max-width: 20rem;">
     <b-card-body>
      <b-card-title>Wikiloop Battlefield</b-card-title>
      <b-card-text>
        Wikiloop Battlefield is a tool gamifies wikipedia vandalism detection and correction.
      </b-card-text>
      <hr>
      <b-row>
        <b-col md="6">
        <b-button variant="outline-primary" :to="{name: 'BattlefieldDetail'}" class="margin-tb">More details</b-button>
        </b-col>
        <b-col md="6">
        <b-button variant="outline-primary" href="http://battlefield.wikiloop.org/" target='_blank' class="margin-tb">Play!</b-button>
        </b-col>
      </b-row>
    </b-card-body>   

  </b-card>
  </b-col>
</b-row>
</b-container>
</template>

<script>
export default {
  name: 'ToolsList',
  data() {
    return {
    }    
  }
}
</script>

<style scoped>
  .margin-tb{
    margin-bottom: 5px;
    margin-top: 5px;
  }
</style>
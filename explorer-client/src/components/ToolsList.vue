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
        <b-card-title>Wikidata Game</b-card-title>
      <b-card-text>
        WikiData Game is a platform built by volunteer developer Magnus Manske allowing other developers to create games for editors to gamify editing Wikidata.org.<br>
        Click the links below to the games we've developed.
      </b-card-text>
    </b-card-body>
    <b-list-group flush>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=53" target='_blank'>Missing Date of Death</a></b-list-group-item>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=50" target='_blank'>Missing Date of Birth</a></b-list-group-item>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=54" target='_blank'>Missing Place of Birth</a></b-list-group-item>
      <b-list-group-item><a href="https://tools.wmflabs.org/wikidata-game/distributed/#game=46" target='_blank'>Date of Birth Conflicts</a></b-list-group-item>
    </b-list-group>
  </b-card>
  </b-col>
  <b-col sm="6">
  <b-card
    no-body
    border-variant="primary"
    style="max-width: 20rem;">
     <b-card-body>
        <b-card-title>Battle Field</b-card-title>
      <b-card-text>
        Wikiloop Battle Field is a gamified tool to let users fight with suspicious wikipedia vandlisms. Data offered by Wiki ORES currently.
      </b-card-text>
      <hr>
      <b-button variant="outline-primary" href="http://battlefield.wikiloop.org/" target='_blank'>Play!</b-button>
    </b-card-body>   

  </b-card>
  </b-col>
</b-row>
</b-container>
</template>

<script>
export default {
  name: 'ToolsList'
}
</script>
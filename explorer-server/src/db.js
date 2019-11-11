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
 * @fileoverview Database utility.
 */

const Knex = require('knex');
const mongoose = require('mongoose');

function mysqlConnect() {
  const config = {
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD
  };
  if (process.env.INSTANCE_CONNECTION_NAME &&
      process.env.NODE_ENV === 'production'){
          config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
      }
  
  // Connect to the database
  const knex = Knex({
      client: 'mysql',
      connection: config,
  });
  
  return knex;   
}

function mongodbConnect() {
    let uri = process.env.MONGODB_CONNECTION_URI;
    let dbName = process.env.MONGODB_DBNAME;
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, dbName: dbName});
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    return db;
}

module.exports = {
    mysqlConnect,
    mongodbConnect
}
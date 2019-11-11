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

const express = require('express');
const cors = require('cors');
const apicache = require('apicache');
const db = require('./db');

const app = express();
const cache = apicache.middleware;
const metaDB = process.env.METADATABASE;
const knex = db.mysqlConnect();
const mongodb = db.mongodbConnect();
const dbEpochCache = {
    'missingdateofbirth': [],
    'missingdateofdeath': [],
    'missingplaceofbirth': [],
    'catfacts_missingproperty': []
}
const recordsLimit = 1000;
var battlefieldLastUpdated = 0;
var battlefieldStats = null;
var battlefieldLoading = false;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send({
        message: 'Will return you wikiloop datasets.'
    })
});

// Get dataset list
app.get('/dslist', cache('5 minutes'), async (req, res) => {
    try {
        var datasetlist = await knex.withSchema(metaDB).from('datasetname').select('name');
    } catch (error) {
        console.error(error)
        res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
    }
    datasetlist = datasetlist.map(v => v.name);
    res.send(datasetlist);
})

app.get('/ds/:dsname/:epoch?', cache('5 minutes'), async (req, res, next) => {
    // if epoch not provided
    if (!req.params.epoch) {
        let dsname = req.params.dsname;
        existingEpochs = await getDsEpoch(dsname);
        if (existingEpochs.length === 0) {
            res.status(404).send({ errMessage: 'No record for this dataset!' })
            return;
        }
        let epoch = existingEpochs[0];
        try {
            var data = await knex(dsname + '_' + epoch)
                .withSchema(dsname)
                .select('*')
                .limit(recordsLimit)
        } catch (error) {
            console.error(error + '\nDataset fetch failed!')
            res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
        }
        res.send(data);
    }
    // otherwise pass the control to the next middleware function in this stack
    else next()
}, async (req, res, next) => {
    let dsname = req.params.dsname;
    let epoch = req.params.epoch;
    existingEpochs = await getDsEpoch(dsname);
    if (existingEpochs.length === 0 || !existingEpochs.includes(epoch)) {
        res.status(404).send({ errMessage: 'No record for this dataset!' })
        return;
    }
    try {
        var data = await knex(dsname + '_' + epoch)
        .withSchema(dsname)
        .select('*')
        .limit(recordsLimit)
    } catch (error) {
        console.error('Dataset fetch failed!')
        res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
    }
    res.send(data);
})

// Get dataset epoch list
app.get('/dsepoch/:dsname', cache('5 minutes'), async (req, res) => {
    let dsname = req.params.dsname;
    let epochs = await getDsEpoch(dsname);
    if (epochs.length === 0) {
        res.status(404).send({ errMessage: 'No record for this dataset!' });
        return;
    }
    res.send(epochs);
});

// Get request for dataset stats
app.get('/gamelogs/editsComparison/:dsname', cache('5 minutes'), async (req, res) => {
    let dsname = req.params.dsname;
    existingEpochs = await getDsEpoch(dsname);
    if (existingEpochs.length === 0) {
        res.status(404).send({ errMessage: 'No record for this dataset!' })
        return;
    }
    if (req.query.epoch) {
        var epoch = req.query.epoch
        if (!existingEpochs.includes(epoch)) {
            res.status(404).send({ errMessage: 'Invalid epoch!' })
            return;
        }
    } else {
        // If no epoch provided, return the newest one.        
        epoch = existingEpochs[0];
    }
    try {
        var data = await knex('updatecount_stats')
            .withSchema(dsname)
            .where('epoch', epoch)
            .select('*')
            .orderBy('addedtime', 'desc')
            .limit(1);
    } catch (error) {
        console.error('Dataset fetch failed!')
        res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
    }
    res.send(data);
})

// Get accumulate edits by day
app.get('/gamelogs/accumulateedits/:dsname/:epoch', cache('5 minutes'), async (req, res) => {
    let dsname = req.params.dsname;
    let epoch = req.params.epoch;
    try {
        let editsByDay = knex(dsname + '_' + epoch + '_logging')
            .withSchema(dsname)
            .select(knex.raw('date(changetime) as date, count(*) as num'))
            .groupBy('date')
        var data = await knex.select(knex.raw('T3.date, sum(T3.num) as accumulate_edits'))
            .from(knex.raw('(select T1.date as date, T2.num as num from (' + editsByDay.toString() + ') as T1 cross join (' +
                editsByDay.toString() + ') as T2 where T1.date >= T2.date order by T1.date) as T3'))
            .groupByRaw('T3.date')
    } catch (error) {
        console.error(error + '\nDataset fetch failed!')
        res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
    }
    res.send(data);
})   

// Get editor decision distribution
app.get('/gamelogs/decisions/:dsname/:epoch', cache('5 minutes'), async (req, res) => {
    let dsname = req.params.dsname;
    let epoch = req.params.epoch;
    try {
        var data = await knex(dsname + '_' + epoch + '_logging')
            .withSchema(dsname)
            .select('decision', knex.raw('count(*) as num'))
            .groupBy('decision')
    } catch (error) {
        console.error(error + '\nDataset fetch failed!')
        res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
    }
    res.send(data);
}) 

//Get request for dataset leaderboard
app.get('/dsleaderboard/:dsname', cache('5 minutes'), async (req, res) => {
    let dsname = req.params.dsname;
    existingEpochs = await getDsEpoch(dsname);
    if (existingEpochs.length === 0) {
        res.status(404).send({ errMessage: 'No record for this dataset!' })
        return;
    }
    if (req.query.epoch) {
        var epoch = req.query.epoch
        if (!existingEpochs.includes(epoch)) {
            res.status(404).send({ errMessage: 'Invalid epoch!' })
            return;
        }
    } else {
        epoch = existingEpochs[0];
    }
    try {
        let tbname = dsname + '_' + epoch + '_logging';
        var users = await knex(tbname)
            .withSchema(dsname)
            .select('user', knex.raw('count(*) as num'))
            .groupBy('user')
            .orderBy('num', 'desc')
    } catch (err) {
        console.error(err);
        res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
        return;
    }
    res.send(users);
});

// Advanced search
app.post('/advancedsearch', async (req, res) => {
    let reqbody = req.body;
    let reg = RegExp('^missing.+');
    if (reg.test(reqbody.dsname)) {
        let result;
        try {
            result = await queryMissingValueDataset(reqbody);
        } catch(err) {
            console.error(err);
            res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
        }
        res.send(result);
    } else if (reqbody.dsname.includes('catfacts')) {
        let result;
        try {
            result = await queryCatfactsMissingProperty(reqbody);
        } catch(err) {
            console.error(err);
            res.status(404).send({ errMessage: 'Database unreachable. Please try again later.' });
        }
        res.send(result);
    } else {
        res.send([]);
    }
});

async function queryMissingValueDataset(reqbody) {
    let epoch = reqbody.epoch;
    let dsname = reqbody.dsname;
    let dstable = dsname + '_' + epoch;
    let query = knex.withSchema(dsname);
    let entities = reqbody.entities;
    let languagesAnd = reqbody.languagesAnd;
    let languagesOr = reqbody.languagesOr;
    let reviewed = reqbody.reviewed;
    // Get all entity number (eg. 'Q123') from entity list.
    if (entities) {
        let andList = entities.split(',');
        query.where((builder) => {
            andList.forEach(i => {
                i = i.trim();
                builder.orWhere('qNumber', i);
            })
        })  
    }
    // Language match
    if (languagesAnd && languagesAnd.length > 0 && !languagesAnd.includes('none')){
        query.andWhere((builder) => {
            for (let l of languagesAnd) {
                builder.andWhere('languages', 'like', '%' + l + '%');
            }
        })
    }
    if (languagesOr && languagesOr.length > 0 && !languagesOr.includes('none')) {
        query.andWhere((builder) => {
            for (let l of languagesOr) {
                builder.orWhere('languages', 'like', '%' + l + '%');
            }
        })
    }      
    // reviewd or not
    if (!reviewed || reviewed === 'all') {
        if (reqbody.type === "display") {
            query.limit(recordsLimit);
        }
        query.from(dstable).select('qNumber', 'missingValue', 'refs');
        return query;
    }else {
        if (reviewed === 'no') {
            // special treatment for no cases cause its super slow
            // Move the "join" logic from mysql to here
            let reviewedEntities;
            try{
                reviewedEntities = await knex.withSchema(dsname).from(dstable + '_logging').select('qNumber');
            } catch(e) {
                console.err(e);
            }
            let reviewedIds = [];
            reviewedEntities.map(r => {
                reviewedIds.push(r.id);
            })
            if (reqbody.type === "display") {
                query.limit(recordsLimit + reviewedIds.length);
            }
            let tempRecords;
            try {
                tempRecords = await query.from(dstable).select('qNumber', 'missingValue', 'refs');
            } catch(err) {
                console.error(err);
            }
            let result = [];
            tempRecords.map(r => {
                if (!reviewedIds.includes(r.qNumber)) {
                    result.push({
                        qNumber: r.qNumber,
                        missingValue: r.missingValue,
                        refs: r.refs
                    });
                }
            })
            if (reqbody.type === "display") {
                return result.slice(0, recordsLimit);
            }else {
                return result;
            }
        }else {
            if (reqbody.type === "display") {
                query.limit(recordsLimit);
            }
            let userInclude = reqbody.userInclude;
            let userDecision = reqbody.userDecision;
            if (userInclude) {
                let userList = userInclude.split(',');
                query.andWhere((builder) => {
                    userList.forEach(i => {
                        i = i.trim();
                        builder.orWhere('user', i);
                    })
                })     
            }
            if (userDecision && userDecision !== 'all') {
                query.andWhere('decision', userDecision);              
            }
            query.from(knex.raw(dstable))
            .joinRaw('inner join ' + dsname + '.' + dstable + '_logging using (qNumber)')
            .select('qNumber', 'missingValue', 'refs', 'user', 'decision')
            return query;
        }
    }
}

async function queryCatfactsMissingProperty(reqbody) {
    let epoch = reqbody.epoch;
    let dsname = reqbody.dsname;
    let dstable = dsname + '_' + epoch;
    let query = knex.withSchema(dsname);
    let entitiesAnd = reqbody.entitiesAnd;
    let entitiesOr = reqbody.entitiesOr;
    let languagesAnd = reqbody.languagesAnd;
    let languagesOr = reqbody.languagesOr;
    let reviewed = reqbody.reviewed;
    // Entity match
    if (entitiesAnd) {
        let andList = entitiesAnd.split(',');
        query.where((builder) => {
            andList.forEach(i => {
                i = i.trim();
                builder.andWhere('id', 'like', '%' + i + '%')
            })
        })  
    }
    if (entitiesOr) {
        let orList = entitiesOr.split(',');
        query.andwhere((builder) => {
            orList.forEach(i => {
                i = i.trim();
                builder.orWhere('id', 'like', '%' + i + '%')
            })
        })            
    }
    // Language match
    if (languagesAnd && languagesAnd.length > 0){
        query.andWhere((builder) => {
            for (let l of languagesAnd) {
                if (l !== 'none') {
                    builder.andWhere('refLanguages', 'like', '%' + l + '%');
                }
            }
        })
    }
    if (languagesOr && languagesOr.length > 0 && !languagesOr.includes('none')) {
        query.andWhere((builder) => {
            for (let l of languagesOr) {
                builder.orWhere('refLanguages', 'like', '%' + l + '%');
            }
        })
    }
    // reviewd or not
    if (!reviewed || reviewed === 'all') {
        if (reqbody.type === "display") {
            query.limit(recordsLimit);
        }
        query.from(dstable).select('entity', 'category', 'property', 'missingValue', 'refs');
        return query;
    }else {
        if (reviewed === 'no') {
            // special treatment for no cases cause its super slow
            // Move the "join" logic from mysql to here
            let reviewedEntities = await knex.withSchema(dsname).from(dstable + '_logging').select('id');
            let reviewedIds = [];
            reviewedEntities.map(r => {
                reviewedIds.push(r.id);
            })
            if (reqbody.type === "display") {
                query.limit(recordsLimit + reviewedIds.length);
            }
            query.from(dstable);
            let tempRecords = await query.from(dstable)
            .select('id', 'entity', 'category', 'property', 'missingValue', 'refs')
            let result = [];
            tempRecords.map(r => {
                if (!reviewedIds.includes(r.id)) {
                    result.push({
                        entity: r.entity,
                        category: r.category,
                        property: r.property,
                        missingValue: r.missingValue,
                        refs: r.refs
                    });
                }
            })
            if (reqbody.type === "display") {
                return result.slice(0, recordsLimit);
            }else {
                return result;
            }
        }else {
            if (reqbody.type === "display") {
                query.limit(recordsLimit);
            }
            let userInclude = reqbody.userInclude;
            let userDecision = reqbody.userDecision;
            if (userInclude) {
                let userList = userInclude.split(',');
                query.andWhere((builder) => {
                    userList.forEach(i => {
                        i = i.trim();
                        builder.orWhere('user', i);
                    })
                })     
            }
            if (userDecision && userDecision.length > 0 && !userDecision.includes('all')) {
                query.andWhere((builder) => {
                    userDecision.forEach(i => {
                        builder.orWhere('decision', i);
                    })
                })               
            }
            query.from(knex.raw(dstable))
            .joinRaw('inner join ' + dsname + '.' + dstable + '_logging using (id, entity, category, property)')
            .select('entity', 'category', 'property', 'missingValue', 'refs', 'user', 'decision')
            return query;
        }
    }
}

// Get dataset epoch
async function getDsEpoch(dataset) {
    if (!dbEpochCache[dataset]) {
        return [];
    }
    if (dbEpochCache[dataset].length !== 0) {
        return dbEpochCache[dataset];
    }
    try {
        var epochs = await knex.withSchema(metaDB).from(dataset + 'epoch').select('epoch').orderBy('epoch', 'desc');
    } catch (error) {
        console.error(error)
        return [];
    }
    epochs = epochs.map(r => r.epoch);
    dbEpochCache[dataset] = epochs;
    return epochs;
}

app.get('/battlefield/getInteractionCounts', cache('5 minutes'), async (req, res) => {
    // console.log(mongodb);
    let starttime = Date.now();
    console.log('start time is:' + starttime);
    console.log('last update time is:' + battlefieldLastUpdated);
    if(!battlefieldStats) {
        await getBattlefieldData();
    }
    console.log('stats ready took: ' + (Date.now() - starttime));
    let totalCount = 0;
    let shouldRevertCount = 0;
    let notSureCount = 0;
    let looksGoodCount = 0;
    let revisionCount = 0;
    let allRevisions = [];
    battlefieldStats.forEach(s => {
        let revision = {};
        revision.judgementsCount = s.counts;
        revision.title = s.recentChange.title;
        revision.wikiSite = s.recentChange.wiki;
        revision.currentRev = s.recentChange.revision.new;
        revision.oldRev = s.recentChange.revision.old;
        allRevisions.push(revision);
        revisionCount += 1;
        let counts = s.counts;
        totalCount += counts.Total;
        shouldRevertCount += counts.ShouldRevert;
        notSureCount += counts.NotSure;
        looksGoodCount += counts.LooksGood;
    })
    let result = {
        Total: totalCount,
        ShouldRevert: shouldRevertCount,
        NotSure: notSureCount,
        LooksGood: looksGoodCount,
        revisionCount: revisionCount,
        allRevisions: allRevisions
    }
    // update in memory storage per 1 hour
    if ((Date.now() - battlefieldLastUpdated) > 3600000 && !battlefieldLoading) {
        console.log('new stats retrieving...');
        battlefieldLoading = true;
        getBattlefieldData();
    }
    console.log('Until return time took: ' + (Date.now() - starttime));
    res.send(result);
})

async function getBattlefieldData() {
    let records = await mongodb.collection(`Interaction`).aggregate([
        {
            $match: {}
        },
        {
            "$group": {
                "_id": {
                    "wikiRevId": "$wikiRevId"
                },
                "wikiRevId": {
                    "$first": "$wikiRevId"
                },
                "judgements": {
                    "$push": {
                        "judgement": "$judgement",
                        "userGaId": "$userGaId",
                        "timestamp": "$timestamp"
                    }
                },
                "totalCounts": {
                    "$sum": 1
                },
                "shouldRevertCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "ShouldRevert"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "notSureCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "NotSure"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "looksGoodCounts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$judgement",
                                    "LooksGood"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                "lastTimestamp": {
                    "$max": "$timestamp"
                },
                "recentChange": {
                    "$first": "$recentChange"
                }
            }
        },
        {
            "$project": {
                "wikiRevId": "$_id.wikiRevId",
                "judgements": "$judgements",
                "recentChange": 1,
                "lastTimestamp": 1,
                "counts.Total": "$totalCounts",
                "counts.ShouldRevert": "$shouldRevertCounts",
                "counts.NotSure": "$notSureCounts",
                "counts.LooksGood": "$looksGoodCounts"
            }
        },
        {
            "$match": {
                "recentChange.ores": {
                    "$exists": true,
                    "$ne": null
                },
                "recentChange.wiki": {
                    "$exists": true,
                    "$ne": null
                },
                "lastTimestamp": {
                    "$exists": true,
                    "$ne": null
                }
            }
        },
        {
            "$sort": {
                "lastTimestamp": -1
            }
        },
    ],
        {
            "allowDiskUse": true
        })
        .toArray();
    battlefieldStats = records;
    battlefieldLastUpdated = Date.now();
    battlefieldLoading = false;
}

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
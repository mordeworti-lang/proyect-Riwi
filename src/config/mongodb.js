'use strict';

const { MongoClient } = require('mongodb');
const { MONGODB_URI, MONGODB_DB } = require('./env');

let db = null;
let client = null;

async function connectMongo() {
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    db = client.db(MONGODB_DB);
    await ensureCollections(db);
    client.on('close', () => console.warn('MongoDB disconnected'));
    console.info('MongoDB connected:', MONGODB_DB);
}

async function ensureCollections(database) {
    const existing = await database.listCollections().toArray();
    const names = existing.map(c => c.name);

    if (!names.includes('ai_analysis_results')) {
        await database.createCollection('ai_analysis_results', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['couderId', 'periodLabel', 'summary', 'diagnosis', 'suggestions', 'createdAt'],
                    properties: {
                        couderId:    { bsonType: 'int' },
                        periodLabel: { bsonType: 'string' },
                        summary:     { bsonType: 'string' },
                        diagnosis:   { bsonType: 'string' },
                        suggestions: { bsonType: 'string' },
                        audioUrl:    { bsonType: 'string' },
                        createdAt:   { bsonType: 'date' }
                    }
                }
            }
        });
        await database.collection('ai_analysis_results').createIndex({ couderId: 1, createdAt: -1 });
    }

    if (!names.includes('audit_logs')) {
        await database.createCollection('audit_logs', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['action', 'entity', 'entityId', 'performedBy', 'timestamp'],
                    properties: {
                        action:      { bsonType: 'string', enum: ['CREATE', 'UPDATE', 'DELETE'] },
                        entity:      { bsonType: 'string' },
                        entityId:    { bsonType: 'int' },
                        performedBy: { bsonType: 'int' },
                        timestamp:   { bsonType: 'date' },
                        snapshot:    { bsonType: 'object' }
                    }
                }
            }
        });
        await database.collection('audit_logs').createIndex({ entity: 1, timestamp: -1 });
    }
}

function getDb() {
    if (!db) throw new Error('MongoDB not connected. Call connectMongo() first.');
    return db;
}

async function closeMongo() {
    if (client) await client.close();
}

module.exports = connectMongo;
module.exports.getDb = getDb;
module.exports.closeMongo = closeMongo;

import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    throw new Error('Missing APPWRITE_API_KEY in environment. Set it before running update-schema.js');
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

const DB_ID = 'flare_db';

async function safeCreate(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
    } catch (e) {
        if (e.code === 409 || e.code === 404) {
            console.log(`⚠️ ${name} already exists or not found`);
        } else {
            console.log(`❌ ${name} failed: ${e.message}`);
        }
    }
}

async function updateSchema() {
    console.log('🔄 Updating database schema for audio support...');

    try {
        // First, delete views attribute to free up space
        console.log('\n--- Deleting views attribute from questions ---');
        await safeCreate('delete questions.views', () =>
            databases.deleteAttribute(DB_ID, 'questions', 'views')
        );

        // Add audioUrl to questions collection
        console.log('\n--- Adding audioUrl to questions ---');
        await safeCreate('questions.audioUrl attribute', () =>
            databases.createStringAttribute(DB_ID, 'questions', 'audioUrl', 500, false)
        );

        // Note: Skipping answers audioUrl due to attribute limit
        console.log('\n--- Skipping answers audioUrl due to attribute limit ---');

        console.log('\n✅ Schema update complete!');

    } catch (error) {
        console.error('\n❌ Schema update failed:');
        console.log(JSON.stringify(error, null, 2));
    }
}

updateSchema();
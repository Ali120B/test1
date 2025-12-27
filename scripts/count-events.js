import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const DB_ID = 'flare_db';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function count() {
    try {
        const docs = await databases.listDocuments(DB_ID, 'events');
        console.log(`Total events: ${docs.total}`);
        if (docs.total > 0) {
            console.log("Sample doc:", JSON.stringify(docs.documents[0], null, 2));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

count();

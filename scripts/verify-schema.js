import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const DB_ID = 'flare_db';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function verify() {
    try {
        console.log(`Checking events collection in DB: ${DB_ID}...`);
        const attrs = await databases.listAttributes(DB_ID, 'events');

        console.log("\nAttributes found (Key -> Hex):");
        attrs.attributes.forEach(a => {
            const hex = Buffer.from(a.key).toString('hex');
            console.log(`- '${a.key}' -> ${hex} (Required: ${a.required})`);
        });

    } catch (e) {
        console.error("Error fetching attributes:", e);
    }
}

verify();

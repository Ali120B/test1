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

// Utils
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fix() {
    try {
        console.log("🛠️  Starting Schema Repair...");

        // 1. Delete
        console.log("Deleting 'description' attribute...");
        try {
            await databases.deleteAttribute(DB_ID, 'events', 'description');
            console.log("✅ Attribute deleted.");
        } catch (e) {
            console.log("⚠️  Could not delete (maybe already gone):", e.message);
        }

        // 2. Wait
        console.log("Waiting 5 seconds for propagation...");
        await sleep(5000);

        // 3. Create
        console.log("Creating 'description' attribute...");
        await databases.createStringAttribute(DB_ID, 'events', 'description', 2000, true);
        console.log("✅ Attribute created.");

        // 4. Wait
        console.log("Waiting 5 seconds for availability...");
        await sleep(5000);

        console.log("🎉 Schema repair complete.");

    } catch (e) {
        console.error("❌ Error during repair:", e);
    }
}

fix();

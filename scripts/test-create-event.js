import 'dotenv/config';
import { Client, Databases, ID } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const DB_ID = 'flare_db';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error("No API Key found");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function testCreate() {
    try {
        console.log("Attempting to create a test event WITH 'description'...");
        const response = await databases.createDocument(
            DB_ID,
            'events',
            ID.unique(),
            {
                title: "Test Event Fixed",
                description: "This is a test description", // Restored!
                eventDate: new Date().toISOString(),
                category: "Islamic Event"
            }
        );
        console.log("✅ Custom test event created successfully!");
        console.log("ID:", response.$id);

        // Clean up
        await databases.deleteDocument(DB_ID, 'events', response.$id);
        console.log("Cleaned up test event.");

    } catch (e) {
        console.error("❌ Error creating event:", e);
        if (e.response) console.error("Details:", JSON.stringify(e.response, null, 2));
    }
}

testCreate();

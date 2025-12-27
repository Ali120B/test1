import { Client, Databases } from 'node-appwrite';
import fs from 'fs';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const API_KEY = 'standard_204c9948bca4c96b17c3a0006de670ed006580e5ceb9b6e20b80c76d706bf384db7da398df4aa6194ffb9e033e34e7b9cfe07defd225bae486c5b8965a6b2c06cd9021654406ca6978b9fd5407a6341001fbb30d483a875eecc46c94c28c8bba48b2f6083e1b23db2bf14d44f6f4fc905716e5cb4e51fd48f3c1f3dcd208da95';
const DB_ID = 'flare_db';

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

async function listAll() {
    let output = '';
    const collections = ['dars', 'questions', 'categories', 'saved_items'];
    for (const col of collections) {
        output += `\n📦 COLLECTION: ${col}\n`;
        try {
            const list = await databases.listAttributes(DB_ID, col);
            for (const a of list.attributes) {
                output += `   - ${a.key} (${a.type}) [${a.status}] ${a.required ? 'REQUIRED' : ''}\n`;
            }
        } catch (e) {
            output += `   ❌ Error: ${e.message}\n`;
        }
    }
    fs.writeFileSync('final-schema.log', output);
    console.log('Schema written to final-schema.log');
}

listAll();

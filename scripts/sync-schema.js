import { Client, Databases } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const API_KEY = 'standard_204c9948bca4c96b17c3a0006de670ed006580e5ceb9b6e20b80c76d706bf384db7da398df4aa6194ffb9e033e34e7b9cfe07defd225bae486c5b8965a6b2c06cd9021654406ca6978b9fd5407a6341001fbb30d483a875eecc46c94c28c8bba48b2f6083e1b23db2bf14d44f6f4fc905716e5cb4e51fd48f3c1f3dcd208da95';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const DB_ID = 'flare_db';

async function syncSchema() {
    console.log('🔄 Syncing Appwrite Schema...');

    try {
        const colId = 'questions';
        console.log(`\n📦 Managing attributes for collection: ${colId}`);

        const col = await databases.getCollection(DB_ID, colId);
        const attributeKeys = col.attributes.map(attr => attr.key);
        const attachmentsAttr = col.attributes.find(a => a.key === 'attachments');

        // If it exists but is small (e.g., 255), delete it
        if (attachmentsAttr && attachmentsAttr.size < 1024) {
            console.log(`   🗑️ Deleting small "attachments" attribute (size: ${attachmentsAttr.size})...`);
            await databases.deleteAttribute(DB_ID, colId, 'attachments');

            // Wait a bit for Appwrite to process the deletion
            console.log('   ⏳ Waiting for deletion to process...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Add with functional size
        console.log('   ✨ Creating "attachments" attribute with size 1024...');
        await databases.createStringAttribute(
            DB_ID,
            colId,
            'attachments',
            1024,
            false,
            '[]'
        );
        console.log('   ✅ "attachments" successfully created with size 1024.');

        console.log('\n🏆 SCHEMA SYNC COMPLETE.');
    } catch (error) {
        console.error('\n❌ SCHEMA SYNC FAILED:');
        console.error(error.message);
        if (error.response) {
            console.error('Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

syncSchema();

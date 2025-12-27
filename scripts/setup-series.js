import { Client, Databases, Permission, Role } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const API_KEY = 'standard_204c9948bca4c96b17c3a0006de670ed006580e5ceb9b6e20b80c76d706bf384db7da398df4aa6194ffb9e033e34e7b9cfe07defd225bae486c5b8965a6b2c06cd9021654406ca6978b9fd5407a6341001fbb30d483a875eecc46c94c28c8bba48b2f6083e1b23db2bf14d44f6f4fc905716e5cb4e51fd48f3c1f3dcd208da95';
const DB_ID = 'flare_db';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function setupSeries() {
    console.log('🚀 Setting up Series Schema...');

    // 1. Create 'series' collection
    try {
        try {
            await databases.getCollection(DB_ID, 'series');
            console.log('✅ Collection "series" already exists.');
        } catch (e) {
            console.log('✨ Creating Collection: series');
            await databases.createCollection(
                DB_ID,
                'series',
                'Series',
                [
                    Permission.read(Role.any()),
                    Permission.read(Role.users()),
                    Permission.create(Role.team('admins')),
                    Permission.update(Role.team('admins')),
                    Permission.delete(Role.team('admins')),
                ]
            );
            console.log('✅ Created.');
            
            // Wait for creation
            await new Promise(r => setTimeout(r, 2000));

            // Add Attributes
            console.log('✨ Adding attributes to series...');
            await databases.createStringAttribute(DB_ID, 'series', 'name', 128, true);
            await databases.createStringAttribute(DB_ID, 'series', 'description', 1000, false);
            await databases.createStringAttribute(DB_ID, 'series', 'image', 2048, false); // URL
            console.log('✅ Attributes added.');
        }

        // 2. Add 'seriesId' and 'seriesOrder' to 'dars'
        console.log('Checking dars attributes...');
        const darsAttrs = await databases.listAttributes(DB_ID, 'dars');
        const hasSeriesId = darsAttrs.attributes.some(a => a.key === 'seriesId');
        
        if (!hasSeriesId) {
             console.log('✨ Adding seriesId to dars...');
             await databases.createStringAttribute(DB_ID, 'dars', 'seriesId', 36, false);
             await databases.createIntegerAttribute(DB_ID, 'dars', 'seriesOrder', false);
             console.log('✅ Attributes added to dars.');
        } else {
             console.log('✅ Dars already has series attributes.');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

setupSeries();

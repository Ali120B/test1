import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const API_KEY = 'standard_204c9948bca4c96b17c3a0006de670ed006580e5ceb9b6e20b80c76d706bf384db7da398df4aa6194ffb9e033e34e7b9cfe07defd225bae486c5b8965a6b2c06cd9021654406ca6978b9fd5407a6341001fbb30d483a875eecc46c94c28c8bba48b2f6083e1b23db2bf14d44f6f4fc905716e5cb4e51fd48f3c1f3dcd208da95';
const ADMIN_TEAM_ID = '6943b1d8003077f58ddb';
const DB_ID = 'flare_db';

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

async function test() {
    try {
        await databases.createDocument(DB_ID, 'dars', ID.unique(), {
            title: 'Test',
            description: 'Test',
            teacher: 'Test',
            category: 'General',
            type: 'article',
            duration: '5 min',
            attachments: '[]',
            views: 0
        }, [
            Permission.read(Role.any()),
            Permission.update(Role.team(ADMIN_TEAM_ID)),
            Permission.delete(Role.team(ADMIN_TEAM_ID))
        ]);
        console.log('SUCCESS');
    } catch (e) {
        if (e.response) {
            const resp = typeof e.response === 'string' ? JSON.parse(e.response) : e.response;
            console.log('DETAILED_ERROR:', resp.message);
        } else {
            console.log('ERROR:', e.message);
        }
    }
}

test();

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const API_KEY = 'standard_204c9948bca4c96b17c3a0006de670ed006580e5ceb9b6e20b80c76d706bf384db7da398df4aa6194ffb9e033e34e7b9cfe07defd225bae486c5b8965a6b2c06cd9021654406ca6978b9fd5407a6341001fbb30d483a875eecc46c94c28c8bba48b2f6083e1b23db2bf14d44f6f4fc905716e5cb4e51fd48f3c1f3dcd208da95';
const ADMIN_TEAM_ID = '6943b1d8003077f58ddb';
const DB_ID = 'flare_db';

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

async function verify() {
    console.log('--- FINAL VERIFICATION START ---');

    // 1. DARS
    console.log('\nTesting Dars...');
    try {
        const response = await databases.createDocument(DB_ID, 'dars', ID.unique(), {
            title: 'Verify',
            description: 'Desc',
            teacher: 'Antigravity',
            category: 'General',
            type: 'article',
            duration: '1m',
            attachments: '[]',
            views: 0,
            videoUrl: '',
            image: '',
            content: ''
        }, [
            Permission.read(Role.any()),
            Permission.update(Role.team(ADMIN_TEAM_ID)),
            Permission.delete(Role.team(ADMIN_TEAM_ID))
        ]);
        console.log('✅ DARS: SUCCESS (ID: ' + response.$id + ')');
    } catch (e) {
        console.error('❌ DARS: FAILED');
        console.log('   Message:', e.message);
        if (e.response) console.log('   Response:', JSON.stringify(e.response));
    }

    // 2. QUESTIONS
    console.log('\nTesting Questions...');
    try {
        const response = await databases.createDocument(DB_ID, 'questions', ID.unique(), {
            title: 'Verify',
            content: 'Content',
            askedBy: 'Tester',
            category: 'General',
            date: new Date().toISOString(),
            answers: '[]',
            views: 0
        }, [
            Permission.read(Role.any()),
            Permission.delete(Role.team(ADMIN_TEAM_ID))
        ]);
        console.log('✅ QUESTIONS: SUCCESS (ID: ' + response.$id + ')');
    } catch (e) {
        console.error('❌ QUESTIONS: FAILED');
        console.log('   Message:', e.message);
        if (e.response) console.log('   Response:', JSON.stringify(e.response));
    }

    console.log('\n--- VERIFICATION END ---');
}

verify();

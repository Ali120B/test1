import 'dotenv/config';
import { Client, Databases, Storage, ID, Permission, Role, Query } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    throw new Error('Missing APPWRITE_API_KEY in environment. Set it before running setup-appwrite.js');
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = 'flare_db';
const BUCKET_ID = 'media';

async function setup() {
    console.log('🚀 Appwrite Permissions Setup...');

    try {
        // 1. Database
        console.log('--- Database Check ---');
        try {
            await databases.get(DB_ID);
            console.log(`✅ Database '${DB_ID}' exists.`);
        } catch (e) {
            console.log(`✨ Creating Database: ${DB_ID}`);
            await databases.create(DB_ID, 'Flare Hub DB');
            console.log('✅ Created.');
        }

        // 2b. Ensure dars_progress exists with required attributes and indexes
        console.log(`\n--- dars_progress schema ---`);
        try {
            await databases.getCollection(DB_ID, 'dars_progress');
            console.log('✅ Collection dars_progress exists.');
        } catch (e) {
            console.log('✨ Creating Collection: dars_progress');
            await databases.createCollection(
                DB_ID,
                'dars_progress',
                'Dars Progress',
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ],
                true
            );
            console.log('✅ Created.');
        }

        const safeCreate = async (label, fn) => {
            try {
                await fn();
                console.log(`   ✅ ${label}`);
            } catch (err) {
                const msg = err?.message || String(err);
                console.log(`   ⚠️ ${label} (skipped): ${msg}`);
            }
        };

        await safeCreate('userId attribute', () =>
            databases.createStringAttribute(DB_ID, 'dars_progress', 'userId', 64, true)
        );
        await safeCreate('darsId attribute', () =>
            databases.createStringAttribute(DB_ID, 'dars_progress', 'darsId', 64, true)
        );
        await safeCreate('lastVisitedAt attribute', () =>
            databases.createDatetimeAttribute(DB_ID, 'dars_progress', 'lastVisitedAt', true)
        );
        await safeCreate('completed attribute', () =>
            databases.createBooleanAttribute(DB_ID, 'dars_progress', 'completed', false, false)
        );

        await safeCreate('index: userId', () =>
            databases.createIndex(DB_ID, 'dars_progress', 'idx_userId', 'key', ['userId'])
        );
        await safeCreate('index: userId_darsId', () =>
            databases.createIndex(DB_ID, 'dars_progress', 'idx_userId_darsId', 'unique', ['userId', 'darsId'])
        );
        await safeCreate('index: lastVisitedAt', () =>
            databases.createIndex(DB_ID, 'dars_progress', 'idx_lastVisitedAt', 'key', ['lastVisitedAt'])
        );

        // 2c. Ensure saved_items exists with required attributes and indexes
        console.log(`\n--- saved_items schema ---`);
        try {
            await databases.getCollection(DB_ID, 'saved_items');
            console.log('✅ Collection saved_items exists.');
        } catch (e) {
            console.log('✨ Creating Collection: saved_items');
            await databases.createCollection(
                DB_ID,
                'saved_items',
                'Saved Items',
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ],
                true
            );
            console.log('✅ Created.');
        }

        await safeCreate('saved_items.userId attribute', () =>
            databases.createStringAttribute(DB_ID, 'saved_items', 'userId', 64, true)
        );
        await safeCreate('saved_items.itemId attribute', () =>
            databases.createStringAttribute(DB_ID, 'saved_items', 'itemId', 64, true)
        );
        await safeCreate('saved_items.itemType attribute', () =>
            databases.createStringAttribute(DB_ID, 'saved_items', 'itemType', 32, true)
        );
        await safeCreate('saved_items.listType attribute', () =>
            databases.createStringAttribute(DB_ID, 'saved_items', 'listType', 32, true)
        );

        await safeCreate('saved_items index: userId_listType', () =>
            databases.createIndex(DB_ID, 'saved_items', 'idx_userId_listType', 'key', ['userId', 'listType'])
        );
        await safeCreate('saved_items index: unique userId_itemId_listType', () =>
            databases.createIndex(DB_ID, 'saved_items', 'idx_unique_user_item_list', 'unique', ['userId', 'itemId', 'listType'])
        );

        const repairSavedItemsPermissions = async () => {
            console.log(`\n--- Repairing saved_items document permissions ---`);
            const limit = 100;
            let offset = 0;
            while (true) {
                const res = await databases.listDocuments(DB_ID, 'saved_items', [
                    Query.limit(limit),
                    Query.offset(offset),
                ]);
                if (!res.documents.length) break;

                for (const doc of res.documents) {
                    const userId = doc.userId;
                    if (!userId) continue;
                    await safeCreate(`saved_items perms: ${doc.$id}`, () =>
                        databases.updateDocument(
                            DB_ID,
                            'saved_items',
                            doc.$id,
                            {
                                userId: doc.userId,
                                itemId: doc.itemId,
                                itemType: doc.itemType,
                                listType: doc.listType,
                            },
                            [
                                Permission.read(Role.user(userId)),
                                Permission.update(Role.user(userId)),
                                Permission.delete(Role.user(userId)),
                            ]
                        )
                    );
                }

                offset += res.documents.length;
                if (res.documents.length < limit) break;
            }
        };

        const repairDarsProgressPermissions = async () => {
            console.log(`\n--- Repairing dars_progress document permissions ---`);
            const limit = 100;
            let offset = 0;
            while (true) {
                const res = await databases.listDocuments(DB_ID, 'dars_progress', [
                    Query.limit(limit),
                    Query.offset(offset),
                ]);
                if (!res.documents.length) break;

                for (const doc of res.documents) {
                    const userId = doc.userId;
                    if (!userId) continue;
                    await safeCreate(`dars_progress perms: ${doc.$id}`, () =>
                        databases.updateDocument(
                            DB_ID,
                            'dars_progress',
                            doc.$id,
                            {
                                userId: doc.userId,
                                darsId: doc.darsId,
                                lastVisitedAt: doc.lastVisitedAt,
                                completed: doc.completed,
                            },
                            [
                                Permission.read(Role.user(userId)),
                                Permission.update(Role.user(userId)),
                                Permission.delete(Role.user(userId)),
                            ]
                        )
                    );
                }

                offset += res.documents.length;
                if (res.documents.length < limit) break;
            }
        };

        await repairSavedItemsPermissions();
        await repairDarsProgressPermissions();

        // 2. Collections (ENABLING DOCUMENT SECURITY)
        const collections = [
            { id: 'dars', name: 'Lessons' },
            { id: 'questions', name: 'Q&A' },
            { id: 'categories', name: 'Categories' },
            { id: 'saved_items', name: 'Saved Items' },
            { id: 'dars_progress', name: 'Dars Progress' }
        ];

        for (const col of collections) {
            console.log(`\n📦 Collection: ${col.id}`);
            try {
                // We update the collection to ensure Document Level Security is ON
                // and give basic permissions so the client logic can work.
                await databases.updateCollection(
                    DB_ID, col.id, col.name,
                    [
                        Permission.read(Role.any()), // Allow public read
                        Permission.create(Role.users()), // Allow any logged in user to create
                        Permission.update(Role.users()), // Allow logged in users to update (needed with document security)
                        Permission.delete(Role.users()), // Allow logged in users to delete (needed with document security)
                    ],
                    true // <--- ENABLE DOCUMENT LEVEL SECURITY
                );
                console.log('   ✅ Permissions Updated & Document Security Enabled.');
            } catch (e) {
                console.log(`   ⚠️ Failed to update ${col.id}: ${e.message}`);
                // If it fails, maybe it doesn't exist? (Shouldn't happen if previous script ran)
            }
        }

        // 3. Storage
        console.log('\n--- Storage Check ---');
        try {
            await storage.updateBucket(
                BUCKET_ID, BUCKET_ID,
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.team('admins')),
                    Permission.delete(Role.team('admins'))
                ],
                false
            );
            console.log(`✅ Bucket permissions updated.`);
        } catch (e) {
            console.log(`⚠️ Bucket update failed: ${e.message}`);
        }

        console.log('\n🏆 ALL PERMISSIONS CONFIGURED.');

    } catch (error) {
        console.error('\n❌ PERMISSIONS SETUP FAILED:');
        console.log(JSON.stringify(error, null, 2));
    }
}

setup();

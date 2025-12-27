import 'dotenv/config';
import { Client, Databases, Permission, Role, ID } from 'node-appwrite';

const PROJECT_ID = '69439d940026d59ca784';
const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    throw new Error('Missing APPWRITE_API_KEY in environment. Set it before running setup-events.js');
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const DB_ID = 'flare_db';

async function setupEventsCollections() {
    try {
        console.log('Setting up Events database collections...');

        // Create event_categories collection
        console.log('Creating event_categories collection...');
        try {
            await databases.createCollection(
                DB_ID, 
                'event_categories', 
                'Event Categories',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.team('admin')),
                    Permission.update(Role.team('admin')),
                    Permission.delete(Role.team('admin'))
                ],
                false // documentSecurity disabled
            );
            console.log('✅ Created event_categories collection');

            // Create attributes for event_categories
            await databases.createStringAttribute(DB_ID, 'event_categories', 'name', 100, true);
            await databases.createStringAttribute(DB_ID, 'event_categories', 'description', 500, false);
            await databases.createStringAttribute(DB_ID, 'event_categories', 'color', 7, false); // Hex color

            console.log('✅ Created event_categories attributes');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  event_categories collection already exists');
            } else {
                throw error;
            }
        }

        // Create events collection
        console.log('Creating events collection...');
        try {
            await databases.createCollection(
                DB_ID, 
                'events', 
                'Islamic Events',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.team('admin')),
                    Permission.update(Role.team('admin')),
                    Permission.delete(Role.team('admin'))
                ],
                false // documentSecurity disabled
            );

            // Create attributes for events
            await databases.createStringAttribute(DB_ID, 'events', 'title', 200, true);
            await databases.createStringAttribute(DB_ID, 'events', 'description', 2000, true);
            await databases.createStringAttribute(DB_ID, 'events', 'image', 500, false);
            await databases.createDatetimeAttribute(DB_ID, 'events', 'eventDate', true);
            await databases.createStringAttribute(DB_ID, 'events', 'location', 200, false);
            await databases.createStringAttribute(DB_ID, 'events', 'organizer', 100, false);
            await databases.createStringAttribute(DB_ID, 'events', 'category', 50, true);

            console.log('✅ Created events collection and attributes');

            console.log('✅ Events collection created (permissions will be set via existing admin team)');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  events collection already exists');
            } else {
                throw error;
            }
        }

        // Add some default event categories
        console.log('Adding default event categories...');
        const defaultCategories = [
            { name: 'Islamic Event', description: 'General Islamic events and gatherings', color: '#10b981' },
            { name: 'Lecture', description: 'Islamic lectures and talks', color: '#3b82f6' },
            { name: 'Workshop', description: 'Interactive Islamic workshops and seminars', color: '#f59e0b' },
            { name: 'Conference', description: 'Large-scale Islamic conferences', color: '#8b5cf6' },
            { name: 'Seminar', description: 'Educational Islamic seminars', color: '#ef4444' },
            { name: 'Community', description: 'Community-focused Islamic events', color: '#06b6d4' }
        ];

        for (const category of defaultCategories) {
            try {
                await databases.createDocument(DB_ID, 'event_categories', ID.unique(), category);
                console.log(`✅ Created category: ${category.name}`);
            } catch (error) {
                console.log(`⚠️  Category ${category.name} may already exist`);
            }
        }

        console.log('🎉 Events database setup completed successfully!');

    } catch (error) {
        console.error('❌ Error setting up events collections:', error);
        process.exit(1);
    }
}

// Run the setup
setupEventsCollections();

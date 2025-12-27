// Quick Appwrite Configuration Test
import { Client, Account } from 'appwrite';

// Test client configuration
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69439d940026d59ca784');

const account = new Account(client);

async function testConnection() {
    try {
        console.log('🔍 Testing Appwrite connection...');

        // Test 1: Health check
        console.log('1. Checking Appwrite health...');
        const healthResponse = await fetch('https://sgp.cloud.appwrite.io/v1/health');
        console.log(`✅ Health check: ${healthResponse.status}`);

        // Test 2: Try account creation (will likely fail without proper config)
        console.log('2. Testing account creation permissions...');
        const testEmail = `test-${Date.now()}@example.com`;

        try {
            await account.create(`test-${Date.now()}`, testEmail, 'testpass123');
            console.log('✅ Account creation works!');
        } catch (createError) {
            console.log('❌ Account creation failed:', createError.message);
            if (createError.message.includes('guests') && createError.message.includes('scopes')) {
                console.log('🔧 SOLUTION: You need to configure API keys in Appwrite Console');
            }
        }

    } catch (error) {
        console.log('❌ General error:', error.message);
    }
}

testConnection();

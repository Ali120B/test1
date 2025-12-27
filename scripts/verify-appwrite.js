// Quick verification script for Appwrite setup
import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69439d940026d59ca784');

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

async function verifySetup() {
    console.log('🔍 Verifying Appwrite Setup...\n');

    // Test 1: API Key Configuration
    console.log('1. API Key Status:');
    const hasApiKey = process.env.APPWRITE_API_KEY && process.env.APPWRITE_API_KEY.length > 10;
    console.log(`   ${hasApiKey ? '✅' : '❌'} API Key configured in environment`);

    // Test 2: Basic Connection
    console.log('\n2. Connection Test:');
    try {
        const healthResponse = await fetch('https://sgp.cloud.appwrite.io/v1/health');
        console.log(`   ✅ Health check: ${healthResponse.status}`);
    } catch (error) {
        console.log(`   ❌ Health check failed: ${error.message}`);
    }

    // Test 3: Authentication Permissions
    console.log('\n3. Authentication Permissions:');
    try {
        // Try to create a test account (this should work with proper API key)
        const testEmail = `verify-${Date.now()}@test.com`;
        await account.create(`test-${Date.now()}`, testEmail, 'testpass123');
        console.log('   ✅ Account creation: Working');

        // Try email verification
        await account.createVerification(`http://localhost:8080/verify-email`);
        console.log('   ✅ Email verification: Working');

    } catch (error) {
        console.log(`   ❌ Authentication failed: ${error.message}`);

        if (error.message.includes('guests') && error.message.includes('scopes')) {
            console.log('   🔧 SOLUTION: API key missing required scopes');
            console.log('   📋 Check APPWRITE_SETUP_GUIDE.txt for complete fix');
        } else if (error.message.includes('key')) {
            console.log('   🔧 SOLUTION: Invalid or missing API key');
        }
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Follow APPWRITE_SETUP_GUIDE.txt exactly');
    console.log('2. Ensure ALL scopes are selected for API key');
    console.log('3. Restart development server after .env changes');
    console.log('4. Test registration with a new email');

    console.log('\n🔗 Useful Links:');
    console.log('• Appwrite Console: https://cloud.appwrite.io');
    console.log('• Project URL: https://cloud.appwrite.io/console/project-69439d940026d59ca784');
    console.log('• API Keys: https://cloud.appwrite.io/console/project-69439d940026d59ca784/overview/keys');
}

verifySetup().catch(console.error);

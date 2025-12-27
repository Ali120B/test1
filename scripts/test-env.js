// Quick environment variables test
console.log('Environment Variables Test:');
console.log('VITE_APPWRITE_PROJECT_ID:', import.meta.env.VITE_APPWRITE_PROJECT_ID);
console.log('VITE_APPWRITE_ENDPOINT:', import.meta.env.VITE_APPWRITE_ENDPOINT);
console.log('VITE_APPWRITE_PROJECT_NAME:', import.meta.env.VITE_APPWRITE_PROJECT_NAME);
console.log('APPWRITE_API_KEY exists:', !!process.env.APPWRITE_API_KEY);

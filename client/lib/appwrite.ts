import { Client, Account, Databases, Storage, Teams, ID } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '69439d940026d59ca784');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

export const DB_ID = 'flare_db'; // Your Database ID
export const BUCKET_ID = 'media'; // Your Bucket ID
export const ADMIN_TEAM_ID = '6943b1d8003077f58ddb'; // Team ID from error message

export { ID };

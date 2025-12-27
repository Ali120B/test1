import express from 'express';
import { Client, Account } from 'node-appwrite';

// Server-side Appwrite client with API key
const serverClient = new Client();
serverClient
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('69439d940026d59ca784');

if (process.env.APPWRITE_API_KEY) {
    serverClient.setKey(process.env.APPWRITE_API_KEY);
}

console.log('Server Appwrite API Key configured:', !!process.env.APPWRITE_API_KEY);

const account = new Account(serverClient);

const router = express.Router();

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, secret } = req.body;

    if (!userId || !secret) {
      return res.status(400).json({
        success: false,
        message: 'User ID and secret are required'
      });
    }

    // Verify email using Appwrite
    await account.updateVerification(userId, secret);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    console.error('Email verification error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Email verification failed'
    });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Create a new verification email for the user
    await account.createVerification(`${process.env.CLIENT_URL || 'http://localhost:8080'}/verify-email`);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send verification email'
    });
  }
});

export default router;

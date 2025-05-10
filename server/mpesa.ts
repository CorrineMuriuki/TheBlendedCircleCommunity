import axios from 'axios';
import { Buffer } from 'buffer';

// M-PESA API URLs - Using sandbox URLs by default
const BASE_URL = process.env.MPESA_PRODUCTION === 'true' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

const TOKEN_URL = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
const STK_PUSH_URL = `${BASE_URL}/mpesa/stkpush/v1/processrequest`;

/**
 * Generate an access token for M-PESA API
 */
export async function getAccessToken() {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(TOKEN_URL, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error generating M-PESA access token:', error);
    throw new Error('Failed to generate M-PESA access token');
  }
}

/**
 * Generate password for STK Push
 */
export function generatePassword(timestamp: string) {
  const shortcode = process.env.MPESA_SHORTCODE || '';
  const passkey = process.env.MPESA_PASSKEY || '';
  
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

/**
 * Initiate STK Push request
 */
export async function initiateSTKPush(
  amount: number,
  phoneNumber: string,
  accountReference: string,
  description: string
) {
  try {
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      throw new Error('M-PESA credentials not provided');
    }

    // Format phone number (remove leading 0 or +254 and add 254)
    const formattedPhone = phoneNumber
      .replace(/^0/, '254')
      .replace(/^\+254/, '254');
    
    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    
    // Generate password
    const password = generatePassword(timestamp);
    
    // Get access token
    const accessToken = await getAccessToken();
    
    const requestBody = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      // Using the new active ngrok URL for callbacks
      CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://a394-197-155-73-23.ngrok-free.app/api/mpesa/callback',
      AccountReference: accountReference,
      TransactionDesc: description,
    };
    
    const response = await axios.post(STK_PUSH_URL, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error initiating STK Push:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.errorMessage || 
      'Failed to initiate M-PESA payment. Please try again.'
    );
  }
}

/**
 * Process callback from M-PESA
 */
export function processSTKCallback(callbackData: any) {
  try {
    const resultCode = callbackData.Body.stkCallback.ResultCode;
    
    if (resultCode === 0) {
      // Payment successful
      const details = callbackData.Body.stkCallback.CallbackMetadata.Item;
      
      // Extract payment details
      const amount = details.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = details.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = details.find((item: any) => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = details.find((item: any) => item.Name === 'PhoneNumber')?.Value;
      
      return {
        success: true,
        amount,
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber,
      };
    } else {
      // Payment failed
      const resultDesc = callbackData.Body.stkCallback.ResultDesc;
      
      return {
        success: false,
        message: resultDesc,
      };
    }
  } catch (error) {
    console.error('Error processing STK callback:', error);
    return {
      success: false,
      message: 'Failed to process payment response',
    };
  }
}
import axios from 'axios';
import { security } from './security';

interface STKPushParams {
  phoneNumber: string;
  amount: number;
  orderId: string;
  callbackUrl: string;
}

class MpesaAPI {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;
  private passkey: string;
  private shortcode: string;

  constructor() {
    const env = process.env.NODE_ENV || 'development';
    this.baseUrl = env === 'production'
      ? 'https://api.safaricom.com'
      : 'https://sandbox.safaricom.co.ke';
    
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    this.passkey = process.env.MPESA_PASSKEY || '';
    this.shortcode = process.env.MPESA_SHORTCODE || '';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get M-PESA access token');
    }
  }

  private generatePassword(timestamp: string): string {
    const str = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(str).toString('base64');
  }

  async initiateSTKPush(params: STKPushParams): Promise<any> {
    try {
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = this.generatePassword(timestamp);
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: params.amount,
          PartyA: params.phoneNumber,
          PartyB: this.shortcode,
          PhoneNumber: params.phoneNumber,
          CallBackURL: params.callbackUrl,
          AccountReference: params.orderId,
          TransactionDesc: `Payment for order ${params.orderId}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to initiate M-PESA STK push');
    }
  }

  async validateCallback(data: any): Promise<{
    success: boolean;
    transactionId?: string;
    amount?: number;
    phoneNumber?: string;
  }> {
    try {
      const { Body } = data;
      
      if (Body.stkCallback.ResultCode !== 0) {
        return { success: false };
      }

      const items = Body.stkCallback.CallbackMetadata.Item;
      const amount = items.find((item: any) => item.Name === 'Amount')?.Value;
      const transactionId = items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = items.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      return {
        success: true,
        transactionId,
        amount,
        phoneNumber: phoneNumber?.toString(),
      };
    } catch (error) {
      return { success: false };
    }
  }
}

export const mpesaAPI = new MpesaAPI();

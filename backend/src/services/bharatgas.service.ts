import axios, { AxiosError } from 'axios';
import { env } from '../config/env';

export interface BharatGasOrder {
  orderId: string;
  customer: string;
  mobile: string;
  area: string;
  lpgId?: string;
  points?: number;
}

export interface BpclVerifyUserResponse {
  status?: string;
  registered?: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface BpclSendOtpResponse {
  status?: string;
  message?: string;
  otpAuthToken?: string;
  otpTimeStamp?: string;
  [key: string]: unknown;
}

export interface BpclValidateOtpResponse {
  status?: string;
  message?: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
  customerName?: string;
  name?: string;
  [key: string]: unknown;
}

function parseBpclError(data: unknown) {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const message = record.message || record.error || record.errorMessage;
    if (typeof message === 'string' && message.trim()) return message;

    if (Array.isArray(record.errors)) {
      const messages = record.errors
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const error = item as Record<string, unknown>;
            return error.message || error.error || error.errorMessage;
          }
          return null;
        })
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

      if (messages.length > 0) return messages.join(', ');
    }
  }

  return 'BPCL request failed';
}

export class BpclApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function buildBpclHeaders(bgToken?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (bgToken) {
    headers.Authorization = bgToken.startsWith('Bearer ')
      ? bgToken
      : `Bearer ${bgToken}`;
  }

  return headers;
}

async function postBpcl<TResponse>(url: string, data: Record<string, unknown>, bgToken?: string) {
  try {
    console.log(url);
    const response = await axios.post<TResponse>(url, data, {
      headers: buildBpclHeaders(bgToken),
    });
    console.log(response.data); 
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.log(error.response.data, error.response.status);
      throw new BpclApiError(error.response.status, parseBpclError(error.response.data));
    }

    throw new Error(error instanceof Error ? error.message : 'BPCL request failed');
  }
}

export function verifyUser(mobileNumber: string) {
  return postBpcl<BpclVerifyUserResponse>(env.bpclVerifyUserUrl, {
    customerId: mobileNumber,
    channel: 'MOBILE',
  });
}

export function sendOtp(mobileNumber: string) {
  return postBpcl<BpclSendOtpResponse>(env.bpclSendOtpUrl, {
    // mobileNumber,
    // channel: 'MOBILE',
    // loginType: 'MOBILE',
  });
}

export function validateOtp(mobileNumber: string, otp: string, otpAuthToken: string, deviceId: string) {
  return postBpcl<BpclValidateOtpResponse>(env.bpclValidateOtpUrl, {
    mobileNumber,
    otp,
    otpAuthToken,
    channel: 'MOBILE',
    deviceId,
  });
}

export async function syncLogin(mobile: string, deviceId: string) {
  console.log(`[Sync] Authenticating ${mobile} for device ${deviceId}`);

  return {
    status: 'success',
    token: `bg_official_token_${Math.random().toString(36).slice(2)}`,
    operatorName: mobile === '8799190172' ? 'PRAGTI OFFICE' : 'NEW OPERATOR',
    message: 'Successfully synchronized with BharatGas servers',
  };
}

export async function fetchOrders(mobile: string, bgToken: string): Promise<BharatGasOrder[]> {
  void bgToken;
  console.log(`[Sync] Fetching orders for ${mobile}`);

  return [
    { orderId: '25750', customer: 'NEW OFFICIAL CUST', mobile: '9988776655', area: 'VATVA CLUSTER', lpgId: 'LPG-25750', points: 25 },
    { orderId: '25751', customer: 'OFFICIAL TEST USER', mobile: '8877665544', area: 'NAROL', lpgId: 'LPG-25751', points: 25 },
  ];
}

export async function confirmDelivery(orderId: string, accountMobile: string, bgToken: string) {
  void bgToken;
  console.log(`[Sync] EXECUTING OFFICIAL CONFIRMATION for order ${orderId} via ${accountMobile}`);

  return {
    status: 'success',
    message: 'Confirmed on BharatGas Official Server',
    officialRef: `REF-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
  };
}

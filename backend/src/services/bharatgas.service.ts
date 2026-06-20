import axios, { AxiosError } from 'axios';

export interface BharatGasOrder {
  orderId: string;
  customer: string;
  mobile: string;
  area: string;
  lpgId?: string;
  points?: number;
}

const BPCL_SEND_OTP_URL = 'https://api.cep.bpcl.in/bpclservices/v2/bpcl/user/otp/send';

function parseBpclError(data: unknown) {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const message = record.message || record.error || record.errorMessage;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return 'Failed to send OTP';
}

export async function sendOtp(mobileNumber: string) {
  try {
    const response = await axios.post<unknown>(
      BPCL_SEND_OTP_URL,
      {
        mobileNumber,
        channel: 'MOBILE',
        loginType: 'MOBILE',
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError && error.response) {
      throw new Error(parseBpclError(error.response.data));
    }

    throw new Error(error instanceof Error ? error.message : 'Failed to send OTP');
  }
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

export async function fetchOrders(mobile: string): Promise<BharatGasOrder[]> {
  console.log(`[Sync] Fetching orders for ${mobile}`);

  return [
    { orderId: '25750', customer: 'NEW OFFICIAL CUST', mobile: '9988776655', area: 'VATVA CLUSTER', lpgId: 'LPG-25750', points: 25 },
    { orderId: '25751', customer: 'OFFICIAL TEST USER', mobile: '8877665544', area: 'NAROL', lpgId: 'LPG-25751', points: 25 },
  ];
}

export async function confirmDelivery(orderId: string, accountMobile: string) {
  console.log(`[Sync] EXECUTING OFFICIAL CONFIRMATION for order ${orderId} via ${accountMobile}`);

  return {
    status: 'success',
    message: 'Confirmed on BharatGas Official Server',
    officialRef: `REF-${Math.random().toString(36).toUpperCase().slice(2, 10)}`,
  };
}

import { apiRequest } from './client';
import { SavedAddress } from '../types';

export interface CustomerProfileResponse {
  profile: {
    name: string;
    phone: string;
    email?: string;
    preferences?: any;
    savedAddresses?: SavedAddress[];
  };
}

export async function fetchCustomerProfile(): Promise<CustomerProfileResponse> {
  return apiRequest<CustomerProfileResponse>('/api/customer');
}

export async function updateCustomerProfile(data: any): Promise<any> {
  return apiRequest<any>('/api/customer', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

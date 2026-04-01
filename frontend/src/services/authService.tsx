import axios from 'axios';
import api, { setAccessToken } from '../utils/api';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ── login ────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<User> {
  const { data } = await axios.post<LoginResponse>(
    `${API_BASE_URL}/auth/login`,
    { email, password },
    { withCredentials: true }
  );

  setAccessToken(data.access_token);
  return data.user;
}

// ── register ─────────────────────────────────────────────────────────
export async function register(
  email: string,
  username: string,
  password: string,
  fullName?: string
): Promise<User> {
  const { data } = await axios.post<User>(`${API_BASE_URL}/auth/register`, {
    email,
    username,
    password,
    full_name: fullName,
  });
  return data;
}

// ── logout ───────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore
  }
  setAccessToken(null);
}

// ── silentRefresh (gọi khi app load) ────────────────────────────────
export async function silentRefresh(): Promise<void> {
  const { data } = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  setAccessToken(data.access_token);
}

// ── getMe ────────────────────────────────────────────────────────────
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}
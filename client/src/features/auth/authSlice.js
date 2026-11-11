// Redux slice for authentication state.
// Handles login, registration, session restore on refresh, and logout.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('zenvora_token');
}

function saveToken(token) {
  localStorage.setItem('zenvora_token', token);
}

function clearToken() {
  localStorage.removeItem('zenvora_token');
}

async function handleResponse(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ── Thunks ───────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse);
    saveToken(data.token);
    return data; // { token, user }
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(handleResponse);
    saveToken(data.token);
    return data; // { token, user }
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  const token = getToken();
  if (!token) return rejectWithValue('No token');
  try {
    const data = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handleResponse);
    return { token, user: data.user };
  } catch (err) {
    clearToken(); // token invalid/expired
    return rejectWithValue(err.message);
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    status: 'idle',   // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      clearToken();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── Register ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── Session restore ──
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectUser  = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;


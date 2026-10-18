/**
 * WealthWise API Client
 * Seamlessly connects the React frontend to the Express/PostgreSQL backend.
 * Provides cloud persistence and cross-browser state restoration.
 */

const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const effectiveToken = token || localStorage.getItem('wealthwise_auth_token');
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }
  return headers;
};

// ================= CLOUD SYNC & RESTORATION =================
export async function fetchUserFullSync(userIdOrEmail?: string, token?: string | null) {
  try {
    const params = new URLSearchParams();
    if (userIdOrEmail) {
      if (userIdOrEmail.includes('@')) {
        params.append('email', userIdOrEmail);
      } else {
        params.append('userId', userIdOrEmail);
      }
    }
    const url = `${API_BASE_URL}/sync${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.warn('⚠️ Cloud sync fetch unavailable, using local cache:', err);
    return null;
  }
}

export async function saveUserFullSync(payload: any, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.warn('⚠️ Cloud sync save deferred:', err);
    return false;
  }
}

// ================= TRANSACTIONS =================
export async function apiRecordTransaction(tx: any, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(tx),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiRecordTransaction error:', err);
    return false;
  }
}

export async function apiDeleteTransaction(id: string, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiDeleteTransaction error:', err);
    return false;
  }
}

// ================= BUDGET & CATEGORIES =================
export async function apiUpdateCategory(id: string, updates: any, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/budget/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiUpdateCategory error:', err);
    return false;
  }
}

export async function apiCreateCategory(cat: any, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/budget/categories`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(cat),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiCreateCategory error:', err);
    return false;
  }
}

export async function apiDeleteCategory(id: string, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/budget/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiDeleteCategory error:', err);
    return false;
  }
}

export async function apiUpdateMonthlyIncome(monthlyIncome: number, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/budget/income`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ monthlyIncome }),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiUpdateMonthlyIncome error:', err);
    return false;
  }
}

// ================= BILLS =================
export async function apiCreateBill(bill: any, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/bills`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(bill),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiCreateBill error:', err);
    return false;
  }
}

export async function apiToggleBillPaid(id: string, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/bills/${id}/pay`, {
      method: 'PATCH',
      headers: getHeaders(token),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiToggleBillPaid error:', err);
    return false;
  }
}

// ================= GOALS =================
export async function apiCreateGoal(goal: any, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(goal),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiCreateGoal error:', err);
    return false;
  }
}

export async function apiContributeGoal(id: string, amount: number, token?: string | null) {
  try {
    const res = await fetch(`${API_BASE_URL}/goals/${id}/contribute`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({ amount }),
    });
    return res.ok;
  } catch (err) {
    console.warn('apiContributeGoal error:', err);
    return false;
  }
}

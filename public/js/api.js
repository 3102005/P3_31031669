// Minimal API helper used by the static frontend
async function apiFetch(path, opts = {}, auth = false){
  const headers = opts.headers || {};
  headers['Content-Type'] = 'application/json';
  if(auth){
    const token = localStorage.getItem('token');
    if(token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(path, Object.assign({ headers, credentials: 'same-origin' }, opts));
  if(!res.ok){
    const text = await res.text();
    const err = new Error(text || res.statusText);
    throw err;
  }
  return res.json();
}

async function apiGet(path, auth){ return apiFetch(path, { method: 'GET' }, auth); }
async function apiPost(path, body, auth){ return apiFetch(path, { method: 'POST', body: JSON.stringify(body) }, auth); }
async function apiPut(path, body, auth){ return apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }, auth); }

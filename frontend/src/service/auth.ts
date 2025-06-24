import config from "../config";

export function checkToken(token: string): Promise<boolean> {
  return fetch(`${config.baseUrl}/auth/checktok`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  }).then(response => {
    return response.ok;
  }).catch(_ => {
    return false;
  });
}

export async function login(password: string): Promise<string> {
  const response = await fetch(`${config.baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}, ${await response.text()}`);
  }

  const data = await response.json();
  return data.message;
}
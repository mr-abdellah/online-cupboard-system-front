import CryptoJS from "crypto-js";

const SECRET_KEY = "mediatech-doc"; // In production, use an environment variable

export const encryptToken = (token: string): string => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
};

export const decryptToken = (encryptedToken: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const setToken = (token: string): void => {
  const encryptedToken = encryptToken(token);
  localStorage.setItem("auth_token", encryptedToken);
};

export const getToken = (): string | null => {
  const encryptedToken = localStorage.getItem("auth_token");
  if (!encryptedToken) return null;
  return decryptToken(encryptedToken);
};

export const removeToken = (): void => {
  localStorage.removeItem("auth_token");
};

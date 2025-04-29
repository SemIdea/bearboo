// utils/authStorage.ts

import { ISessionWithUser } from "@/server/entities/session/DTO";

const setAuthData = (data: ISessionWithUser): void => {
  if (!data) return;

  document.cookie = `accessToken=${data.accessToken}; path=/;`;

  const safeSession = JSON.stringify(data).replace(/;/g, "%3B"); // Escape semicolons

  document.cookie = `session=${safeSession}; path=/;`;

  localStorage.setItem("refreshToken", data.refreshToken);
};

const clearAuthData = (): void => {
  document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
  document.cookie = `session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;

  localStorage.removeItem("refreshToken");
};

export { setAuthData, clearAuthData };

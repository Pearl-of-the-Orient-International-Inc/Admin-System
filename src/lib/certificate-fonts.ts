import type { CertificateCustomFont } from "@/app/(protected)/(routes)/members/certifications/_components/certifications.types";

const DATABASE_NAME = "pearl-certificate-fonts";
const STORE_NAME = "fonts";

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCertificateFonts(): Promise<CertificateCustomFont[]> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      database.close();
      resolve(request.result as CertificateCustomFont[]);
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function saveCertificateFonts(fonts: CertificateCustomFont[]) {
  const database = await openDatabase();
  await Promise.all(fonts.map((font) => new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(font);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  })));
  database.close();
}

export async function removeCertificateFont(id: string) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  database.close();
}

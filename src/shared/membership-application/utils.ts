export function computeAgeFromBirthday(birthday: string): string {
  if (!birthday) return "";

  const birthDate = new Date(birthday);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const hasNotHadBirthdayYet =
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate());

  if (hasNotHadBirthdayYet) {
    age -= 1;
  }

  if (age < 0) return "";
  return String(age);
}

export function sanitizeMobileNumber(value: string, maxLength = 11): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Failed to read file as data URL."));
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function splitName(fullName?: string | null): {
  firstName: string;
  lastName: string;
} {
  const normalized = fullName?.trim() ?? "";
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

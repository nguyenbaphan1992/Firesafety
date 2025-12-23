
export const submitAttendance = async (data: {
  name: string;
  employeeId: string;
  zoneId: string;
  coords: string;
}) => {
  // Replace this URL with your deployed Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

  if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
    console.warn("Google Script URL not configured. Simulating success...");
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Scripts usually require no-cors for simple POSTs
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return { success: true };
  } catch (error) {
    console.error("Attendance Sync Error:", error);
    throw error;
  }
};

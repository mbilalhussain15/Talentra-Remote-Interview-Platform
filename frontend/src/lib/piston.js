// Code execution via our own backend
const API_URL = import.meta.env.VITE_API_URL;

export async function executeCode(language, code) {
  try {
    const response = await fetch(`${API_URL}/code/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code }),
    });

    if (!response.ok) {
      return { success: false, error: `Execution failed (status: ${response.status})` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: `Failed to execute code: ${error.message}` };
  }
}

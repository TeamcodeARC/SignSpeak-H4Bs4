/**
 * API client for the Flask backend
 */

// The base URL for the backend API
// Change this to your local Flask server address when in development
const API_BASE_URL = "http://localhost:5000/api";

/**
 * Detects hands in an image and returns the hand landmarks and an annotated image
 * @param imageBase64 - Base64 encoded image data
 * @returns Promise with the detection results
 */
export async function detectHands(imageBase64: string): Promise<{
  handsDetected: boolean;
  numHands: number;
  handLandmarks: any[];
  annotatedImage: string;
}> {
  try {
    // Try local server first
    try {
      const response = await fetch(`${API_BASE_URL}/detect-hands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
        // Add small timeout for quick local detection
        signal: AbortSignal.timeout(5000), 
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (localError) {
      console.warn("Local server unavailable, trying remote API...");
    }

    // If local fails, try remote server
    const response = await fetch(`${REMOTE_API_URL}/detect-hands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error detecting hands:", error);
    throw error;
  }
}

/**
 * Interprets the sign language gesture in an image
 * @param imageBase64 - Base64 encoded image data
 * @returns Promise with the interpretation results
 */
export async function interpretSign(imageBase64: string): Promise<{
  text: string;
  confidence: number;
}> {
  try {
    // Try local server first
    try {
      const response = await fetch(`${API_BASE_URL}/interpret-sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
        // Add small timeout for quick local detection
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (localError) {
      console.warn("Local server unavailable, trying remote API...");
    }
    
    // If local fails, try remote server
    const response = await fetch(`${REMOTE_API_URL}/interpret-sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error interpreting sign:", error);
    throw error;
  }
}

/**
 * Converts text to speech using the backend API
 * @param text - The text to convert to speech
 * @param language - The language code (e.g., 'en-US', 'es-ES')
 * @returns Promise with the audio data as a base64 string
 */
export async function textToSpeech(
  text: string,
  language: string,
): Promise<{
  audio: string;
}> {
  try {
    // Try local server first
    try {
      const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language }),
        // Add small timeout for quick local detection
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (localError) {
      console.warn("Local server unavailable, trying remote API...");
    }
    
    // If local fails, try remote server
    const response = await fetch(`${REMOTE_API_URL}/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw error;
  }
}

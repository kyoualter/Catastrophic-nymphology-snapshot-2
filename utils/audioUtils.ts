
/**
 * Wraps raw 16-bit PCM data in a standard WAV header.
 * Gemini TTS returns 24kHz Mono 16-bit PCM.
 */
export function encodeWAV(samples: Int16Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  /* write the PCM samples */
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, samples[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Encodes raw 16-bit PCM data into an MP3 file using lamejs.
 * Correctly handles ESM module structure and global dependency injection.
 */
export async function encodeMP3(samples: Int16Array, sampleRate: number = 24000, bitrate: number = 128): Promise<Blob> {
  // Import the module from esm.sh
  const module = await import('https://esm.sh/lamejs@1.2.1');
  
  // Handle different ESM export patterns (default vs named)
  const lamejs = module.default || module;
  
  /**
   * FIX: lamejs is a port of C code and internally relies on several 
   * global objects (MPEGMode, Lame, BitStream) to exist during 
   * initialization of the Mp3Encoder. In an ESM context, we must 
   * explicitly bind these to the global window object if they aren't 
   * already present, otherwise it throws "MPEGMode is undefined".
   */
  if (typeof window !== 'undefined') {
    const w = window as any;
    // Map internal library components to global scope for the encoder constructor
    w.MPEGMode = w.MPEGMode || lamejs.MPEGMode;
    w.Lame = w.Lame || lamejs.Lame;
    w.BitStream = w.BitStream || lamejs.BitStream;
    w.common = w.common || lamejs.common;
    w.Tables = w.Tables || lamejs.Tables;
  }

  // Create the encoder instance
  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, bitrate);
  const mp3Data: Uint8Array[] = [];
  
  const sampleBlockSize = 1152; // Standard LAME block size
  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }
  }
  
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(new Uint8Array(mp3buf));
  }
  
  return new Blob(mp3Data, { type: 'audio/mp3' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function decodeBase64ToPCM(base64: string): Int16Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

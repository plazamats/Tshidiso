let analyser: AnalyserNode | null = null;
const bassBuffer = new Uint8Array(8);

export function setSharedAnalyser(node: AnalyserNode | null) {
  analyser = node;
}

export function getBassLevel(): number {
  const activeAnalyser = analyser;
  if (!activeAnalyser) return 0;
  try {
    activeAnalyser.getByteFrequencyData(bassBuffer);
    let sum = 0;
    for (let i = 0; i < bassBuffer.length; i++) sum += bassBuffer[i];
    return sum / bassBuffer.length / 255;
  } catch {
    return 0;
  }
}


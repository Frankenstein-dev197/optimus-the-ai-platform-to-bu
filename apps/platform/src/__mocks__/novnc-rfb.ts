// Mock implementation for @novnc/novnc/core/rfb
// This avoids build issues with the noVNC package

export interface RFBOptions {
  connectionState: string
  onClipboard: (text: string) => void
  onBell: () => void
  onDesktopName: (name: string) => void
}

export class RFB {
  constructor(url: string, options: RFBOptions) {
    console.log('RFB mock initialized with url:', url)
  }

  disconnect(): void {
    console.log('RFB mock disconnected')
  }

  sendKey(key: number, down: boolean): void {
    console.log('RFB mock sendKey:', key, down)
  }

  clipboardPaste(text: string): void {
    console.log('RFB mock clipboardPaste:', text)
  }

  viewOnly(value: boolean): void {
    console.log('RFB mock viewOnly:', value)
  }

  qualityLevel(level: number): void {
    console.log('RFB mock qualityLevel:', level)
  }

  compressionLevel(level: number): void {
    console.log('RFB mock compressionLevel:', level)
  }
}

export default { RFB }

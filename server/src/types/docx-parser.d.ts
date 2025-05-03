declare module 'docx-parser' {
  export function parseDocx(filePath: string, callback: (err: Error | null, data: string) => void): void;
} 
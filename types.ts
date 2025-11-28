export interface PDFFile {
  url: string;
  name: string;
  data: Blob;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  READING = 'READING',
  ERROR = 'ERROR'
}

export interface ScrollSettings {
  isPlaying: boolean;
  speed: number; // Pixels per frame (approx)
}

export enum AppMode {
  VIEW = 'VIEW',
  EDIT = 'EDIT'
}

export enum DrawingTool {
  PEN = 'PEN',
  ERASER = 'ERASER'
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
  type: DrawingTool; // Identifica se é traço ou apagador
}

export interface PenSettings {
  color: string;
  width: number;
}

export interface EraserSettings {
  width: number;
}
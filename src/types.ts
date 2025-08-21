export interface AudioTeeOptions {
  sampleRate?: number
  chunkDurationMs?: number
  mute?: boolean
  includeProcesses?: number[]
  excludeProcesses?: number[]
}

export interface AudioChunk {
  data: Buffer
}

export type LogLevel = 'metadata' | 'stream_start' | 'stream_stop' | 'info' | 'error' | 'debug'

export interface LogMessage {
  timestamp: Date
  message_type: LogLevel
  data: {
    message: string
  }
}

export interface AudioTeeEvents {
  data: (chunk: AudioChunk) => void
  start: () => void
  stop: () => void
  error: (error: Error) => void
  log: (message: string, level: LogLevel) => void
}

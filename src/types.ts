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

export type MessageType = 'metadata' | 'stream_start' | 'stream_stop' | 'info' | 'error' | 'debug'

export type LogLevel = 'info' | 'debug'

export interface MessageData {
  message: string
  context?: Record<string, string | number | boolean | object>
}

export interface LogMessage {
  timestamp: string
  message_type: MessageType
  data: MessageData
}

export interface AudioTeeEvents {
  data: (chunk: AudioChunk) => void
  start: () => void
  stop: () => void
  error: (error: Error) => void
  log: (level: LogLevel, message: MessageData) => void
}

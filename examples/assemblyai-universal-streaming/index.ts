import { AudioChunk, AudioTee, LogLevel, MessageData } from '../../dist/index.js'
import { AssemblyAI, TurnEvent } from 'assemblyai'

// Replace with your actual AssemblyAI API key
const API_KEY = process.env.ASSEMBLYAI_API_KEY

const SAMPLE_RATE = 16000

async function run() {
  if (!API_KEY) {
    console.error('Please set your AssemblyAI API key in the ASSEMBLYAI_API_KEY environment variable')
    process.exit(1)
  }

  console.log('Starting AudioTee -> AssemblyAI Universal Streaming example')
  console.log('Press Ctrl+C to stop')

  // Initialize AssemblyAI client
  const client = new AssemblyAI({
    apiKey: API_KEY,
  })

  // Create streaming transcriber with optimized settings for system audio
  const transcriber = client.streaming.transcriber({
    sampleRate: SAMPLE_RATE,
    formatTurns: true,
    encoding: 'pcm_s16le',
  })

  // Initialize AudioTee with matching sample rate and optimized chunk duration
  const audioTee = new AudioTee({
    sampleRate: SAMPLE_RATE, // Match AssemblyAI's expected sample rate
    chunkDurationMs: 50, // 50ms chunks as recommended by AssemblyAI
  })

  // Set up AssemblyAI transcriber event handlers
  transcriber.on('open', ({ id }: { id: string }) => {
    console.log(`AssemblyAI session opened with ID: ${id}`)
    console.log('Listening for system audio...\n')
  })

  transcriber.on('error', (error: Error) => {
    console.error('AssemblyAI Error:', error)
  })

  transcriber.on('close', (code: number, reason: string) => {
    console.log(`AssemblyAI session closed: ${code} - ${reason}`)
  })

  transcriber.on('turn', (turn: TurnEvent) => {
    if (!turn.transcript || turn.transcript.trim() === '') {
      return
    }

    // Show partial transcripts in real-time
    if (!turn.end_of_turn || !turn.turn_is_formatted) {
      // Clear line and show partial transcript
      process.stdout.write(`\r${turn.transcript}`)
    } else {
      // Show final formatted transcript
      process.stdout.write(`\r${' '.repeat(100)}\r`) // Clear line
      console.log(`${turn.transcript}`)
    }
  })

  audioTee.on('start', () => {
    console.log('AudioTee: Audio capture started')
  })

  audioTee.on('stop', () => {
    console.log('AudioTee: Audio capture stopped')
  })

  audioTee.on('error', (error: Error) => {
    console.error('AudioTee Error:', error)
  })

  audioTee.on('log', (level: LogLevel, message: MessageData) => {
    // Log different levels with appropriate formatting
    if (level === 'debug') {
      console.debug(`AudioTee [DEBUG]: ${message.message}`)
    } else if (level === 'info') {
      console.info(`AudioTee [INFO]: ${message.message}`)
    }
  })

  // Pipe AudioTee data to AssemblyAI
  audioTee.on('data', (chunk: AudioChunk) => {
    // Send audio data to AssemblyAI for transcription
    transcriber.sendAudio(chunk.data)
  })

  // Handle graceful shutdown
  let isShuttingDown = false

  const shutdown = async () => {
    if (isShuttingDown) return
    isShuttingDown = true

    console.log('Shutting down...')

    try {
      // Stop AudioTee first
      await audioTee.stop()

      // Close AssemblyAI transcriber
      await transcriber.close()

      console.log('Cleanup complete')
    } catch (error) {
      console.error('Error during shutdown:', error)
    }

    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  try {
    // Connect to AssemblyAI
    console.log('Connecting to AssemblyAI...')
    await transcriber.connect()

    // Start AudioTee
    console.log('Starting system audio capture...')
    await audioTee.start()
  } catch (error) {
    console.error('Failed to start:', error)
    await shutdown()
  }
}

// Start the example
run().catch(console.error)

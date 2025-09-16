import { Server as NetServer, Socket } from 'net'
import { NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  senderName?: string
  timestamp: Date
  sessionId: string
}

export interface RepairUpdate {
  repairId: string
  status: string
  message: string
  timestamp: Date
  technicianId?: string
}

export interface TypingIndicator {
  sessionId: string
  isTyping: boolean
  senderName: string
}

export interface AgentInfo {
  id: string
  name: string
  role: string
  avatar: string
  email: string
}

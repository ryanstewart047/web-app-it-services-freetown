import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponseServerIO } from '@/types/socket'

export const config = {
  api: {
    bodyParser: false,
  },
}

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    })
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join repair tracking room
      socket.on('join-repair', (repairId: string) => {
        socket.join(`repair-${repairId}`)
        console.log(`Client ${socket.id} joined repair room: ${repairId}`)
      })

      // Join chat session room
      socket.on('join-chat', (sessionId: string) => {
        socket.join(`chat-${sessionId}`)
        console.log(`Client ${socket.id} joined chat room: ${sessionId}`)
      })

      // Handle chat messages
      socket.on('send-message', (data) => {
        const { sessionId, message, sender, senderName } = data
        
        // Broadcast message to all clients in the chat room
        io.to(`chat-${sessionId}`).emit('new-message', {
          id: Date.now().toString(),
          content: message,
          sender,
          senderName,
          timestamp: new Date(),
        })
      })

      // Handle typing indicator
      socket.on('typing', (data) => {
        const { sessionId, isTyping, senderName } = data
        socket.to(`chat-${sessionId}`).emit('user-typing', {
          isTyping,
          senderName,
        })
      })

      // Handle repair status updates
      socket.on('repair-update', (data) => {
        const { repairId, status, message } = data
        
        // Broadcast update to all clients tracking this repair
        io.to(`repair-${repairId}`).emit('status-update', {
          repairId,
          status,
          message,
          timestamp: new Date(),
        })
      })

      // Handle technician assignment
      socket.on('assign-technician', (data) => {
        const { repairId, technician } = data
        
        io.to(`repair-${repairId}`).emit('technician-assigned', {
          repairId,
          technician,
          timestamp: new Date(),
        })
      })

      // Handle agent transfer in chat
      socket.on('transfer-to-agent', (data) => {
        const { sessionId, agentInfo } = data
        
        io.to(`chat-${sessionId}`).emit('agent-joined', {
          sessionId,
          agent: agentInfo,
          timestamp: new Date(),
        })
      })

      // Handle appointment confirmations
      socket.on('appointment-confirmed', (data) => {
        const { appointmentId, customerEmail } = data
        
        // Emit to specific customer if they're online
        io.emit('appointment-update', {
          appointmentId,
          status: 'confirmed',
          message: 'Your appointment has been confirmed!',
          timestamp: new Date(),
        })
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  res.end()
}

export default socketHandler

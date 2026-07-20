'use client'

// Global chat float controller
export class ChatFloatController {
  private static instance: ChatFloatController | null = null
  private listeners: ((isOpen: boolean, prefilledMessage?: string) => void)[] = []

  static getInstance(): ChatFloatController {
    if (!ChatFloatController.instance) {
      ChatFloatController.instance = new ChatFloatController()
    }
    return ChatFloatController.instance
  }

  // Subscribe to chat float state changes
  subscribe(callback: (isOpen: boolean, prefilledMessage?: string) => void) {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  // Open chat float with optional pre-filled message
  openChat(prefilledMessage?: string) {
    this.listeners.forEach(callback => callback(true, prefilledMessage))
  }

  // Close chat float
  closeChat() {
    this.listeners.forEach(callback => callback(false))
  }

  // Toggle chat float
  toggleChat(prefilledMessage?: string) {
    this.listeners.forEach(callback => callback(true, prefilledMessage))
  }
}

// Convenience functions for easy use
export const openChatFloat = (prefilledMessage?: string) => {
  ChatFloatController.getInstance().openChat(prefilledMessage)
}

export const closeChatFloat = () => {
  ChatFloatController.getInstance().closeChat()
}

export const toggleChatFloat = (prefilledMessage?: string) => {
  ChatFloatController.getInstance().toggleChat(prefilledMessage)
}
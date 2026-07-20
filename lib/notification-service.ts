// Real-time notification system for agents

interface AgentNotification {
  id: string;
  type: 'chat_request' | 'repair_update' | 'new_appointment' | 'urgent_issue';
  title: string;
  message: string;
  data: any;
  timestamp: Date;
  read: boolean;
}

interface ChatRequest {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  deviceType?: string;
  issueDescription?: string;
  timestamp: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, AgentNotification[]> = new Map();
  private socketIO: any;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setSocketIO(io: any) {
    this.socketIO = io;
  }

  // Notify agents about new chat requests
  async notifyAgentsOfChatRequest(request: ChatRequest) {
    const notification: AgentNotification = {
      id: `chat_${request.sessionId}_${Date.now()}`,
      type: 'chat_request',
      title: 'New Chat Request',
      message: `${request.customerName} needs assistance with ${request.deviceType || 'their device'}`,
      data: request,
      timestamp: new Date(),
      read: false
    };

    // Store notification for all agents
    await this.storeNotificationForAllAgents(notification);

    // Send real-time notification via Socket.IO
    if (this.socketIO) {
      this.socketIO.to('agents').emit('new_chat_request', {
        notification,
        chatRequest: request
      });
    }

    // Could also send SMS/email notifications for critical requests
    await this.sendUrgentNotifications(notification);
  }

  // Notify specific agent when assigned to chat
  async notifyAgentAssignment(agentId: string, sessionId: string, customerName: string) {
    const notification: AgentNotification = {
      id: `assignment_${sessionId}_${Date.now()}`,
      type: 'chat_request',
      title: 'Chat Assignment',
      message: `You've been assigned to help ${customerName}`,
      data: { sessionId, customerName, agentId },
      timestamp: new Date(),
      read: false
    };

    await this.storeNotificationForAgent(agentId, notification);

    if (this.socketIO) {
      this.socketIO.to(`agent_${agentId}`).emit('chat_assignment', {
        notification,
        sessionId,
        customerName
      });
    }
  }

  // Get notifications for specific agent
  async getAgentNotifications(agentId: string): Promise<AgentNotification[]> {
    return this.notifications.get(agentId) || [];
  }

  // Mark notification as read
  async markNotificationRead(agentId: string, notificationId: string) {
    const agentNotifications = this.notifications.get(agentId) || [];
    const notification = agentNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Notify agents about new repair records
  async notifyAgents(type: string, data: any) {
    const notification: AgentNotification = {
      id: `${type}_${Date.now()}`,
      type: type as any,
      title: this.getNotificationTitle(type),
      message: this.getNotificationMessage(type, data),
      data,
      timestamp: new Date(),
      read: false
    };

    await this.storeNotificationForAllAgents(notification);

    if (this.socketIO) {
      this.socketIO.to('agents').emit(type, notification);
    }
  }

  // Notify customer about updates
  async notifyCustomer(customerEmail: string, type: string, data: any) {
    // This could send real-time notifications to customer browser/app
    if (this.socketIO) {
      this.socketIO.to(`customer_${customerEmail}`).emit(type, data);
    }
  }

  // Get notification title based on type
  private getNotificationTitle(type: string): string {
    switch (type) {
      case 'repair_created':
        return 'New Repair Record';
      case 'repair_status_updated':
        return 'Repair Status Update';
      case 'new_appointment':
        return 'New Appointment Booked';
      default:
        return 'Notification';
    }
  }

  // Get notification message based on type and data
  private getNotificationMessage(type: string, data: any): string {
    switch (type) {
      case 'repair_created':
        return `New repair for ${data.customerName}: ${data.deviceType} - ${data.deviceModel}`;
      case 'repair_status_updated':
        return `Repair ${data.trackingId} status updated to ${data.status}`;
      case 'new_appointment':
        return `New appointment: ${data.customerName} - ${data.deviceType}`;
      default:
        return 'You have a new notification';
    }
  }

  // Store notification for all agents
  private async storeNotificationForAllAgents(notification: AgentNotification) {
    // In a real app, this would query the database for all active agents
    const agentIds = ['agent1', 'agent2', 'agent3']; // Mock agent IDs
    
    for (const agentId of agentIds) {
      await this.storeNotificationForAgent(agentId, notification);
    }
  }

  // Store notification for specific agent
  private async storeNotificationForAgent(agentId: string, notification: AgentNotification) {
    if (!this.notifications.has(agentId)) {
      this.notifications.set(agentId, []);
    }
    
    const agentNotifications = this.notifications.get(agentId)!;
    agentNotifications.unshift(notification);
    
    // Keep only last 50 notifications per agent
    if (agentNotifications.length > 50) {
      agentNotifications.splice(50);
    }
  }

  // Send urgent notifications via external channels
  private async sendUrgentNotifications(notification: AgentNotification) {
    // For critical issues, we could send SMS or push notifications
    if (notification.type === 'chat_request') {
      console.log(`URGENT: ${notification.title} - ${notification.message}`);
      
      // In production, integrate with services like:
      // - Twilio for SMS
      // - Firebase for push notifications
      // - Slack webhooks
      // - Microsoft Teams webhooks
    }
  }
}

// Available agents tracker
class AgentAvailabilityService {
  private static instance: AgentAvailabilityService;
  private availableAgents: Map<string, {
    id: string;
    name: string;
    expertise: string[];
    activeChats: number;
    maxChats: number;
    status: 'available' | 'busy' | 'away';
    lastSeen: Date;
  }> = new Map();

  static getInstance(): AgentAvailabilityService {
    if (!AgentAvailabilityService.instance) {
      AgentAvailabilityService.instance = new AgentAvailabilityService();
    }
    return AgentAvailabilityService.instance;
  }

  // Register agent as available
  setAgentAvailable(agentId: string, agentData: any) {
    this.availableAgents.set(agentId, {
      ...agentData,
      status: 'available',
      lastSeen: new Date(),
      activeChats: 0,
      maxChats: 5
    });
  }

  // Update agent status
  updateAgentStatus(agentId: string, status: 'available' | 'busy' | 'away') {
    const agent = this.availableAgents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastSeen = new Date();
    }
  }

  // Get best available agent for a request
  getAvailableAgent(deviceType?: string): string | null {
    const availableAgents = Array.from(this.availableAgents.values())
      .filter(agent => 
        agent.status === 'available' && 
        agent.activeChats < agent.maxChats
      )
      .sort((a, b) => a.activeChats - b.activeChats); // Prefer agents with fewer active chats

    if (availableAgents.length === 0) {
      return null;
    }

    // If device type is specified, prefer agents with relevant expertise
    if (deviceType) {
      const expertAgent = availableAgents.find(agent =>
        agent.expertise.some(exp => 
          exp.toLowerCase().includes(deviceType.toLowerCase())
        )
      );
      if (expertAgent) {
        return expertAgent.id;
      }
    }

    return availableAgents[0].id;
  }

  // Increment active chat count
  incrementActiveChats(agentId: string) {
    const agent = this.availableAgents.get(agentId);
    if (agent) {
      agent.activeChats++;
      if (agent.activeChats >= agent.maxChats) {
        agent.status = 'busy';
      }
    }
  }

  // Decrement active chat count
  decrementActiveChats(agentId: string) {
    const agent = this.availableAgents.get(agentId);
    if (agent && agent.activeChats > 0) {
      agent.activeChats--;
      if (agent.activeChats < agent.maxChats && agent.status === 'busy') {
        agent.status = 'available';
      }
    }
  }

  // Get all agents status
  getAllAgentsStatus() {
    return Array.from(this.availableAgents.values());
  }
}

export const notificationService = NotificationService.getInstance();
export const agentAvailabilityService = AgentAvailabilityService.getInstance();

export type { AgentNotification, ChatRequest };

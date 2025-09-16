import { NextRequest, NextResponse } from 'next/server'

// Mock data - in production, this would come from your database
const mockAppointments = [
  {
    id: 'APT-2025-001',
    trackingId: 'TRK-001',
    customerName: 'John Doe',
    deviceType: 'Mobile Phone',
    deviceModel: 'iPhone 14',
    status: 'in-progress',
    estimatedCompletion: '2025-09-18T10:00:00Z',
    notes: 'Screen replacement in progress. New parts have been ordered.',
    cost: 450000,
    createdAt: '2025-09-15T08:00:00Z',
    updatedAt: '2025-09-15T14:30:00Z'
  },
  {
    id: 'APT-2025-002',
    trackingId: 'TRK-002',
    customerName: 'Sarah Johnson',
    deviceType: 'Laptop',
    deviceModel: 'MacBook Pro',
    status: 'diagnosed',
    estimatedCompletion: '2025-09-20T16:00:00Z',
    notes: 'Hard drive failure detected. Replacement needed.',
    cost: 800000,
    createdAt: '2025-09-14T10:00:00Z',
    updatedAt: '2025-09-15T09:15:00Z'
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params

    // In production, query your database here
    const appointment = mockAppointments.find(apt => 
      apt.trackingId.toLowerCase() === trackingId.toLowerCase()
    )

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Return the appointment with the same ID format for consistency
    return NextResponse.json({
      ...appointment,
      id: appointment.trackingId
    })
  } catch (error) {
    console.error('Error fetching appointment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Admin endpoint to update appointment status
export async function PUT(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params
    const body = await request.json()
    const { status, notes, cost, estimatedCompletion } = body

    // In production, update your database here
    const appointmentIndex = mockAppointments.findIndex(apt => apt.trackingId === trackingId)
    
    if (appointmentIndex === -1) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Update the appointment
    mockAppointments[appointmentIndex] = {
      ...mockAppointments[appointmentIndex],
      status,
      notes,
      cost,
      estimatedCompletion,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(mockAppointments[appointmentIndex])
  } catch (error) {
    console.error('Error updating appointment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

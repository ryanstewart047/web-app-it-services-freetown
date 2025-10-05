import { NextRequest, NextResponse } from 'next/server'
import { generateTroubleshootingResponse } from '@/lib/google-ai-service'

export async function POST(request: NextRequest) {
  let requestBody: any = {}
  
  try {
    requestBody = await request.json()
    const { deviceType, deviceModel, issueDescription } = requestBody

    // Validate required fields
    if (!deviceType || !issueDescription) {
      return NextResponse.json(
        { success: false, error: 'Device type and issue description are required' },
        { status: 400 }
      )
    }

    if (!['computer', 'mobile'].includes(deviceType)) {
      return NextResponse.json(
        { success: false, error: 'Device type must be either "computer" or "mobile"' },
        { status: 400 }
      )
    }

    // Generate AI troubleshooting response
    const troubleshootingResult = await generateTroubleshootingResponse({
      deviceType,
      deviceModel: deviceModel || undefined,
      issueDescription
    })

    return NextResponse.json({
      success: true,
      data: troubleshootingResult
    })

  } catch (error) {
    console.error('Troubleshoot API error:', error)
    
    // Fallback response for when AI service fails
    const fallbackResponse = {
      diagnosis: `Based on your description of "${requestBody.issueDescription || 'the issue'}", this appears to be a common ${requestBody.deviceType || 'device'} problem that may require professional diagnosis.`,
      confidence: 60,
      steps: [
        {
          id: 'step1',
          title: 'Basic Troubleshooting',
          description: 'Try restarting your device and check if the issue persists.',
          type: 'action' as const
        },
        {
          id: 'step2',
          title: 'Check Connections',
          description: 'Ensure all cables and connections are secure and properly connected.',
          type: 'check' as const
        },
        {
          id: 'step3',
          title: 'Professional Assessment',
          description: 'If the issue continues, we recommend bringing your device in for professional diagnosis.',
          type: 'info' as const
        }
      ],
      escalate: true,
      estimatedTime: '15-30 minutes',
      difficulty: 'medium' as const
    }

    return NextResponse.json({
      success: true,
      data: fallbackResponse,
      source: 'fallback'
    })
  }
}
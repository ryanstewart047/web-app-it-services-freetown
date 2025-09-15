import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { knowledgeBase } from '@/lib/knowledge-base';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issue, deviceType, symptoms } = body;

    if (!issue || !deviceType) {
      return NextResponse.json(
        { error: 'Issue description and device type are required' },
        { status: 400 }
      );
    }

    // Check if we have a direct troubleshooting guide in our knowledge base
    const troubleshootingGuide = knowledgeBase.getTroubleshootingGuide(deviceType, issue)
    if (troubleshootingGuide && !process.env.GEMINI_API_KEY) {
      // Return structured troubleshooting guide from knowledge base
      let response = `# Troubleshooting Guide: ${deviceType}\n\n`
      response += `## Issue: ${issue}\n\n`
      response += `**Safety Level:** ${troubleshootingGuide.safety_level}\n`
      response += `**Difficulty:** ${troubleshootingGuide.difficulty}\n`
      if (troubleshootingGuide.tools_needed.length > 0) {
        response += `**Tools Needed:** ${troubleshootingGuide.tools_needed.join(', ')}\n`
      }
      response += `\n## Troubleshooting Steps\n\n`
      
      troubleshootingGuide.steps.forEach(step => {
        response += `${step.step}. **${step.action}**\n`
        response += `   ${step.description}\n`
        if (step.warning) {
          response += `   ⚠️ **Warning:** ${step.warning}\n`
        }
        response += '\n'
      })
      
      response += `## When to Stop\n${troubleshootingGuide.when_to_stop}\n\n`
      response += `## Professional Help Needed\n${troubleshootingGuide.professional_help_needed}`
      
      return NextResponse.json({
        success: true,
        deviceType,
        issue,
        troubleshootingSteps: response,
        timestamp: new Date().toISOString(),
        source: 'knowledge_base'
      })
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Get knowledge base context
    const knowledgeContext = knowledgeBase.generateAIContext(issue, deviceType)

    // Create detailed prompt for troubleshooting
    const prompt = `
As an expert IT technician for IT Services Freetown specializing in ${deviceType} repairs, provide troubleshooting steps for the following issue.

You have access to our comprehensive knowledge base with proven troubleshooting procedures:

${knowledgeContext}

Device Type: ${deviceType}
Issue: ${issue}
${symptoms ? `Symptoms: ${symptoms}` : ''}

Using the knowledge base information above when relevant, please provide:
1. Initial diagnosis of the likely cause
2. Step-by-step troubleshooting instructions (numbered list)
3. What tools or materials might be needed
4. Safety precautions
5. When to seek professional help

Keep the response practical, clear, and focused on actionable steps.
Format the response with clear headings and bullet points.
Reference our shop (IT Services Freetown, 1 Regent Highway, Jui Junction, Freetown, +232 33 399 391) for professional assistance when needed.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const troubleshootingSteps = response.text();

    return NextResponse.json({
      success: true,
      deviceType,
      issue,
      troubleshootingSteps,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Troubleshooting API error:', error);
    
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    
    // Fallback response if AI fails
    const fallbackSteps = `
# Troubleshooting Steps for ${body?.deviceType || 'Device'}

## Initial Diagnosis
The issue you're experiencing could have multiple causes. Let's work through some common solutions.

## Basic Troubleshooting Steps
1. **Power Check**: Ensure the device is properly connected to power
2. **Restart**: Turn the device off and on again
3. **Check Connections**: Verify all cables and connections are secure
4. **Software Updates**: Check for and install any available updates
5. **Safe Mode**: Try booting in safe mode if applicable

## When to Seek Professional Help
- If the issue persists after trying these steps
- If you're uncomfortable performing any of these steps
- If the device shows signs of physical damage

**Need professional assistance?** Book an appointment with our expert technicians.
`;

    return NextResponse.json({
      success: true,
      deviceType: body?.deviceType || 'Unknown',
      issue: body?.issue || 'General troubleshooting',
      troubleshootingSteps: fallbackSteps,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}
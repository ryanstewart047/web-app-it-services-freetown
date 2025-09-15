import fs from 'fs'
import path from 'path'

export interface KnowledgeBaseItem {
  question: string
  answer: string
  keywords: string[]
  difficulty: string
  category?: string
}

export interface TroubleshootingStep {
  step: number
  action: string
  description: string
  warning?: string | null
}

export interface TroubleshootingGuide {
  symptoms: string[]
  difficulty: string
  tools_needed: string[]
  safety_level: string
  steps: TroubleshootingStep[]
  when_to_stop: string
  professional_help_needed: string
}

export interface BusinessInfo {
  name: string
  location: string
  phone: string
  email: string
  hours: {
    weekdays: string
    weekend: string
    holidays: string
  }
  emergency: string
}

class KnowledgeBase {
  private faqData: any = null
  private businessData: any = null
  private computerTroubleshooting: any = null
  private mobileTroubleshooting: any = null

  constructor() {
    this.loadKnowledgeBase()
  }

  private loadKnowledgeBase() {
    try {
      const knowledgePath = path.join(process.cwd(), 'knowledge')
      
      // Load FAQ data
      const faqPath = path.join(knowledgePath, 'faq.json')
      if (fs.existsSync(faqPath)) {
        this.faqData = JSON.parse(fs.readFileSync(faqPath, 'utf8'))
      }

      // Load business info
      const businessPath = path.join(knowledgePath, 'business_info.json')
      if (fs.existsSync(businessPath)) {
        this.businessData = JSON.parse(fs.readFileSync(businessPath, 'utf8'))
      }

      // Load troubleshooting guides
      const computerPath = path.join(knowledgePath, 'troubleshooting', 'computer.json')
      if (fs.existsSync(computerPath)) {
        this.computerTroubleshooting = JSON.parse(fs.readFileSync(computerPath, 'utf8'))
      }

      const mobilePath = path.join(knowledgePath, 'troubleshooting', 'mobile.json')
      if (fs.existsSync(mobilePath)) {
        this.mobileTroubleshooting = JSON.parse(fs.readFileSync(mobilePath, 'utf8'))
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error)
    }
  }

  public searchFAQ(query: string): KnowledgeBaseItem[] {
    if (!this.faqData) return []

    const results: KnowledgeBaseItem[] = []
    const queryLower = query.toLowerCase()

    for (const category of this.faqData.categories) {
      for (const item of category.items) {
        // Check if query matches keywords or question
        const matchesKeywords = item.keywords.some((keyword: string) => 
          queryLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(queryLower)
        )
        const matchesQuestion = item.question.toLowerCase().includes(queryLower)
        const matchesAnswer = item.answer.toLowerCase().includes(queryLower)

        if (matchesKeywords || matchesQuestion || matchesAnswer) {
          results.push({
            ...item,
            category: category.name
          })
        }
      }
    }

    return results.slice(0, 5) // Return top 5 results
  }

  public getTroubleshootingGuide(deviceType: string, issue: string): TroubleshootingGuide | null {
    const troubleshootingData = deviceType.toLowerCase().includes('computer') || deviceType.toLowerCase().includes('laptop') 
      ? this.computerTroubleshooting 
      : this.mobileTroubleshooting

    if (!troubleshootingData) return null

    const issueLower = issue.toLowerCase()
    
    // Search through troubleshooting categories
    for (const [categoryKey, category] of Object.entries(troubleshootingData[Object.keys(troubleshootingData)[0]])) {
      for (const [issueKey, guide] of Object.entries(category as any)) {
        const guideData = guide as TroubleshootingGuide
        
        // Check if issue matches symptoms or key
        const matchesSymptoms = guideData.symptoms.some(symptom => 
          issueLower.includes(symptom.toLowerCase()) || symptom.toLowerCase().includes(issueLower)
        )
        const matchesKey = issueKey.toLowerCase().includes(issueLower) || issueLower.includes(issueKey.toLowerCase())

        if (matchesSymptoms || matchesKey) {
          return guideData
        }
      }
    }

    return null
  }

  public getBusinessInfo(): BusinessInfo | null {
    return this.businessData?.business_info || null
  }

  public getServiceInfo(serviceType?: string) {
    if (!this.businessData) return null
    
    if (serviceType) {
      return this.businessData.services[serviceType] || null
    }
    
    return this.businessData.services
  }

  public generateAIContext(query: string, deviceType?: string): string {
    let context = ''

    // Add business information
    const businessInfo = this.getBusinessInfo()
    if (businessInfo) {
      context += `Business Information:
- Name: ${businessInfo.name}
- Location: ${businessInfo.location}
- Phone: ${businessInfo.phone}
- Email: ${businessInfo.email}
- Hours: ${businessInfo.hours.weekdays}

`
    }

    // Search for relevant FAQ items
    const faqResults = this.searchFAQ(query)
    if (faqResults.length > 0) {
      context += `Relevant FAQ Information:
`
      faqResults.forEach((item, index) => {
        context += `${index + 1}. Q: ${item.question}
   A: ${item.answer}

`
      })
    }

    // Get troubleshooting guide if applicable
    if (deviceType) {
      const troubleshootingGuide = this.getTroubleshootingGuide(deviceType, query)
      if (troubleshootingGuide) {
        context += `Troubleshooting Steps:
Safety Level: ${troubleshootingGuide.safety_level}
Difficulty: ${troubleshootingGuide.difficulty}
Tools Needed: ${troubleshootingGuide.tools_needed.join(', ') || 'None'}

Steps:
`
        troubleshootingGuide.steps.forEach(step => {
          context += `${step.step}. ${step.action}: ${step.description}`
          if (step.warning) {
            context += ` ⚠️ WARNING: ${step.warning}`
          }
          context += '\n'
        })

        context += `
When to stop: ${troubleshootingGuide.when_to_stop}
Professional help needed: ${troubleshootingGuide.professional_help_needed}

`
      }
    }

    return context
  }

  public getContextualResponse(query: string, deviceType?: string): string {
    // Try to find direct FAQ match first
    const faqResults = this.searchFAQ(query)
    if (faqResults.length > 0) {
      return faqResults[0].answer
    }

    // Try troubleshooting guide
    if (deviceType) {
      const guide = this.getTroubleshootingGuide(deviceType, query)
      if (guide) {
        let response = `Here's a step-by-step troubleshooting guide for your ${deviceType}:

**Safety Level:** ${guide.safety_level}
**Difficulty:** ${guide.difficulty}
${guide.tools_needed.length > 0 ? `**Tools Needed:** ${guide.tools_needed.join(', ')}` : ''}

**Steps to follow:**
`
        guide.steps.forEach(step => {
          response += `${step.step}. **${step.action}**: ${step.description}`
          if (step.warning) {
            response += ` ⚠️ **Warning:** ${step.warning}`
          }
          response += '\n\n'
        })

        response += `**When to stop:** ${guide.when_to_stop}

**Professional help needed:** ${guide.professional_help_needed}

If you need assistance with any of these steps, feel free to bring your device to our shop!`

        return response
      }
    }

    return '' // No specific match found
  }
}

export const knowledgeBase = new KnowledgeBase()
export default knowledgeBase

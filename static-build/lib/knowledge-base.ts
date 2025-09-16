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
      
      // Clear any potential cache and reload files
      delete require.cache[path.join(knowledgePath, 'faq.json')]
      delete require.cache[path.join(knowledgePath, 'business_info.json')]
      
      // Load FAQ data
      const faqPath = path.join(knowledgePath, 'faq.json')
      if (fs.existsSync(faqPath)) {
        const faqContent = fs.readFileSync(faqPath, 'utf8')
        this.faqData = JSON.parse(faqContent)
        console.log('Loaded FAQ data with', this.faqData.categories?.length || 0, 'categories')
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

    const results: Array<KnowledgeBaseItem & { score: number }> = []
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).map(word => word.replace(/[^\w]/g, '')).filter(word => word.length > 2)

    for (const category of this.faqData.categories) {
      for (const item of category.items) {
        let score = 0

        // Check for exact question match (highest priority)
        if (item.question.toLowerCase() === queryLower) {
          score += 100
        }

        // Enhanced keyword matching with specificity prioritization
        const keywordMatches = item.keywords.filter((keyword: string) => 
          queryLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(queryLower)
        )
        score += keywordMatches.length * 10

        // Question title matches get high score
        if (item.question.toLowerCase().includes(queryLower)) {
          score += 15
        }

        // Partial question matches
        queryWords.forEach(word => {
          if (item.question.toLowerCase().includes(word)) {
            score += 4
          }
        })

        // Answer content matches get lower score
        queryWords.forEach(word => {
          if (item.answer.toLowerCase().includes(word)) {
            score += 1
          }
        })

        // Detect if query is asking about specific device/service
        const specificTerms = ['phone', 'phones', 'mobile', 'smartphone', 'cell', 'tablet', 'ipad', 'computer', 'laptop', 'pc', 'mac']
        const repairTerms = ['repair', 'fix', 'broken', 'issue', 'problem']
        const queryHasSpecific = specificTerms.some(term => queryLower.includes(term))
        const queryHasRepair = repairTerms.some(term => queryLower.includes(term))
        
        // Check if this FAQ item is about specific devices/services
        const itemIsSpecific = item.keywords.some((k: string) => 
          specificTerms.some(term => k.toLowerCase().includes(term))
        )
        
        // Check if this FAQ item is about repair services
        const itemIsRepair = item.keywords.some((k: string) => 
          repairTerms.some(term => k.toLowerCase().includes(term)) ||
          k.toLowerCase().includes('repair') ||
          k.toLowerCase().includes('fix')
        )
        
        // Check if this FAQ item is general (services overview)
        const generalTerms = ['services', 'what do you do', 'offer', 'what services']
        const itemIsGeneral = item.keywords.some((k: string) => 
          generalTerms.some(term => k.toLowerCase().includes(term))
        )
        
        // Check if this FAQ item is contact-related
        const itemIsContact = item.keywords.some((k: string) => 
          k.toLowerCase().includes('contact') || k.toLowerCase().includes('call') ||
          k.toLowerCase().includes('reach') || k.toLowerCase().includes('email')
        )

        // If query asks about REPAIRING specific device and this item is about REPAIRING that device, boost heavily
        if (queryHasSpecific && queryHasRepair && itemIsSpecific) {
          // Check for exact device type match with repair context
          if (queryWords.some(word => ['phone', 'phones', 'mobile', 'smartphone', 'cell'].includes(word))) {
            if (item.keywords.some((k: string) => 
              k.toLowerCase().includes('phone repair') || 
              k.toLowerCase().includes('mobile repair') || 
              k.toLowerCase().includes('fix phone') || 
              k.toLowerCase().includes('repair mobile') ||
              k.toLowerCase().includes('cell phone')
            )) {
              score += 100 // Massive boost for phone repair questions
            }
          }
          
          if (queryWords.some(word => ['tablet', 'ipad'].includes(word))) {
            if (item.keywords.some((k: string) => 
              k.toLowerCase().includes('tablet') || 
              k.toLowerCase().includes('ipad')
            )) {
              score += 100 // Massive boost for tablet questions
            }
          }
          
          if (queryWords.some(word => ['computer', 'laptop', 'pc', 'mac'].includes(word))) {
            if (item.keywords.some((k: string) => 
              (k.toLowerCase().includes('computer') || 
               k.toLowerCase().includes('laptop') || 
               k.toLowerCase().includes('pc') || 
               k.toLowerCase().includes('mac')) &&
              (k.toLowerCase().includes('repair') || k.toLowerCase().includes('fix'))
            )) {
              score += 100 // Massive boost for computer questions
            }
          }
        }

        // Heavy penalty for contact answers when asking about repair
        if (queryHasRepair && itemIsContact) {
          score -= 60 // Heavy penalty for contact info when asking about repairs
        }

        // Heavy penalty for general answers when specific device is mentioned in query
        if (queryHasSpecific && itemIsGeneral) {
          score -= 50 // Heavy penalty to push general answers down
        }

        // Boost for other specific question types
        if (queryWords.some(word => ['cost', 'price', 'pricing', 'much'].includes(word))) {
          if (item.keywords.some((k: string) => ['cost', 'price', 'pricing', 'expensive', 'cheap'].includes(k.toLowerCase()))) {
            score += 25
          }
        }

        if (queryWords.some(word => ['hours', 'open', 'closed', 'time'].includes(word))) {
          if (item.keywords.some((k: string) => ['hours', 'open', 'closed', 'time', 'schedule'].includes(k.toLowerCase()))) {
            score += 25
          }
        }

        if (queryWords.some(word => ['location', 'where', 'address'].includes(word))) {
          if (item.keywords.some((k: string) => ['location', 'address', 'where', 'find', 'directions'].includes(k.toLowerCase()))) {
            score += 25
          }
        }

        if (score > 0) {
          results.push({
            ...item,
            category: category.name,
            score
          })
        }
      }
    }

    // Sort by score (highest first) and return top 5
    const sortedResults = results.sort((a, b) => b.score - a.score)
    
    return sortedResults
      .slice(0, 5)
      .map(({ score, ...item }) => item) // Remove score from final result
  }

  private searchFAQWithScores(query: string): Array<KnowledgeBaseItem & { score: number }> {
    if (!this.faqData) return []

    const results: Array<KnowledgeBaseItem & { score: number }> = []
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).map(word => word.replace(/[^\w]/g, '')).filter(word => word.length > 2)

    for (const category of this.faqData.categories) {
      for (const item of category.items) {
        let score = 0

        // Check for exact question match (highest priority)
        if (item.question.toLowerCase() === queryLower) {
          score += 100
        }

        // Enhanced keyword matching with specificity prioritization
        const keywordMatches = item.keywords.filter((keyword: string) => 
          queryLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(queryLower)
        )
        score += keywordMatches.length * 10

        // Question title matches get high score
        if (item.question.toLowerCase().includes(queryLower)) {
          score += 15
        }

        // Partial question matches
        queryWords.forEach(word => {
          if (item.question.toLowerCase().includes(word)) {
            score += 4
          }
        })

        if (score > 0) {
          results.push({
            ...item,
            category: category.name,
            score
          })
        }
      }
    }

    // Sort by score (highest first) and return top 5
    const sortedResults = results.sort((a, b) => b.score - a.score)
    
    return sortedResults.slice(0, 5)
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
    // Try to find direct FAQ match first with internal scoring
    const faqResults = this.searchFAQWithScores(query)
    if (faqResults.length > 0 && faqResults[0].score >= 10) {
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

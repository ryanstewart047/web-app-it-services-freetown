import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/server/analytics-store';

export const dynamic = 'force-dynamic';

const GIST_ID = process.env.GITHUB_GIST_ID;
const GIST_TOKEN = process.env.GITHUB_TOKEN;
const GIST_FILENAME = process.env.GITHUB_GIST_FILENAME || 'its-analytics.json';

export async function POST(request: NextRequest) {
  try {
    const { timestamp, formType } = await request.json();
    
    if (!timestamp) {
      return NextResponse.json({ 
        success: false, 
        error: 'Timestamp is required' 
      }, { status: 400 });
    }

    // Get current analytics data
    const data = await getAnalyticsData({ force: true });
    
    if (!data.forms || !data.forms.submissions) {
      return NextResponse.json({ 
        success: false, 
        error: 'No form submissions found' 
      }, { status: 404 });
    }
    
    const originalCount = data.forms.submissions.length;
    
    // Filter out the specific submission by timestamp
    data.forms.submissions = data.forms.submissions.filter((submission: any) => {
      const matches = submission.timestamp === timestamp;
      return !matches;
    });
    
    const removedCount = originalCount - data.forms.submissions.length;
    
    if (removedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Submission not found' 
      }, { status: 404 });
    }
    
    // Save back to storage (Gist or file)
    if (GIST_ID && GIST_TOKEN) {
      // Update GitHub Gist
      const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${GIST_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(data, null, 2)
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update Gist: ${response.statusText}`);
      }
    } else {
      // Update local file
      const fs = require('fs').promises;
      const path = require('path');
      const dataDir = path.join(process.cwd(), 'data');
      const dataFile = path.join(dataDir, 'analytics.json');
      
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    }
    
    // Clear cache
    const { clearCache } = await import('@/lib/server/analytics-store');
    await clearCache();
    
    console.log(`[Forms Delete] ✅ Removed submission: ${formType} at ${timestamp}`);
    
    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
      remainingCount: data.forms.submissions.length
    });
  } catch (error) {
    console.error('Error deleting form submission:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to delete submission: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

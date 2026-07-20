import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData } from '@/lib/server/analytics-store';

export const dynamic = 'force-dynamic';

const GIST_ID = process.env.GITHUB_GIST_ID || process.env.OFFER_GIST_ID || '741d3c2e3203df10a318d3dae1a94c66';
const GIST_TOKEN = process.env.ITS_FREETOWN_OFFER_TOKEN || process.env.ITS_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
const GIST_FILENAME = process.env.GITHUB_GIST_FILENAME || 'its-analytics.json';

export async function POST(request: NextRequest) {
  try {
    const { timestamp, formType } = await request.json();
    
    console.log(`[Forms Delete] Attempting to delete submission:`, { timestamp, formType });
    
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
    console.log(`[Forms Delete] Total submissions before delete: ${originalCount}`);
    
    // Log a few timestamps for debugging
    if (data.forms.submissions.length > 0) {
      console.log(`[Forms Delete] Sample timestamps from data:`, 
        data.forms.submissions.slice(0, 3).map((s: any) => s.timestamp)
      );
    }
    
    // Filter out the specific submission by timestamp
    data.forms.submissions = data.forms.submissions.filter((submission: any) => {
      const matches = submission.timestamp === timestamp;
      if (matches) {
        console.log(`[Forms Delete] Found matching submission:`, { 
          timestamp: submission.timestamp, 
          formType: submission.formType 
        });
      }
      return !matches;
    });
    
    const removedCount = originalCount - data.forms.submissions.length;
    console.log(`[Forms Delete] Removed ${removedCount} submission(s)`);
    
    if (removedCount === 0) {
      console.error(`[Forms Delete] ❌ Submission not found. Looking for: ${timestamp}`);
      return NextResponse.json({ 
        success: false, 
        error: `Submission not found. Looking for timestamp: ${timestamp}` 
      }, { status: 404 });
    }
    
    // Save back to storage (Gist only - file system is read-only in production)
    if (!GIST_ID || !GIST_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'GitHub Gist storage not configured. Please set GITHUB_GIST_ID and GITHUB_TOKEN environment variables in Vercel.' 
      }, { status: 500 });
    }

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to update Gist: ${response.statusText} - ${JSON.stringify(errorData)}`);
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

/**
 * Newsletter Preview Component
 * Showcases the newsletter design system with sample content
 */

'use client'

export default function NewsletterPreview() {
  return (
    <div className="newsletter-preview max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900">
      {/* Newsletter Header */}
      <header className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="newsletter-display">SMNB Daily Brief</div>
        <p className="newsletter-lead">
          Your curated intelligence report on today's most significant developments
        </p>
        <div className="flex items-center gap-4 mt-4">
          <span className="newsletter-stat-label">Issue #247</span>
          <span className="newsletter-stat-label">•</span>
          <span className="newsletter-stat-label">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </header>

      {/* Main Story */}
      <article>
        <h1 className="newsletter-h1">Breaking: Major Policy Shift Announced</h1>
        
        <p className="newsletter-lead">
          In a surprising turn of events, officials announced sweeping changes that could reshape 
          the landscape of international relations for years to come.
        </p>

        <div className="newsletter-body newsletter-dropcap">
          <p>
            Today's announcement marks a pivotal moment in diplomatic history. After months of 
            behind-the-scenes negotiations, leaders have agreed to a framework that addresses 
            long-standing concerns while opening new avenues for cooperation.
          </p>
        </div>

        <h2 className="newsletter-h2">Key Developments</h2>
        
        <ul className="newsletter-list">
          <li>Unprecedented bilateral agreement reached after 18-hour negotiations</li>
          <li>Economic implications expected to exceed $500 billion over five years</li>
          <li>Multiple stakeholders express cautious optimism about implementation</li>
        </ul>

        <div className="newsletter-blockquote">
          This represents not just a policy change, but a fundamental shift in how we approach 
          global challenges. The ramifications will be felt for generations.
        </div>

        <h3 className="newsletter-h3">Analysis & Context</h3>
        
        <div className="newsletter-body">
          <p>
            Expert analysts suggest three primary factors contributed to this breakthrough:
          </p>
        </div>

        <ol className="newsletter-list newsletter-list-ordered">
          <li><span className="newsletter-strong">Economic Pressure:</span> Rising costs forced a reconsideration of traditional positions</li>
          <li><span className="newsletter-strong">Public Opinion:</span> Shifting demographics created new political realities</li>
          <li><span className="newsletter-strong">Technological Advances:</span> New capabilities enabled previously impossible solutions</li>
        </ol>

        <div className="newsletter-divider-dots"></div>

        <h2 className="newsletter-h2">Market Impact</h2>
        
        <div className="grid grid-cols-3 gap-6 my-8">
          <div className="text-center">
            <div className="newsletter-stat">+12.3%</div>
            <div className="newsletter-stat-label">S&P 500</div>
          </div>
          <div className="text-center">
            <div className="newsletter-stat">-0.47</div>
            <div className="newsletter-stat-label">USD Index</div>
          </div>
          <div className="text-center">
            <div className="newsletter-stat">$84.20</div>
            <div className="newsletter-stat-label">Oil (WTI)</div>
          </div>
        </div>

        <div className="newsletter-divider-thick"></div>

        <h4 className="newsletter-h4">Looking Ahead</h4>
        
        <div className="newsletter-body">
          <p>
            As implementation begins next quarter, attention will focus on three critical milestones 
            that will determine the long-term success of this initiative. Stakeholders are advised 
            to monitor developments closely.
          </p>
        </div>

        <div className="newsletter-pullquote">
          "History will judge us by our actions today, not our intentions tomorrow."
        </div>

        <div className="newsletter-divider"></div>

        <footer className="mt-8">
          <h5 className="newsletter-h5">Additional Resources</h5>
          <ul className="newsletter-list text-sm">
            <li>Full transcript of the announcement</li>
            <li>Historical context and precedents</li>
            <li>Expert panel discussion (video)</li>
          </ul>
          
          <h6 className="newsletter-h6">Editorial Note</h6>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This newsletter was generated using SMNB's AI-powered editor with enhanced typography 
            and design systems for optimal readability.
          </p>
        </footer>
      </article>
    </div>
  )
}
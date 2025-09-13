import NewsletterPreview from '@/components/editor/NewsletterPreview'

export default function NewsletterPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Newsletter Design System Preview
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Showcasing the SMNB newsletter typography hierarchy and design specifications
          </p>
        </div>
        
        <NewsletterPreview />
      </div>
    </div>
  )
}
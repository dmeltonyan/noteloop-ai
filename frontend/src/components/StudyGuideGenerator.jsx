import React, { useState } from 'react'
import { BookOpen, Download, Sparkles, FileText, Loader } from 'lucide-react'
import { api } from '../services/api'

export const StudyGuideGenerator = ({ uploadId, concepts, onGenerate }) => {
  const [generating, setGenerating] = useState(false)
  const [studyGuide, setStudyGuide] = useState(null)

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      
      // Call backend API to generate AI-powered study guide
      const result = await api.generateStudyGuide('demo_user_123', uploadId, concepts || [])
      
      if (result.success && result.study_guide) {
        setStudyGuide(result.study_guide)
        onGenerate?.(result.study_guide)
      } else {
        throw new Error(result.message || 'Failed to generate study guide')
      }
    } catch (error) {
      console.error('Failed to generate study guide:', error)
      // Fallback to basic guide if AI generation fails
      const fallbackGuide = {
        title: 'Complete Study Guide',
        sections: concepts?.slice(0, 5).map((c, i) => ({
          title: c.topic_name || `Concept ${i + 1}`,
          summary: c.description || 'Key concept summary',
          keyPoints: [
            'Important point 1',
            'Important point 2',
            'Important point 3'
          ],
          examples: ['Example 1', 'Example 2'],
          studyTips: ['Review this concept daily', 'Practice with related questions']
        })) || []
      }
      setStudyGuide(fallbackGuide)
      onGenerate?.(fallbackGuide)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!studyGuide) return
    
    const content = studyGuide.sections.map(section => 
      `# ${section.title}\n\n${section.summary}\n\n## Key Points\n${section.keyPoints.map(p => `- ${p}`).join('\n')}\n\n## Examples\n${section.examples.map(e => `- ${e}`).join('\n')}\n`
    ).join('\n\n---\n\n')
    
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${studyGuide.title}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="study-guide-generator">
      {!studyGuide ? (
        <div className="guide-prompt">
          <BookOpen size={32} />
          <h3>Generate Study Guide</h3>
          <p>Create a comprehensive study guide from your uploaded content</p>
          <button 
            className="generate-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader className="spinner" size={18} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Guide
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="guide-content">
          <div className="guide-header">
            <h3>{studyGuide.title}</h3>
            <button className="download-btn" onClick={handleDownload}>
              <Download size={18} />
              Download
            </button>
          </div>
          <div className="guide-sections">
            {studyGuide.sections.map((section, i) => (
              <div key={i} className="guide-section">
                <h4>{section.title}</h4>
                <p>{section.summary}</p>
                <div className="key-points">
                  <strong>Key Points:</strong>
                  <ul>
                    {section.keyPoints.map((point, j) => (
                      <li key={j}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="examples">
                  <strong>Examples:</strong>
                  <ul>
                    {section.examples.map((example, j) => (
                      <li key={j}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style>{`
        .study-guide-generator {
          background: linear-gradient(135deg, rgba(26, 29, 43, 0.95) 0%, rgba(37, 40, 56, 0.95) 100%);
          border: 2px solid rgba(74, 144, 226, 0.3);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .guide-prompt {
          text-align: center;
          padding: 2rem;
        }

        .guide-prompt svg {
          color: #4A90E2;
          margin-bottom: 1rem;
        }

        .guide-prompt h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .guide-prompt p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.5rem;
        }

        .generate-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
        }

        .generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .guide-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .guide-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .guide-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: rgba(74, 144, 226, 0.15);
          border: 1px solid rgba(74, 144, 226, 0.3);
          border-radius: 8px;
          color: #4A90E2;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .download-btn:hover {
          background: rgba(74, 144, 226, 0.25);
        }

        .guide-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .guide-section {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border-left: 4px solid #4A90E2;
        }

        .guide-section h4 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.75rem 0;
          font-family: 'Space Grotesk', sans-serif;
        }

        .guide-section p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .key-points, .examples, .study-tips {
          margin-top: 1rem;
        }

        .key-points strong, .examples strong, .study-tips strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #50E3C2;
          font-weight: 600;
        }

        .key-points ul, .examples ul, .study-tips ul {
          margin: 0;
          padding-left: 1.5rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .key-points li, .examples li, .study-tips li {
          margin-bottom: 0.5rem;
        }

        .study-tips strong {
          color: #4A90E2;
        }
      `}</style>
    </div>
  )
}


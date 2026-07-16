import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import AiPanel from '../ai/AiPanel'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export default function PdfViewer({ url, name, searchKeyword, onClose }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showAi, setShowAi] = useState(false)
  const [findingPage, setFindingPage] = useState(false)
  const [pageRefs, setPageRefs] = useState({})
  const containerRef = useRef(null)

  useEffect(() => {
    if (!searchKeyword || !numPages) return
    findPageWithKeyword(searchKeyword)
  }, [searchKeyword, numPages])

  async function findPageWithKeyword(keyword) {
    if (!keyword) return
    setFindingPage(true)
    try {
      const pdf = await pdfjs.getDocument(url).promise
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const text = content.items.map(item => item.str).join(' ').toLowerCase()
        if (text.includes(keyword.toLowerCase())) {
          setPageNumber(i)
          setTimeout(() => {
            const el = pageRefs['page-' + i]
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } else if (containerRef.current) {
              const allPages = containerRef.current.querySelectorAll('[data-page-num]')
              allPages.forEach(p => {
                if (parseInt(p.dataset.pageNum) === i) {
                  p.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              })
            }
          }, 500)
          break
        }
      }
    } catch (e) {
      console.error('Failed to find page:', e)
    }
    setFindingPage(false)
  }

  function setPageRef(num) {
    return (el) => {
      if (el) pageRefs['page-' + num] = el
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function onDocumentLoadError() {
    setError(true)
    setLoading(false)
  }

  function zoomIn() { setScale(s => Math.min(2.5, s + 0.2)) }
  function zoomOut() { setScale(s => Math.max(0.4, s - 0.2)) }

  return (
    <div className="animate-[viewIn_0.35s_ease-out]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onClose} className="px-4 py-2 border border-bdr hover:border-muted/40 rounded-xl text-sm text-muted hover:text-txt transition-all">
          <i className="fa-solid fa-arrow-left mr-2 text-xs"></i>Back
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg font-bold truncate">{name}</h2>
          <p className="text-xs text-muted">{numPages ? numPages + ' pages' : ''}</p>
        </div>
        <button onClick={() => setShowAi(!showAi)}
          className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ' + (showAi ? 'bg-accent text-bg' : 'bg-s2 border border-bdr text-muted hover:text-txt')}>
          <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
          <span className="hidden sm:inline">AI Tools</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 bg-s2 border border-bdr rounded-xl px-4 py-2.5">
        <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-s3 text-muted hover:text-txt transition-colors" title="Zoom out">
          <i className="fa-solid fa-minus text-xs"></i>
        </button>
        <span className="text-sm text-muted w-14 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-s3 text-muted hover:text-txt transition-colors" title="Zoom in">
          <i className="fa-solid fa-plus text-xs"></i>
        </button>
        <div className="flex-1"></div>
        {findingPage && (
          <span className="text-sm text-accent flex items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin text-xs"></i> Finding page...
          </span>
        )}
        <button onClick={() => window.open(url, '_blank')} className="text-sm text-muted hover:text-accent transition-colors" title="Open in new tab">
          <i className="fa-solid fa-up-right-from-square mr-1.5"></i>New Tab
        </button>
      </div>

      {loading && !error && (
        <div className="flex items-center justify-center py-20 text-muted">
          <i className="fa-solid fa-spinner fa-spin mr-3 text-accent"></i> Loading document...
        </div>
      )}

      {error ? (
        <div className="bg-s2 border border-bdr border-dashed rounded-xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-s3 flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-triangle-exclamation text-2xl text-danger/60"></i>
          </div>
          <h3 className="font-display font-semibold mb-2">Unable to preview this PDF</h3>
          <p className="text-muted text-sm mb-5">Try opening it in a new tab instead.</p>
          <button onClick={() => window.open(url, '_blank')} className="px-5 py-2.5 bg-accent hover:bg-accent-l text-bg font-display font-semibold rounded-xl transition-colors text-sm">
            <i className="fa-solid fa-up-right-from-square mr-2"></i>Open in New Tab
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="bg-s2 border border-bdr rounded-xl overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="flex flex-col items-center p-4 gap-4">
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={null}>
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <div key={i} ref={setPageRef(i + 1)} data-page-num={i + 1} className="w-full flex flex-col items-center" style={{ outline: searchKeyword && pageNumber === i + 1 ? '2px solid var(--color-accent)' : 'none', outlineOffset: '-2px', borderRadius: '8px', transition: 'outline 0.5s ease' }}>
                  <div className="text-xs text-muted/40 mb-1">Page {i + 1}</div>
                  <Page pageNumber={i + 1} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
                </div>
              ))}
            </Document>
          </div>
        </div>
      )}

      {showAi && !error && (
        <div className="mt-6">
          <AiPanel url={url} />
        </div>
      )}
    </div>
  )
}
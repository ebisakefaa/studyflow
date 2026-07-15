import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export async function extractTextFromPdf(url) {
  const pdf = await pdfjs.getDocument(url).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map(item => item.str)
    pages.push(strings.join(' '))
  }
  return pages.join('\n\n')
}
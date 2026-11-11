import { notFound } from 'next/navigation'
import Editor from './editor'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Resume wording',
  robots: { index: false, follow: false },
}

export default function DevResumesPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <Editor />
}

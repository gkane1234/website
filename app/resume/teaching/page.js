import ResumeDocument from '../../components/ResumeDocument'
import { buildResume } from '../../data/resume'
import '../resume.css'

export const metadata = {
  title: 'Gabriel Kane — Teaching resume',
  robots: { index: false, follow: false },
}

export default function TeachingResumePage() {
  return <ResumeDocument resume={buildResume('teaching')} />
}

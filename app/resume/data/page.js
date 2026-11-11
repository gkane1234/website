import ResumeDocument from '../../components/ResumeDocument'
import { buildResume } from '../../data/resume'
import '../resume.css'

export const metadata = {
  title: 'Gabriel Kane — Coding resume',
  robots: { index: false, follow: false },
}

export default function CodingResumePage() {
  return <ResumeDocument resume={buildResume('coding')} />
}

import { useParams } from 'react-router-dom'
import { CurriculumView } from '../components/CurriculumView'
import { ProblemEditor } from '../components/ProblemEditor'

export function Learn() {
  const { pathId } = useParams()

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {pathId ? <ProblemEditor /> : <CurriculumView />}
    </main>
  )
}

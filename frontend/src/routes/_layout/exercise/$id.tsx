import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/exercise/$id')({
    component: ExerciseWithId
})

function ExerciseWithId() {
    const { id } = Route.useParams()

    return <div>Hello /_layout/exercise/{id}!</div>
}
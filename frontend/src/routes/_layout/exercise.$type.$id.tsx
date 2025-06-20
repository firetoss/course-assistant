import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/exercise/$type/$id')({
  component: ExerciseDetail,
});

function ExerciseDetail() {
  const { type, id } = Route.useParams();
  return (
    <div>Hello /_layout/exercise/{type}/{id}!</div>
  )
}

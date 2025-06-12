import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/exercise/')({
  component: () => <div>Hello /_layout/exercise/!</div>
})
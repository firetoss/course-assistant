import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/exercise')({
    component: Exercise,
})

function Exercise() {
    return (
        <div>Hello /exercise!</div>
    )
}
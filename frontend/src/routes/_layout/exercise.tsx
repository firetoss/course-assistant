import { createFileRoute } from '@tanstack/react-router'

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute('/_layout/exercise')({
    component: Exercise,
})

function Exercise() {
    return (
        <div>Hello /exercise!</div>
    )
}
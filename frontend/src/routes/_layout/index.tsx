// import { Box, Container, Text } from "@chakra-ui/react"
import { createFileRoute, redirect } from "@tanstack/react-router"

// import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  // component: Dashboard,
  beforeLoad: async () => {
      throw redirect({
        to: "/exercise/algo/0",
      })
  },
})
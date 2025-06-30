import { Box, Container, Text } from "@chakra-ui/react"
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

function Dashboard() {
  // const { user: currentUser } = useAuth()

  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Text fontSize="2xl" truncate maxW="sm">
            {/* 你好，{currentUser?.full_name || currentUser?.email} 👋🏼 */}
            你好，同学 👋🏼
          </Text>
          <Text>欢迎回来，很高兴再次见到你！</Text>
          <Text>左边选择你感兴趣的题目，开始你的学习之旅吧!</Text>
        </Box>
      </Container>
    </>
  )
}
import { Container, Heading, Text } from "@chakra-ui/react"

import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  return (
    <Container maxW="full">
      <Heading size="sm" py={4}>
        注销账号
      </Heading>
      <Text>
        此操作将永久删除你的所有数据和账号相关信息，且无法恢复。
      </Text>
      <DeleteConfirmation />
    </Container>
  )
}
export default DeleteAccount

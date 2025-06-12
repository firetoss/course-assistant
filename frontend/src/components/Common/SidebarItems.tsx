import {
  Portal,
  Box,
  useListCollection,
  Select,
  Flex,
  Text,
} from "@chakra-ui/react"
import { Link as RouterLink } from "@tanstack/react-router"
import { useState } from "react"
// import { useQueryClient } from "@tanstack/react-query"
// import type { UserPublic } from "@/client"

type exerciseType = "react" | "solid" | "vue" | "angular" | "svelte" | "preact"

const exerciseTypeList: { label: string, value: exerciseType }[] = [
  { label: "Python编程题", value: "react" },
  { label: "基础知识单选题", value: "solid" },
  { label: "数据库单选题", value: "vue" },
  { label: "程序算法单选题", value: "angular" },
  { label: "Python单选题", value: "svelte" },
  { label: "流程图单选题", value: "preact" },
]

const exerciseConfigs = {
  react: [
    { name: "Python编程题", value: "react1", route: "/exercise/react1" },
    { name: "Python编程题", value: "react2", route: "/exercise/react2" },
  ],
  solid: [
    { name: "Python编程题", value: "solid1", route: "/exercise" },
    { name: "Python编程题", value: "solid2", route: "/exercise" },
  ],
  vue: [
    { name: "Python编程题", value: "vue1", route: "/exercise" },
    { name: "Python编程题", value: "vue2", route: "/exercise" },
  ],
  angular: [
    { name: "angular1", value: "angular1", route: "/exercise" },
    { name: "angular2", value: "angular2", route: "/exercise" },
  ],
  svelte: [
    { name: "svelte1", value: "svelte1", route: "/exercise" },
    { name: "svelte2", value: "svelte2", route: "/exercise" },
  ],
  preact: [
    { name: "preact1", value: "preact1", route: "/exercise" },
    { name: "preact2", value: "preact2", route: "/exercise" },
  ],
}

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  // const queryClient = useQueryClient()

  const { collection } = useListCollection({
    initialItems: exerciseTypeList,
  })

  const [selectedExerciseType, setSelectedExerciseType] = useState<exerciseType[]>([])

  const exerciseItems = Array.from(
    new Set(
      selectedExerciseType.flatMap(type => exerciseConfigs[type] ?? [])
    )
  )

  return (
    <>
      <Box>
        <Select.Root
          collection={collection}
          size="sm"
          width="290px"
          value={selectedExerciseType}
          onValueChange={(e) => setSelectedExerciseType(e.value as exerciseType[])}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="请选择题目类型" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {collection.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
        <Box mt={3}>
          {/* <SimpleGrid columns={{ base: 1, sm: 1 }} > */}
          {(
            exerciseItems.map((item) => (
              <RouterLink
                key={item.value}
                to={item.route}
                onClick={onClose}>
                <Flex
                  key={item.value}
                  gap={4}
                  px={4}
                  py={2}
                  alignItems="center"
                  fontSize="sm"
                  _hover={{
                    background: "gray.subtle",
                  }}
                >
                  <Text ml={2}>{item.name}</Text>
                </Flex>
              </RouterLink>
            ))
          )}
          {/* </SimpleGrid> */}
        </Box>
      </Box>
    </>
  )
}

export default SidebarItems

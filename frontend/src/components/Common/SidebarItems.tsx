"use client"

import {
  Portal,
  Box,
  useListCollection,
  Select,
  Flex,
  Text,
} from "@chakra-ui/react"
import { Tooltip } from "@/components/ui/tooltip"
import { Link as RouterLink } from "@tanstack/react-router"
import { useState } from "react"
import { useExercisesQuery } from "@/hooks/useExercisesQuery"

const exerciseTypes = ["algo", "code-python", "basic", "sql"] as const

type ExerciseTypes = typeof exerciseTypes[number]

const exerciseTypeLabels: Record<ExerciseTypes, string> = {
  algo: "算法与编程单选题",
  "code-python": "Python程序编写",
  basic: "基础知识单选题",
  sql: "数据库管理单选题",
}

const collectionItems = exerciseTypes.map(type => ({
  label: exerciseTypeLabels[type],
  value: type,
}))


interface SidebarItemsProps {
  onClose?: () => void
}

function TitleToolTip({ title, index }: { title: string, index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip
      open={open}
      positioning={{ placement: "left" }}
      content={title.slice(0, 100) + "..."}
      onOpenChange={({ open }) => setOpen(open)}
    >
      <Text ml={2} truncate>{(index + 1) + ". " + title}</Text>
    </Tooltip>
  )
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const { collection } = useListCollection({
    initialItems: collectionItems,
  })

  const { data: exercises } = useExercisesQuery()

  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseTypes>("algo")

  const currentExercises = exercises?.[selectedExerciseType] ?? []

  return (
    <>
      <Box maxW={300} display="flex" flexDirection="column" height={"100%"}>
        <Box flexShrink={0} py={2}>
          <Select.Root
            collection={collection}
            size="sm"
            width="290px"
            value={[selectedExerciseType]}
            onValueChange={e => setSelectedExerciseType(e.value[0] as ExerciseTypes)}
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
        </Box>
        <Box flex="1" minH={0} overflowY="auto" mt={2}>
          {(
            currentExercises.map((item, index) => (
              <RouterLink
                key={item.route}
                to={item.route}
                onClick={onClose}
                style={{ textDecoration: 'none' }}
              >
                <Flex
                  gap={4}
                  py={3}
                  alignItems="center"
                  fontSize="md"
                  _hover={{
                    background: "gray.subtle",
                  }}
                >
                  <TitleToolTip title={item.question[0]} index={index} />
                </Flex>
              </RouterLink>
            ))
          )}
        </Box>
      </Box >
    </>
  )
}

export default SidebarItems

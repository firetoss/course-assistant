"use client"

import {
  Portal,
  Box,
  useListCollection,
  Select,
  Flex,
  Text,
  HStack,
  SkeletonCircle,
  Stack,
  Skeleton,
} from "@chakra-ui/react"
import { Tooltip } from "@/components/ui/tooltip"
import { Link as RouterLink } from "@tanstack/react-router"
import { useState } from "react"
import { useExercisesQuery } from "@/hooks/useExercisesQuery"

type exerciseType =
  "algo" |
  "code-python" |
  "basic" |
  "sql"

const exerciseTypeList: { label: string, value: exerciseType }[] = [
  { label: "算法与编程单选题", value: "algo" },
  { label: "Python程序编写", value: "code-python" },
  { label: "基础知识单选题", value: "basic" },
  { label: "数据库管理单选题", value: "sql" },
]

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
    initialItems: exerciseTypeList,
  })

  const { data: exercises, isLoading } = useExercisesQuery()

  const [selectedExerciseType, setSelectedExerciseType] = useState<exerciseType[]>([])

  console.log(selectedExerciseType)

  const currentExercies = exercises?.[selectedExerciseType[0]] ?? []

  if (isLoading) {
    return (
      <>
        <Box maxW={300}>
          <HStack gap="5">
            <SkeletonCircle size="12" />
            <Stack flex="1">
              <Skeleton height="5" />
              <Skeleton height="5" width="80%" />
            </Stack>
          </HStack>
        </Box>
      </>)
  }

  return (
    <>
      <Box maxW={300}>
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
          {(
            currentExercies.map((item, index) => (
              <RouterLink
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
      </Box>
    </>
  )
}

export default SidebarItems

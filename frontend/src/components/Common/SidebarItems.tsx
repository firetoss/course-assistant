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
// import { useQueryClient } from "@tanstack/react-query"
// import type { UserPublic } from "@/client"

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
            exerciseItems.map((item, index) => (
              <RouterLink
                to={item.route}
                onClick={onClose}
                style={{ textDecoration: 'none' }}
              >
                <Flex
                  key={index}
                  gap={4}
                  // px={4}
                  py={3}
                  alignItems="center"
                  fontSize="md"
                  _hover={{
                    background: "gray.subtle",
                  }}
                >
                  <TitleToolTip title={item.title} index={index} />
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

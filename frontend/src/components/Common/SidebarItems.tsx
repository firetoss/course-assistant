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
  "mcq" |
  "code" |
  "basics" |
  "db"

const exerciseTypeList: { label: string, value: exerciseType }[] = [
  { label: "算法与编程单选题", value: "mcq" },
  { label: "Python程序编写", value: "code" },
  { label: "基础知识单选题", value: "basics" },
  { label: "数据库管理单选题", value: "db" },
]

const exerciseConfigs = {
  mcq: [
    { type: "mcq", title: "同学们在日常数学学习中，如果遇到一道较为复杂的题目，一般会在认真审清题意的基础上，经过细致的分析推演，得到一个大致的解题思路，再把解题思路进一步细化分解为若干步骤，最后按计划好的步骤一步一步的进行推导和计算，最终完成试题的求解。其实，该思想同样适用于解决日常生活中遇到的问题。日常生活中的问题也需要在实施具体操作前，规划设计好解决问题的步骤，这样不仅能完美的解决问题，还能提高解决问题的效率。例如，骑电动车上学这一生活中的问题，就可以仿照上述思想进行。以下骑电动车上学问题的步骤中，需要在“插入钥匙启动电动车”之后执行的是（  ） ", content: "react1", route: "/exercise/mcq" },
    { type: "mcq", title: "同学们在日常数学学习中，如果遇到一道较为复杂的题目，一般会在认真审清题意的基础上，经过细致的分析推演，得到一个大致的解题思路，再把解题思路进一步细化分解为若干步骤，最后按计划好的步骤一步一步的进行推导和计算，最终完成试题的求解。其实，该思想同样适用于解决日常生活中遇到的问题。日常生活中的问题也需要在实施具体操作前，规划设计好解决问题的步骤，这样不仅能完美的解决问题，还能提高解决问题的效率。例如，骑电动车上学这一生活中的问题，就可以仿照上述思想进行。以下骑电动车上学问题的步骤中，需要在“插入钥匙启动电动车”之后执行的是（  ） ", content: "react1", route: "/exercise/mcq" },
  ],
  code: [
    {
      type: "code", title: `打开素材文件夹中的python\test2.py，在该文件中完成程序。 
一本故事书共120页，红红第一天看了a页，第二天看了b页，编程计算还剩多少页没有看。 
输入 
20
30
注：输入数据包含两行，第一行为a，第二行为b，两个数都为整数 
输出 
70 
注：输出一个整数 。程序为：`, content: "solid1", route: "/exercise/code"
    },
  ],
  basics: [
    { type: "mcq", title: "基础知识选择题（对应知识点）", content: "vue1", route: "/exercise/basics" },
  ],
  db: [
    { type: "mcq", title: "数据库管理题库", content: "angular1", route: "/exercise/db" },
  ],
}

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

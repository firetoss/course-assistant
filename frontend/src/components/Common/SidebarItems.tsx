import { Combobox, Portal, Box, Text, useFilter, useListCollection } from "@chakra-ui/react"
// import { useQueryClient } from "@tanstack/react-query"
// import { Link as RouterLink } from "@tanstack/react-router"
// import type { UserPublic } from "@/client"

// const SidebarItems = ({ onClose }: SidebarItemsProps) => {
const SidebarItems = () => {
  // const queryClient = useQueryClient()
  // const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const { contains } = useFilter({ sensitivity: "base" })

  const frameworks = [
    { label: "React", value: "react" },
    { label: "Solid", value: "solid" },
    { label: "Vue", value: "vue" },
    { label: "Angular", value: "angular" },
    { label: "Svelte", value: "svelte" },
    { label: "Preact", value: "preact" },
    { label: "Qwik", value: "qwik" },
    { label: "Lit", value: "lit" },
    { label: "Alpine.js", value: "alpinejs" },
    { label: "Ember", value: "ember" },
    { label: "Next.js", value: "nextjs" },
  ]

  const { collection, filter } = useListCollection({
    initialItems: frameworks,
    filter: contains,
  })

  return (
    <>
      <Box>
        <Text fontSize="md" px={2} py={2} fontWeight="bold">
          测试题库列表
        </Text>
        <Combobox.Root
          collection={collection}
          onInputValueChange={(e) => filter(e.inputValue)}
          width="320px"
        >
          <Combobox.Control>
            <Combobox.Input placeholder="搜索感兴趣的测试" />
            <Combobox.IndicatorGroup>
              <Combobox.ClearTrigger />
              <Combobox.Trigger />
            </Combobox.IndicatorGroup>
          </Combobox.Control>
          <Portal>
            <Combobox.Positioner>
              <Combobox.Content>
                <Combobox.Empty>未找到对应的测试</Combobox.Empty>
                {collection.items.map((item) => (
                  <Combobox.Item item={item} key={item.value}>
                    {item.label}
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                ))}
              </Combobox.Content>
            </Combobox.Positioner>
          </Portal>
        </Combobox.Root>
      </Box>
    </>
  )
}

export default SidebarItems

import { useExercisesQuery, ExerciseTypes } from '@/hooks/useExercisesQuery';
import { Box, Flex, Button, Text, VStack, Separator, Image } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import {
  useColorModeValue,
} from "@/components/ui/color-mode"
import AceEditor from "react-ace"
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/snippets/python';
import 'ace-builds/src-noconflict/ext-language_tools';

export const Route = createFileRoute('/_layout/exercise/$type/$id')({
  component: ExerciseDetail,
});

function ExerciseDetail() {
  const [selected, setSelected] = useState<number | null>(null);
  const [_, setShowJudge] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [code, setCode] = useState<string>('')
  const clearAll = () => {
    setSelected(null)
    setShowJudge(false)
    setIsCorrect(null)
  }

  const { type, id } = Route.useParams();

  useEffect(() => {
    setIdx(Number(id));
    clearAll()
  }, [id]);

  const [idx, setIdx] = useState(Number(id));

  const { data: exercises } = useExercisesQuery()

  if (!exercises) {
    return <div>题目无效</div>
  }

  const exercise = exercises[type as ExerciseTypes][idx]

  const optionLabels = ["A", "B", "C", "D"]

  const total = exercises[type as ExerciseTypes].length;
  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  const goPrev = () => {
    if (canPrev) {
      setIdx(idx - 1);
      clearAll()
    }
  }
  const goNext = () => {
    if (canNext) {
      if (!canNext) return;
      setIdx(idx + 1);
      clearAll()
    }
  }

  const selectOptions = (i: number) => {
    const selected = optionLabels[i]
    setIsCorrect(selected === Array.from(exercise.answer).join(""))
    setSelected(i)
  }

  return (
    <>
      <Flex
        h="100vh"
        // w="100vw"
        bg={useColorModeValue('gray.100', 'gray.800')}
        overflow="hidden"
      >
        <Box
          h="100%"
          w="100%"
          bg={useColorModeValue("white", "gray.900")}
          borderRadius="0"
          boxShadow="0 8px 40px rgba(66,153,225,0.08),0 1.5px 6px rgba(0,0,0,0.04)"
          p={{ base: 3, md: 10 }}
          pos="relative"
          overflow="hidden"
        >
          {/* 顶部线和题号 */}
          <Box
            position="absolute"
            left={8}
            right={8}
            top={0}
            height="4px"
            borderRadius="6px"
            bgGradient="linear(to-r, teal.300, blue.200)"
            zIndex={1}
            transform="translateY(-50%)"
          />

          <Flex direction={{ base: "column", md: "row" }} h="100%">
            {/* 左侧问题与选项 */}
            <Box
              flex={{ base: "1 1 100%", md: "0 0 60%" }}
              maxW={{ base: "100%", md: "60%" }}
              pr={{ base: 0, md: 8 }}
              borderRight={{ base: "none", md: "1px solid #edf2f7" }}
              mb={{ base: 8, md: 0 }}
              minH={{ base: "50vh", md: "50vh" }}   // 关键：最小高度50%屏幕
              display="flex"
              flexDirection="column"
              justifyContent="flex-start"
              pt={{ base: 6, md: 8 }}
              pb={{ base: 6, md: 8 }}
              overflowY={"auto"}
            >
              {/* 题目标题及描述 */}
              <VStack align="stretch">
                <Text fontSize="2xl" fontWeight="bold" color="teal.700" letterSpacing="wide">
                  题目{idx + 1} / {total}
                </Text>
                <Separator borderColor="gray.300" mb={2} />
                {exercise.question.map((line, i) => {
                  // 拆分出含图片和文字的所有分段
                  const parts = line.split(/(\$\$.+?\$\$)/g);
                  return (
                    <Text
                      as="span"
                      key={i}
                      fontSize="lg"
                      fontWeight="medium"
                      color={useColorModeValue('gray.700', 'gray.100')}
                      whiteSpace="pre-line"
                      lineHeight="2"
                      textAlign="left"
                      wordBreak="break-all"
                      display="block"
                    >
                      {/* 第一行加题号 */}
                      {i === 0 ? `${idx + 1}. ` : ''}
                      {
                        parts.map((part) => {
                          const match = part.match(/^\$\$(.+?)\$\$/);
                          if (match) {
                            return (
                              <Image
                                key={`img-${i}`}
                                src={import.meta.env.VITE_API_URL + "/api/v1/pic/" + match[1].replace("app/exercise-pic//", "")}
                                alt={`题图${i + 1}`}
                                maxH="200px"
                                display="inline-block"
                                verticalAlign="middle"
                                mx={1}
                              />
                            );
                          }
                          return part;
                        })
                      }
                    </Text>
                  );
                })}
              </VStack>

              {/* 选项列表 */}
              {exercise.category !== "code" ? (
                <VStack align="stretch" mt={5}>
                  {exercise.options.map((opt, i) => (
                    <Flex
                      as="button"
                      key={i}
                      onClick={() => selectOptions(i)}
                      bg={selected === i ? "#20B2AA" : "white"}
                      border="2px solid"
                      borderColor={selected === i ? "#20B2AA" : "#BBF4EC"}
                      borderRadius="2xl"
                      w="100%"
                      minH="64px"
                      cursor="pointer"
                      align="center"
                      px={0}
                      py={0}
                      transition="all 0.16s"
                      _hover={{
                        borderColor: "#20B2AA",
                        bg: selected === i ? "#149689" : "#F7FCFB",
                      }}
                      _active={{
                        bg: selected === i ? "#138378" : "#ECFDFB"
                      }}
                      overflow="hidden"
                      whiteSpace="normal"
                    >
                      {/* 编号区 */}
                      <Flex
                        align="center"
                        justify="center"
                        minW="2.7em"
                        height="100%"
                        bg="transparent"
                        ml={6}
                        mr={3}
                        flexShrink={0}
                      >
                        <Text
                          fontWeight="bold"
                          fontSize="2xl"
                          color={selected === i ? "white" : "gray.700"}
                          letterSpacing="wide"
                          pointerEvents="none"
                        >
                          {optionLabels[i]}.
                        </Text>
                      </Flex>
                      {/* 右侧内容 */}
                      <Text
                        color={selected === i ? "white" : "gray.700"}
                        fontWeight={selected === i ? "bold" : "medium"}
                        fontSize="md"
                        fontFamily="inherit"
                        pr={6}
                        py={4}
                        lineHeight="2"
                        textAlign="left"
                        whiteSpace="pre-line"
                        wordBreak="break-word"
                        flex="1"
                        pointerEvents="none"
                      >
                        {opt}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <Box mt={6} p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" color="teal.600" mb={2}>
                    请在下方输入你的代码：
                  </Text>
                  <AceEditor
                    mode="python"
                    name="code-editor"
                    fontSize={16}
                    width="100%"
                    height="240px"
                    value={code}
                    onChange={(v) => setCode(v)}
                    setOptions={{
                      enableBasicAutocompletion: true,
                      enableLiveAutocompletion: true,
                      enableSnippets: true,
                      showPrintMargin: false,
                      showLineNumbers: true,
                      tabSize: 4,
                    }}
                    editorProps={{
                      $blockScrolling: true,
                    }}
                  />
                </Box>
              )}
              {/* 底部选择与翻页 */}
              <Flex
                align="center"
                justify="space-between"
                gap={3}
                w="100%"
                pt={6}
              >
                <Button
                  onClick={goPrev}
                  disabled={!canPrev}
                  colorScheme="teal"
                  variant="solid"
                  borderRadius="full"
                  fontWeight="bold"
                  size="lg"
                  opacity={canPrev ? 1 : 0.4}
                  minW={28}
                  boxShadow="sm"
                >
                  上一题
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!canNext}
                  colorScheme="teal"
                  variant="solid"
                  borderRadius="full"
                  fontWeight="bold"
                  size="lg"
                  opacity={canNext ? 1 : 0.4}
                  minW={28}
                  boxShadow="sm"
                >
                  下一题
                </Button>
              </Flex>
            </Box>

            {/* 右侧答题反馈与解析 */}
            {exercise.category !== "code" ? (
              <Box
                flex={{ base: "1 1 100%", md: "0 0 40%" }}
                maxW={{ base: "100%", md: "40%" }}
                pl={{ base: 0, md: 8 }}
                pt={{ base: 0, md: 2 }}
                minH="320px"
                overflowY={"auto"}
              >
                {/* 判断结果 */}
                <Text
                  fontWeight="bold"
                  fontSize="2xl"
                  color={isCorrect == null ? "gray.400" : isCorrect ? "green.500" : "red.500"}
                  mb={3}
                >
                  {isCorrect == null ? "" : (isCorrect ? "√ 回答正确" : "× 回答错误")}
                </Text>

                {isCorrect !== null && (
                  <Text
                    fontWeight="bold"
                    fontSize="2xl"
                    color="gray.400"
                    mb={3}
                  >
                    您的选择：{optionLabels[selected ?? -1]}
                  </Text>
                )}

                {isCorrect !== null && isCorrect && (
                  <Text
                    fontWeight="bold"
                    fontSize="2xl"
                    color={"gray.400"}
                    mb={3}
                  >
                    正确答案：{Array.from(exercise.answer).join('')}
                  </Text>
                )}

                {/* 解析 */}
                <Box mt={isCorrect == null ? 0 : 6} bg={useColorModeValue("gray.50", "gray.800")} borderRadius="lg" p={5}>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>题目解析</Text>
                  <Text fontSize="md" color="gray.700">{"暂无解析"}</Text>
                </Box>
              </Box>
            ): (<></>)}
          </Flex>
        </Box>
      </Flex>
    </>
  )
}

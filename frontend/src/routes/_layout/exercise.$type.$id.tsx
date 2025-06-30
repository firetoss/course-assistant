import { useExercisesQuery, ExerciseTypes } from '@/hooks/useExercisesQuery'
import { Box, Flex, Button, Text, VStack, Separator, Image, HStack, Alert, Link, Icon, Center, Spinner, Input } from '@chakra-ui/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  useColorModeValue,
} from "@/components/ui/color-mode"
import { AiOutlineQuestionCircle } from "react-icons/ai"
import useCustomToast from "@/hooks/useCustomToast"
import AceEditor from "react-ace"
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/snippets/python'
import 'ace-builds/src-noconflict/ext-language_tools'
import { PyRunner, PyRunnerHandle } from "../../components/PyRunner";
import { streamFetch, MessageContent } from '../../utils/streamFetch'
import ReactMarkdown from 'react-markdown'

export const Route = createFileRoute('/_layout/exercise/$type/$id')({
  component: ExerciseDetail,
});

type OutItem = { text: string; type: "stdout" | "stderr" | "input" };

function ExerciseDetail() {
  const [selected, setSelected] = useState<number | null>(null)
  const [_, setShowJudge] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [code, setCode] = useState<string>('')
  const getCacheKey = (type: string, exerciseId: string) => `ex_${type}_${exerciseId}`
  const { showSuccessToast } = useCustomToast()
  const { type, id } = Route.useParams()
  const idx = Number(id)

  useEffect(() => {
    handleClear()
    // 代码缓存
    const cacheKey = getCacheKey(type, id!);
    const cachedCode = localStorage.getItem(cacheKey);
    if (cachedCode !== null) {
      setCode(cachedCode);
    } else {
      setCode("");
    }
  }, [id]);

  const navigate = useNavigate();

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
    if (idx > 0) navigate({ to: `/exercise/${type}/${idx - 1}` })
  }
  const goNext = () => {
    if (idx < total - 1) navigate({ to: `/exercise/${type}/${idx + 1}` })
  }

  const pyRef = useRef<PyRunnerHandle>(null);
  const [output, setOutput] = useState<OutItem[]>([]);
  const [waitingInput, setWaitingInput] = useState<null | {
    prompt: string,
    respond: (v: string) => void
  }>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleOutput = (text: string, type: "stdout" | "stderr" | "input") => {
    setOutput(o => [...o, { text, type }]);
  };

  // 处理 input 请求
  const handleInputRequest = (prompt: string, respond: (v: string) => void) => {
    setWaitingInput({ prompt, respond });
  };

  const handleRun = async () => {
    setOutput([]);
    setIsSuccess(null);
    const res = await pyRef.current?.runCode(code);
    setIsSuccess(res?.success ?? false);
  };

  const finalStr = output
    .filter(o => o.type === "stdout" || o.type === "stderr")
    .map(o => o.text)
    .join(""); // 或 '\n' 看你喜欢

  // 保存
  const handleSave = () => {
    const cacheKey = getCacheKey(type, id);
    localStorage.setItem(cacheKey, code);
    showSuccessToast("代码已保存！");
  };

  const selectOptions = (i: number) => {
    const selected = optionLabels[i]
    setIsCorrect(selected === Array.from(exercise.answer).join(""))
    setSelected(i)
  }

  const removeCodeCache = () => {
    setCode("")
    const cacheKey = getCacheKey(type, id);
    localStorage.removeItem(cacheKey);
    showSuccessToast("你的代码已清空！");
  }

  const handleClear = () => {
    setSelected(null)
    setShowJudge(false)
    setIsCorrect(null)
    setCode("")
    handleStop()
    setParsing(false)
    setExplanation("")
    setOutput([])
    setIsSuccess(null)
  }

  const [parsing, setParsing] = useState(false)
  const [explanation, setExplanation] = useState("")

  const controllerRef = useRef<AbortController | null>(null);

  function askLLM() {
    setParsing(true);
    setExplanation("");
    controllerRef.current = new AbortController();

    const sysPrompt = `你是一名有丰富经验的高中计算机教师。请阅读我提供的试题内容和/或程序运行时遇到的错误提示，按照以下格式进行详细解读：
* 试题解读：简明扼要地分析试题考点、解题思路和需要注意的知识点。
请选择准确、具象的表达方式，避免过于抽象的专业术语。`;

    const usrPrompt = `
##题目##
${exercise.question.join("\n")}
##题目类别##
${exercise.category}
##注意##
* 忽略题目中$$...$$部分的内容
* 忽略图片内容
* 题目类别中single是单选题，python代表是python编程题，如果是python编程题，需要给出题目python相关知识点提示
`;

    const content: MessageContent[] = [
      { type: "text", text: usrPrompt },
    ];

    const messages = [
      { role: "system", content: sysPrompt },
      { role: "user", content: content },
    ];

    streamFetch({
      messages,
      signal: controllerRef.current.signal,
      onMessage: (data) => {
        // 按流式接口格式获取每一段内容，追加渲染
        let text = '';
        if (data.choices && data.choices[0]) {
          text = data.choices[0].delta?.content || data.choices[0].message?.content || '';
        } else if (data.data) {
          text = data.data;
        } else if (data.content) {
          text = data.content;
        }

        if (text) setExplanation((prev) => prev + text);
      },
      onError: (err) => {
        setExplanation('[出错] ' + (err.message || String(err)));
        setParsing(false);
      },
      onFinish: () => {
        setParsing(false);
      },
    });
  }

  function handleStop() {
    setParsing(false);
    setExplanation("")
    if (controllerRef.current) controllerRef.current.abort();
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
                  <Text fontSize={16} fontWeight="bold" color="teal.600" mb={2}>
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
                  <PyRunner
                    ref={pyRef}
                    onOutput={handleOutput}
                    onInputRequest={handleInputRequest}
                  />
                  {waitingInput && (
                    <HStack>
                      <Text fontWeight="bold" color="teal.600">
                        {waitingInput.prompt}
                      </Text>
                      <Input
                        placeholder="请输入…"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            waitingInput.respond(e.currentTarget.value);
                            setWaitingInput(null);
                          }
                        }}
                        bg="white"
                        maxW="240px"
                      />
                    </HStack>
                  )}
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
                {exercise.category === "code" ? (
                  <HStack mt={0}>
                    <Button colorScheme="teal" onClick={handleSave}>
                      保存
                    </Button>
                    <Button colorScheme="teal" onClick={handleRun}>
                      运行
                    </Button>
                    <Button colorScheme="teal" onClick={removeCodeCache}>
                      清空
                    </Button>
                    {/* <Button colorScheme="teal" onClick={handleShowAnalysis}>
                      解析
                    </Button> */}
                  </HStack>
                ) : (<></>)}

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
            <Box
              flex={{ base: "1 1 100%", md: "0 0 40%" }}
              maxW={{ base: "100%", md: "40%" }}
              pl={{ base: 0, md: 8 }}
              pt={{ base: 0, md: 2 }}
              minH="320px"
              overflowY={"auto"}
            >
              {/* 判断结果 */}
              {exercise.category !== "code" ? (
                <>
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
                </>
              ) : (
                <>
                  {isSuccess === null ? null : (
                    <Alert.Root variant={"surface"} mb={3} colorPalette={isSuccess ? "teal" : "red"}>
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>{isSuccess ? "运行成功" : "运行失败"}</Alert.Title>
                        <Alert.Description>
                          {isSuccess ? `输出结果：${finalStr}` : finalStr}
                        </Alert.Description>
                      </Alert.Content>
                    </Alert.Root>
                  )}
                </>
              )}
              {/* 解析 */}
              <Box
                mt={6}
                bg="white"
                borderRadius="lg"
                p={7}
                boxShadow="md"
                border="1.5px solid"
                borderColor={"gray.200"}
                minH="120px"
                userSelect="text"
                position="relative"
              >
                {/* 标题行 */}
                <HStack mb={3}>
                  <Text fontSize="xl" fontWeight="bold" color={"gray.800"} letterSpacing="0.5px">
                    题目解析
                  </Text>
                  <HStack ml="auto">
                    <Icon as={AiOutlineQuestionCircle} color={"teal.500"} boxSize={5} />
                    <Link
                      color={"teal.500"}
                      fontWeight="medium"
                      fontSize="md"
                      _hover={{ color: "teal.600", textDecoration: "underline" }}
                      cursor={parsing ? "not-allowed" : "pointer"}
                      onClick={parsing ? handleStop : askLLM}
                    >
                      问问大模型
                    </Link>
                  </HStack>
                </HStack>
                <VStack align="start" pt={1}>
                  {parsing && explanation === '' ? (
                    <Center w="100%" minH="60px">
                      <Spinner size="lg" color="blue.400" />
                      <Text ml={4} color="gray.500">正在加载，请稍后…</Text>
                    </Center>
                  ) : explanation ? (
                    <Box
                      fontSize="md"
                      color="gray.800"
                      fontFamily="SFMono-Regular,Menlo,Monaco,Consolas,monospace"
                    >
                      <ReactMarkdown>
                        {explanation}
                      </ReactMarkdown>
                    </Box>
                  ) : (
                    <Text
                      fontSize="md"
                      color="gray.500"
                      whiteSpace="pre-wrap"
                    >
                      暂无解析，可点击右上角“问问大模型”试试~
                    </Text>
                  )}
                </VStack>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </>
  )
}

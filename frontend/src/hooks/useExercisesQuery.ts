import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { ExercisesPublic, ExercisesService } from "@/client"

const exerciseTypes = ["algo", "code-python", "basic", "sql"] as const;

export type ExerciseTypes = typeof exerciseTypes[number]

interface Exercise {
    category: string
    question: string[] //文字和图片混合
    options: string[]
    answer: string[]
    route: string
}

type Exercises = {
    [key in ExerciseTypes]: Exercise[]
}

const processExercises = (rawList: ExercisesPublic): Exercises => {
    const initialData: Exercises = exerciseTypes.reduce((acc, type) => {
        acc[type] = [];
        return acc;
    }, {} as Exercises);

    rawList.data.forEach((item) => {
        const type = item.type.trim() as ExerciseTypes;
        try {
            // 如果 type 是合法的类型值
            if (exerciseTypes.includes(type)) {
                const exercise: Exercise = {
                    category: item.category.trim(),
                    question: JSON.parse(item.question ?? "[]".trim()),
                    options: JSON.parse(item.options ?? "[]".trim()),
                    answer: JSON.parse(item.answer ?? "[]".trim()).join(""),
                    route: `/exercise/${type}`,
                };
                initialData[type].push(exercise);
            }
            else {
                throw new Error(`未知试题类型：${type}`)
            }
        } catch (error) {
            console.log(error)
        }
    });

    Object.entries(initialData).forEach(([_, exercises]) => {
        exercises.forEach((exercise, idx) => {
            exercise.route = exercise.route + "/" + idx
        })
    })

    return initialData;
}

export const useExercisesQuery = (
    options?: Omit<UseQueryOptions<Exercises>, "queryKey" | "queryFn">
) => {
    return useQuery<Exercises>({
        queryKey: ["exercises"],
        queryFn: async () => {
            const res = await ExercisesService.readItems()
            return processExercises(res)
        },
        staleTime: 1000 * 10,
        refetchInterval: 5 * 1000,
        ...options,
    })
}
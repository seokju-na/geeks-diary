type AsyncIterator<T> = (item: T, index: number) => Promise<void>;

export async function asyncForEach<T>(items: Array<T>, asyncIterator: AsyncIterator<T>): Promise<Array<AsyncIterator<T>>> {
    const asyncTasks = [];

    items.forEach((item: T, idx: number) => {
        asyncTasks.push(asyncIterator(item, idx));
    });

    return asyncTasks;
}

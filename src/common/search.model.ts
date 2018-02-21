interface SearchResult<T> {
    score: number;
    value: T;
}

type SearchScoringStrategy<T> = (item: T, query: string) => boolean;


export class SearchModel<T> {
    private scoringStrategies: {
        score: number,
        strategy: SearchScoringStrategy<T>,
    }[] = [];

    setScoringStrategy(score: number, strategy: SearchScoringStrategy<T>): this {
        this.scoringStrategies.push({ score, strategy });
        return this;
    }

    search(list: T[], query: string): T[] {
        const result: SearchResult<T>[] = [];

        for (const item of list) {
            const score = this.getItemScore(item, query);

            if (score > 0) {
                result.push({ score, value: item });
            }
        }

        this.sortResultWithScore(result);

        return result.map(r => r.value);
    }

    private getItemScore(item: T, query: string): number {
        let score = 0;

        this.scoringStrategies.forEach((scoring) => {
            if (scoring.strategy(item, query)) {
                score += scoring.score;
            }
        });

        return score;
    }

    private sortResultWithScore(result: SearchResult<T>[]): void {
        result.sort((a, b) => {
            if (a.score > b.score) {
                return -1;
            } else if (a.score < b.score) {
                return 1;
            }
            return 0;
        });
    }
}

import { TypeScriptTokenizer } from '@/components/pages/editor/vscode-editor/custom-extensions/providers/completion/typescript-tokenizer';

// Interface for weighted tokens
interface WeightedToken {
  token: string;
  weight: number;
}

export class FixedWindowJaccardMatcher {
  private readonly windowSize: number = 60;
  private readonly tokenizer: TypeScriptTokenizer;

  constructor(private referenceContent: string) {
    this.tokenizer = new TypeScriptTokenizer();
  }

  public findBestSnippet(content: string): { snippet: string; similarity: number } {
    const windows = this.createWindows(content);
    let bestSnippet = '';
    let bestSimilarity = 0;

    const referenceTokens = this.tokenizer.tokenize(this.referenceContent);

    for (const window of windows) {
      const windowTokens = this.tokenizer.tokenize(window);
      const similarity = this.calculateWeightedJaccardSimilarity(referenceTokens, windowTokens);

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestSnippet = window;
      }
    }

    return { snippet: bestSnippet, similarity: bestSimilarity };
  }

  private createWindows(content: string): string[] {
    const lines = content.split('\n');
    const windows: string[] = [];

    for (let i = 0; i <= Math.max(0, lines.length - this.windowSize); i++) {
      windows.push(lines.slice(i, i + this.windowSize).join('\n'));
    }

    return windows;
  }

  private calculateWeightedJaccardSimilarity(
    set1: Set<WeightedToken>,
    set2: Set<WeightedToken>
  ): number {
    let intersectionWeight = 0;
    let unionWeight = 0;

    // Calculate weighted union and intersection
    const allTokens = new Set([
      ...Array.from(set1).map(wt => wt.token),
      ...Array.from(set2).map(wt => wt.token)
    ]);

    for (const token of allTokens) {
      const token1 = Array.from(set1).find(wt => wt.token === token);
      const token2 = Array.from(set2).find(wt => wt.token === token);

      if (token1 && token2) {
        intersectionWeight += Math.min(token1.weight, token2.weight);
        unionWeight += Math.max(token1.weight, token2.weight);
      } else if (token1) {
        unionWeight += token1.weight;
      } else if (token2) {
        unionWeight += token2.weight;
      }
    }

    return unionWeight === 0 ? 0 : intersectionWeight / unionWeight;
  }
}
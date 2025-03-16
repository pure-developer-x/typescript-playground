import { PromptElement, PromptElementKind, ProcessedPrompt, PromptElementRange } from "@/components/pages/editor/vscode-editor/custom-extensions/providers/advanced-ai-completion-provider";

// Prompt generation and management
export class PromptWishlist {
  private elements: PromptElement[] = [];
  private readonly maxPromptTokens: number = 2048; // Maximum total tokens
  private remainingTokens: number;

  constructor() {
    this.remainingTokens = this.maxPromptTokens;
  }

  public add(kind: PromptElementKind, content: string, priority: number): void {
    this.elements.push({ kind, content, priority });
  }

  public fulfill(): ProcessedPrompt {
    // Sort by priority and trim to token budget
    this.elements.sort((a, b) => b.priority - a.priority);

    let prefix = '';
    const ranges: PromptElementRange[] = [];
    let currentPosition = 0;

    for (const element of this.elements) {
      // Simple token count estimation (you might want to use a proper tokenizer)
      const estimatedTokens = element.content.length / 4;
      if (estimatedTokens > this.remainingTokens) {
        continue;
      }

      const start = currentPosition;
      prefix += element.content;
      currentPosition = prefix.length;

      ranges.push({
        kind: element.kind,
        start,
        end: currentPosition
      });

      this.remainingTokens -= estimatedTokens;
      if (this.remainingTokens <= 0) break;
    }

    return {
      prefix,
      suffix: '', // Will be filled later
      promptElementRanges: ranges,
      isFimEnabled: true
    };
  }
}

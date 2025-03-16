import { tableResourceAtoms } from '@/atoms/api/resources';
import { variableResourceAtoms } from '@/atoms/api/variable-resource';
import { FixedWindowJaccardMatcher } from '@/components/pages/editor/vscode-editor/custom-extensions/providers/completion/fixed-window-jaccard-matcher';
import { PromptWishlist } from '@/components/pages/editor/vscode-editor/custom-extensions/providers/completion/prompt-wishlist';
import { RateLimiter } from '@/components/pages/editor/vscode-editor/custom-extensions/providers/completion/rate-limiter';
import { PureFile } from '@/lib/pure-file';
import { selectRoutePrompt } from '@/lib/selectors/prompt-selectors';
import { getDefaultStore } from 'jotai';
import * as vscode from 'vscode';

// Types for prompt elements
export type PromptElementKind = 'PathMarker' | 'SimilarFile' | 'BeforeCursor' | 'AfterCursor' | 'ImportedFile' | 'LanguageMarker';

export interface PromptElement {
  kind: PromptElementKind;
  content: string;
  priority: number;
}

export interface PromptElementRange {
  kind: PromptElementKind;
  start: number;
  end: number;
}

export interface ProcessedPrompt {
  prefix: string;
  suffix: string;
  promptElementRanges: PromptElementRange[];
  isFimEnabled: boolean;
}



// Main provider class
export class AdvancedInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private debounceTimeout: NodeJS.Timeout | undefined;
  private readonly rateLimiter = new RateLimiter();
  private readonly debounceTime = 300;
  private readonly contextualFilterWeights = {
    // Sample weights based on the description from the article
    typescript: 0.7,
    openingBrace: 0.932,
    closingBrace: -0.999,
    openingBracket: 0.049,
    closingBracket: -0.970
  };

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | null> {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    return new Promise((resolve) => {
      this.debounceTimeout = setTimeout(async () => {
        try {
          const prompt = await this.generatePrompt(document, position);

          if (!this.shouldMakeRequest(prompt, document, position)) {
            resolve(null);
            return;
          }
          const { prefix, suffix } = prompt;

          // Use rate limiter for API calls
          const completions = await this.rateLimiter.enqueue(() =>
            this.fetchCompletions(prefix, suffix)
          );
          console.log('Completions:', completions);

          if (!completions || token.isCancellationRequested) {
            resolve(null);
            return;
          }

          const items = completions.map(completion =>
            new vscode.InlineCompletionItem(
              completion,
              new vscode.Range(position, position)
            )
          );

          resolve(items);
        } catch (error) {
          console.error('Error providing completions:', error);
          resolve(null);
        }
      }, this.debounceTime);
    });
  }

  private to_path(uri: vscode.Uri): string {
    const { func, route } = PureFile.to_context(uri);
    return func?.type === 'handler' ? `Route: ${route?.method} ${route?.path}` : `Function: ${func?.name}`;
  }

  private async generatePrompt(document: vscode.TextDocument, position: vscode.Position): Promise<ProcessedPrompt> {
    const wishlist = new PromptWishlist();

    // Add path marker

    wishlist.add('PathMarker', `# Path: ${this.to_path(document.uri)}\n`, 100);

    // Add language marker
    wishlist.add('LanguageMarker', `# Language: ${document.languageId}\n`, 90);

    // Add similar files
    const { func, route } = PureFile.to_context(document.uri);
    if (func && route) {
      const store = getDefaultStore();
      const tables = store.get(tableResourceAtoms.fetch).data || [];
      const variables = store.get(variableResourceAtoms.fetch).data || [];
      const prompt = selectRoutePrompt({ function: func, route, tables, variables });
      wishlist.add('SimilarFile', prompt, 80);
    }

    const files = await this.findSimilarFiles(document, position);
    files.forEach(file => wishlist.add('SimilarFile', file.snippet, 80));

    // Add before cursor content
    const beforeCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    wishlist.add('BeforeCursor', beforeCursor, 70);

    // Add after cursor content
    const afterCursor = document.getText(new vscode.Range(position, document.lineAt(document.lineCount - 1).range.end));

    const prompt = wishlist.fulfill();
    prompt.suffix = afterCursor;

    return prompt;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async findSimilarFiles(document: vscode.TextDocument, _position: vscode.Position): Promise<Array<{ path: string; snippet: string }>> {
    const matcher = new FixedWindowJaccardMatcher(document.getText());
    const similarFiles: Array<{ path: string; snippet: string }> = [];


    // Get recently accessed files of the same language
    const files = await vscode.workspace.findFiles(
      `**/*.{ts}`,
      '**/node_modules/**',
      20
    );

    for (const file of files) {
      if (file.fsPath === document.uri.fsPath) continue;

      try {
        const content = (await vscode.workspace.fs.readFile(file)).toString();
        const { snippet, similarity } = matcher.findBestSnippet(content);

        if (similarity > 0.3) { // Threshold for similarity
          similarFiles.push({
            path: this.to_path(file),
            snippet
          });
        }
      } catch (error) {
        console.error(`Error reading file ${file.fsPath}:`, error);
      }
    }

    return similarFiles;
  }

  private shouldMakeRequest(prompt: ProcessedPrompt, document: vscode.TextDocument, position: vscode.Position): boolean {
    // Basic checks
    // const lineText = document.lineAt(position.line).text;
    const wordRange = document.getWordRangeAtPosition(position);
    if (wordRange && position.character < wordRange.end.character) {
      return false;
    }

    // Calculate contextual filter score
    const score = this.calculateContextualFilterScore(document, prompt);
    return score > 0.15; // 15% threshold as mentioned in the article
  }

  private calculateContextualFilterScore(document: vscode.TextDocument, prompt: ProcessedPrompt): number {
    let score = 0;

    // Language weight
    score += this.contextualFilterWeights[document.languageId as never] || 0.5;

    // Last character weight
    const lastChar = prompt.prefix.charAt(prompt.prefix.length - 1);
    if (lastChar === '(') score += this.contextualFilterWeights.openingBrace;
    if (lastChar === ')') score += this.contextualFilterWeights.closingBrace;
    if (lastChar === '[') score += this.contextualFilterWeights.openingBracket;
    if (lastChar === ']') score += this.contextualFilterWeights.closingBracket;

    // Normalize score to 0-1 range
    return Math.max(0, Math.min(1, (score + 1) / 2));
  }

  private async fetchCompletions(prefix: string, suffix: string): Promise<string[] | null> {
    try {
      const response = await fetch("https://api.mistral.ai/v1/fim/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer yqrrtarn5Z8MUTy5IQHBnMXHBkT8Qcci`,
        },
        body: JSON.stringify({
          model: "codestral-latest",
          prompt: prefix,
          suffix: suffix,
          max_tokens: 100,
          temperature: 0.2,
          stop: [suffix],
          n: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.map((choice: { message?: { content?: string } }) => choice?.message?.content) || null;
    } catch (error) {
      console.error('Error fetching completions:', error);
      return null;
    }
  }
}
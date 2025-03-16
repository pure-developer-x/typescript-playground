import { Project, Node, SyntaxKind, FunctionDeclaration, ClassDeclaration, InterfaceDeclaration, MethodDeclaration, PropertyDeclaration, ImportDeclaration } from 'ts-morph';

/**
 * Represents a token with its associated weight
 */
interface WeightedToken {
  token: string;
  weight: number;
}

/**
 * Cache entry for storing tokenization results
 */
interface TokenCache {
  tokens: Set<WeightedToken>;
  timestamp: number;
}

/**
 * Analyzes TypeScript code and extracts weighted tokens based on AST nodes
 */
export class TypeScriptTokenizer {
  // Project instance for parsing TypeScript
  private project: Project;

  // Cache for storing tokenization results
  private static readonly cache = new Map<string, TokenCache>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Set to track processed nodes and prevent infinite loops
  private processedNodes = new Set<number>();

  // Weights for different types of nodes
  private readonly nodeWeights = new Map<SyntaxKind, number>([
    [SyntaxKind.FunctionDeclaration, 2.0],  // Higher weight for important declarations
    [SyntaxKind.ClassDeclaration, 2.0],
    [SyntaxKind.InterfaceDeclaration, 2.0],
    [SyntaxKind.MethodDeclaration, 1.8],
    [SyntaxKind.PropertyDeclaration, 1.5],
    [SyntaxKind.Parameter, 1.2],
    [SyntaxKind.ImportDeclaration, 1.2],
    [SyntaxKind.Identifier, 1.0],           // Base weight for simple identifiers
    [SyntaxKind.StringLiteral, 0.8],        // Lower weight for literals
  ]);

  constructor() {
    // Initialize ts-morph project with necessary settings
    this.project = new Project({
      useInMemoryFileSystem: true,
      skipFileDependencyResolution: true,
      compilerOptions: {
        allowJs: true,
        jsx: 4,
        strict: true,
      }
    });
  }

  /**
   * Main entry point for tokenizing TypeScript code
   */
  public tokenize(code: string): Set<WeightedToken> {
    // Generate cache key based on code content
    const cacheKey = this.createCacheKey(code);

    // Check cache for existing tokens
    const cached = TypeScriptTokenizer.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TypeScriptTokenizer.CACHE_TTL) {
      return cached.tokens;
    }

    // Reset processed nodes for new tokenization
    this.processedNodes.clear();

    try {
      const tokens = new Set<WeightedToken>();
      const sourceFile = this.project.createSourceFile('temp.ts', code);

      // Process the entire source file
      this.extractTokensFromNode(sourceFile, tokens);

      // Cleanup
      this.project.removeSourceFile(sourceFile);

      // Cache results
      TypeScriptTokenizer.cache.set(cacheKey, {
        tokens,
        timestamp: Date.now()
      });

      return tokens;
    } catch (error) {
      console.error('Error tokenizing TypeScript:', error);
      return new Set();
    }
  }

  /**
   * Creates a cache key for the given code
   */
  private createCacheKey(code: string): string {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Recursively extracts tokens from AST nodes
   */
  private extractTokensFromNode(node: Node, tokens: Set<WeightedToken>): void {
    const nodeId = node.getPos();

    // Prevent processing the same node twice
    if (this.processedNodes.has(nodeId) || this.shouldSkipNode(node)) {
      return;
    }

    this.processedNodes.add(nodeId);
    const weight = this.nodeWeights.get(node.getKind()) || 1.0;

    try {
      // Process node based on its kind
      const newTokens = this.processNodeByKind(node, weight);
      newTokens.forEach(token => tokens.add(token));

      // Process child nodes
      const children = node.getChildren();
      for (const child of children) {
        if (!this.processedNodes.has(child.getPos())) {
          this.extractTokensFromNode(child, tokens);
        }
      }
    } catch (error) {
      console.error(`Error processing node of kind ${SyntaxKind[node.getKind()]}:`, error);
    }
  }

  /**
   * Routes node processing based on node kind
   */
  private processNodeByKind(node: Node, weight: number): WeightedToken[] {
    switch (node.getKind()) {
      case SyntaxKind.Identifier:
        return this.processIdentifier(node, weight);
      case SyntaxKind.FunctionDeclaration:
        return this.processFunctionDeclaration(node as FunctionDeclaration, weight);
      case SyntaxKind.ClassDeclaration:
        return this.processClassDeclaration(node as ClassDeclaration, weight);
      case SyntaxKind.InterfaceDeclaration:
        return this.processInterfaceDeclaration(node as InterfaceDeclaration, weight);
      case SyntaxKind.MethodDeclaration:
        return this.processMethodDeclaration(node as MethodDeclaration, weight);
      case SyntaxKind.PropertyDeclaration:
        return this.processPropertyDeclaration(node as PropertyDeclaration, weight);
      case SyntaxKind.ImportDeclaration:
        return this.processImportDeclaration(node as ImportDeclaration, weight);
      default:
        return [];
    }
  }

  /**
   * Processes identifier nodes
   */
  private processIdentifier(node: Node, weight: number): WeightedToken[] {
    const tokens: WeightedToken[] = [];
    const text = node.getText();

    // Add the full identifier
    tokens.push(this.createToken(text, weight));

    // Add camelCase/PascalCase parts
    const parts = text.split(/(?=[A-Z])|_/);
    parts.forEach(part => {
      if (part.length > 2) {
        tokens.push(this.createToken(part, weight * 0.6));
      }
    });

    return tokens;
  }

  /**
   * Processes function declarations
   */
  private processFunctionDeclaration(node: FunctionDeclaration, weight: number): WeightedToken[] {
    const tokens: WeightedToken[] = [];
    const name = node.getName();

    if (name) {
      tokens.push(this.createToken(`func_${name}`, weight));

      // Process parameters
      node.getParameters().forEach(param => {
        const paramName = param.getName();
        const typeNode = param.getTypeNode();
        if (typeNode) {
          tokens.push(this.createToken(
            `param_${paramName}_${typeNode.getText()}`,
            weight * 0.8
          ));
        }
      });

      // Process return type
      const returnTypeNode = node.getReturnTypeNode();
      if (returnTypeNode) {
        tokens.push(this.createToken(
          `returns_${returnTypeNode.getText()}`,
          weight * 0.8
        ));
      }
    }

    return tokens;
  }

  /**
   * Processes class declarations
   */
  private processClassDeclaration(node: ClassDeclaration, weight: number): WeightedToken[] {
    const tokens: WeightedToken[] = [];
    const name = node.getName();

    if (name) {
      tokens.push(this.createToken(`class_${name}`, weight));

      // Process implemented interfaces
      node.getImplements().forEach(impl => {
        tokens.push(this.createToken(
          `implements_${impl.getText()}`,
          weight * 0.9
        ));
      });
    }

    return tokens;
  }

  /**
   * Processes interface declarations
   */
  private processInterfaceDeclaration(node: InterfaceDeclaration, weight: number): WeightedToken[] {
    const tokens: WeightedToken[] = [];
    const name = node.getName();

    if (name) {
      tokens.push(this.createToken(`interface_${name}`, weight));

      // Process extended interfaces
      node.getExtends().forEach(ext => {
        tokens.push(this.createToken(
          `extends_${ext.getText()}`,
          weight * 0.9
        ));
      });
    }

    return tokens;
  }

  /**
   * Processes method declarations
   */
  private processMethodDeclaration(node: MethodDeclaration, weight: number): WeightedToken[] {
    const tokens: WeightedToken[] = [];
    const name = node.getName();

    tokens.push(this.createToken(`method_${name}`, weight));

    // Process parameters
    node.getParameters().forEach(param => {
      const paramName = param.getName();
      const typeNode = param.getTypeNode();
      if (typeNode) {
        tokens.push(this.createToken(
          `param_${paramName}_${typeNode.getText()}`,
          weight * 0.8
        ));
      }
    });

    return tokens;
  }

  /**
   * Processes property declarations
   */
  private processPropertyDeclaration(node: PropertyDeclaration, weight: number): WeightedToken[] {
    const tokens: WeightedToken[] = [];
    const name = node.getName();

    tokens.push(this.createToken(`prop_${name}`, weight));

    const typeNode = node.getTypeNode();
    if (typeNode) {
      tokens.push(this.createToken(
        `proptype_${typeNode.getText()}`,
        weight * 0.8
      ));
    }

    return tokens;
  }

  /**
   * Processes import declarations
   */
  private processImportDeclaration(node: ImportDeclaration, weight: number): WeightedToken[] {
    const tokens: WeightedToken[] = [];

    const moduleSpecifier = node.getModuleSpecifier().getText();
    tokens.push(this.createToken(
      `import_${moduleSpecifier.replace(/['"`]/g, '')}`,
      weight
    ));

    // Process named imports
    const namedImports = node.getNamedImports();
    namedImports.forEach(named => {
      tokens.push(this.createToken(
        `import_named_${named.getName()}`,
        weight * 0.8
      ));
    });

    return tokens;
  }

  /**
   * Creates a weighted token
   */
  private createToken(token: string, weight: number): WeightedToken {
    return { token: token.toLowerCase(), weight };
  }

  /**
   * Determines if a node should be skipped during processing
   */
  private shouldSkipNode(node: Node): boolean {
    const skipKinds = new Set([
      SyntaxKind.EndOfFileToken,
      SyntaxKind.SemicolonToken,
      SyntaxKind.CommaToken,
      SyntaxKind.OpenBraceToken,
      SyntaxKind.CloseBraceToken,
      SyntaxKind.OpenParenToken,
      SyntaxKind.CloseParenToken,
      SyntaxKind.WhitespaceTrivia,
      SyntaxKind.NewLineTrivia,
      SyntaxKind.SingleLineCommentTrivia,
      SyntaxKind.MultiLineCommentTrivia,
      SyntaxKind.JSDocComment,
      SyntaxKind.JSDoc
    ]);

    return skipKinds.has(node.getKind());
  }
}

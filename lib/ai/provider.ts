export interface AiProvider {
  generateText(input: { system: string; prompt: string }): Promise<string>;
}

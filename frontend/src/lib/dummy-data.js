export const CURRENT_USER = {
  name: "Alex Chen",
  email: "alex@researchiq.app",
  initials: "AC",
}

export const PAPERS = [
  {
    id: "attention",
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    journal: "NeurIPS",
    year: 2017,
    status: "indexed",
    pages: 15,
    collection: "Transformer Models",
  },
  {
    id: "bert",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: "Devlin et al.",
    journal: "NAACL",
    year: 2019,
    status: "indexed",
    pages: 16,
    collection: "Transformer Models",
  },
  {
    id: "gpt4",
    title: "GPT-4 Technical Report",
    authors: "OpenAI",
    journal: "arXiv preprint",
    year: 2023,
    status: "indexed",
    pages: 100,
    collection: "NLP Benchmarks",
  },
  {
    id: "llama2",
    title: "Llama 2: Open Foundation and Fine-Tuned Chat Models",
    authors: "Touvron et al.",
    journal: "arXiv preprint",
    year: 2023,
    status: "processing",
    pages: 77,
    collection: "Transformer Models",
  },
  {
    id: "rag",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    authors: "Lewis et al.",
    journal: "NeurIPS",
    year: 2020,
    status: "indexed",
    pages: 19,
    collection: "NLP Benchmarks",
  },
  {
    id: "cot",
    title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    authors: "Wei et al.",
    journal: "arXiv preprint",
    year: 2022,
    status: "indexed",
    pages: 43,
    collection: "To Review",
  },
  {
    id: "instructgpt",
    title: "Training Language Models to Follow Instructions with Human Feedback",
    authors: "Ouyang et al.",
    journal: "NeurIPS",
    year: 2022,
    status: "processing",
    pages: 68,
    collection: "To Review",
  },
]

const COLLECTION_NAMES = ["Transformer Models", "NLP Benchmarks", "To Review"]

export const COLLECTIONS = COLLECTION_NAMES.map((name) => ({
  name,
  count: PAPERS.filter((paper) => paper.collection === name).length,
}))

export const RECENT_CHATS = [
  { id: "chat-1", title: "Comparing attention mechanisms across papers", time: "2h ago", active: true },
  { id: "chat-2", title: "BERT vs GPT-4 architecture differences", time: "Yesterday", active: false },
  { id: "chat-3", title: "Summarizing the RAG survey", time: "3 days ago", active: false },
  { id: "chat-4", title: "Chain-of-thought reasoning benchmarks", time: "Last week", active: false },
]

export const SUGGESTED_PROMPTS = [
  "Summarize the key contributions of these papers",
  "Compare the evaluation methods used",
  "What are the main research gaps?",
  "List all cited benchmarks",
]

export const INITIAL_CONVERSATION = [
  {
    id: "m1",
    role: "user",
    content: "Can you summarize the key contribution of 'Attention Is All You Need'?",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "The paper introduces the Transformer, a sequence-to-sequence architecture that replaces recurrence entirely with self-attention. By attending to all positions in a sequence in parallel, it trains significantly faster than RNN- or CNN-based models while achieving state-of-the-art results on machine translation.",
    citations: [
      { paperId: "attention", paperTitle: "Attention Is All You Need", page: 2 },
      { paperId: "attention", paperTitle: "Attention Is All You Need", page: 7 },
    ],
  },
  {
    id: "m3",
    role: "user",
    content: "How does BERT build on that idea?",
  },
  {
    id: "m4",
    role: "assistant",
    content:
      "BERT keeps the Transformer's encoder stack but changes the training objective. Instead of predicting the next token, it's pretrained with masked language modeling and next-sentence prediction, which lets it learn deeply bidirectional representations rather than the left-to-right context used in the original decoder.",
    citations: [
      { paperId: "bert", paperTitle: "BERT", page: 4 },
      { paperId: "attention", paperTitle: "Attention Is All You Need", page: 3 },
    ],
  },
  {
    id: "m5",
    role: "user",
    content: "What evaluation benchmarks does the GPT-4 report focus on?",
  },
  {
    id: "m6",
    role: "assistant",
    content:
      "The GPT-4 technical report evaluates performance across academic benchmarks like MMLU, HellaSwag, and ARC, plus a range of professional and academic exams — including a simulated bar exam, where it scores in the top 10% of test takers. It also reports results on multilingual MMLU and visual input tasks.",
    citations: [
      { paperId: "gpt4", paperTitle: "GPT-4 Technical Report", page: 11 },
      { paperId: "gpt4", paperTitle: "GPT-4 Technical Report", page: 14 },
    ],
  },
]

/** Canned replies cycled through when the demo user sends a new message (no backend/AI attached). */
export const CANNED_REPLIES = [
  {
    content:
      "Across your library, the strongest agreement is on using held-out benchmark suites rather than perplexity alone — most papers pair automatic metrics with human or exam-style evaluation.",
    citations: [
      { paperId: "gpt4", paperTitle: "GPT-4 Technical Report", page: 11 },
      { paperId: "cot", paperTitle: "Chain-of-Thought Prompting", page: 9 },
    ],
  },
  {
    content:
      "The RAG survey and Llama 2 report both highlight retrieval and fine-tuning as ways to reduce hallucination, though they measure it differently — factual QA accuracy versus human preference ratings.",
    citations: [
      { paperId: "rag", paperTitle: "RAG Survey", page: 6 },
      { paperId: "llama2", paperTitle: "Llama 2", page: 22 },
    ],
  },
  {
    content:
      "One gap worth noting: none of these papers directly compare inference cost against reasoning accuracy — that tradeoff is only discussed qualitatively, not benchmarked.",
    citations: [
      { paperId: "instructgpt", paperTitle: "InstructGPT", page: 13 },
      { paperId: "bert", paperTitle: "BERT", page: 8 },
    ],
  },
]

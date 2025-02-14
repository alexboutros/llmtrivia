
# opentdb-llm-tester

  

A simple tool that fetches a single trivia question from the [Open Trivia Database](https://opentdb.com/) with optional automatic copy to clipboard. I created this primarily to generate questions for testing LLMs.

  

## Usage

  

Just run:

  

```bash

llmtest

```

  

## Flags (optional)


**-c** `Automatically copy the fetched question to your clipboard`   
**-type=multiple** `Force only multiple-choice questions`   
*or*   
**-type=boolean** `Force only true/false questions`   

  

```bash

llmtest -c -type=boolean

```  

## Example Output

```

┌────────────────────────────────────────────────────┐
│ Question:                                          │
│ What is the capital of France?                     │
│                                                    │
│ Answers:                                           │
│ 1. Berlin                                          │
│ 2. Rome                                            │
│ 3. Madrid                                          │
│ 4. * Paris                                         │
└────────────────────────────────────────────────────┘

```

`*` indicates the correct answer.
